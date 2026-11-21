package com.dev.chatsystem.service.impl;

import com.dev.chatsystem.dto.request.SendMessageRequest;
import com.dev.chatsystem.dto.response.MessageResponse;
import com.dev.chatsystem.dto.response.PageResponse;
import com.dev.chatsystem.exception.AppException;
import com.dev.chatsystem.exception.ErrorCode;
import com.dev.chatsystem.model.*;
import com.dev.chatsystem.repository.*;
import com.dev.chatsystem.security.ChannelPermissionEvaluator;
import com.dev.chatsystem.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of ChatService responsible for message lifecycle, reactions, pins, and WebSocket broadcasts.
 */
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final ServerMemberRepository serverMemberRepository;
    private final ReactionRepository reactionRepository;
    private final AttachmentRepository attachmentRepository;
    private final DMChannelRepository dmChannelRepository;
    private final PermissionOverrideRepository permissionOverrideRepository;
    private final ChannelPermissionEvaluator channelPermissionEvaluator;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Sends a message into a channel with comprehensive validation and side effects.
     * Business logic:
     * 1. Finds the channel and ensures the sender has authorization to post (server membership or DM participant).
     * 2. Resolves optional replyTo parent message if replying to an existing thread.
     * 3. Persists the core Message entity.
     * 4. Persists any attached files or images associated with this message.
     * 5. If the destination is a DMChannel, updates its lastMessageAt for sorting recent conversations.
     * 6. Converts the entity to MessageResponse and broadcasts immediately via STOMP broker topic (/topic/channel/{id}).
     */
    @Override
    @Transactional
    public MessageResponse sendMessage(User sender, Long channelId, SendMessageRequest request) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND));

        validateChannelAccess(sender, channel, ServerPermission.SEND_MESSAGE);

        Message replyTo = null;
        if (request.getReplyToId() != null) {
            replyTo = messageRepository.findById(request.getReplyToId()).orElse(null);
        }
        
        // Check that the message has either content or attachments; both cannot be empty
        if((request.getContent() == null || request.getContent().isBlank())
                && (request.getAttachments() == null || request.getAttachments().isEmpty())) {
            throw new AppException(ErrorCode.INVALID_INPUT, "Nội dung tin nhắn không được để trống");
        }

        Message message = Message.builder()
                .channel(channel)
                .sender(sender)
                .content(request.getContent() != null ? request.getContent().trim() : "")
                .replyTo(replyTo)
                .isPinned(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        // Save attachments if provided
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            List<Attachment> attachments = new ArrayList<>();
            for (var attReq : request.getAttachments()) {
                Attachment att = Attachment.builder()
                        .message(savedMessage)
                        .fileUrl(attReq.getFileUrl())
                        .fileType(attReq.getFileType())
                        .fileSize(attReq.getFileSize())
                        .build();
                attachments.add(attachmentRepository.save(att));
            }
            savedMessage.setAttachments(attachments);
        }

        // Update lastMessageAt timestamp for DM channels to bump recent chat order
        if (channel instanceof DMChannel dm) {
            dm.setLastMessageAt(LocalDateTime.now());
            dmChannelRepository.save(dm);
        }

        MessageResponse response = MessageResponse.fromEntity(savedMessage);
        messagingTemplate.convertAndSend("/topic/channel/" + channel.getId(), response);

        return response;
    }

    /**
     * Loads paginated messages for a channel in reverse chronological order.
     */
    @Override
    public PageResponse<MessageResponse> getChannelMessages(User currentUser, Long channelId, int page, int size) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND));

        validateChannelAccess(currentUser, channel);

        Pageable pageable = PageRequest.of(page > 0 ? page - 1 : 0, size);
        Page<Message> messagePage = messageRepository.findByChannelIdOrderByCreatedAtDesc(channelId, pageable);

        List<MessageResponse> items = messagePage.getContent().stream()
                .map(MessageResponse::fromEntity)
                .toList();

        return PageResponse.<MessageResponse>builder()
                .currentPage(page)
                .pageNo(page)
                .pageSize(size)
                .totalPages(messagePage.getTotalPages())
                .totalElements(messagePage.getTotalElements())
                .last(messagePage.isLast())
                .content(items)
                .build();
    }

    /**
     * Retrieves all pinned messages in the specified channel.
     */
    @Override
    public List<MessageResponse> getPinnedMessages(User currentUser, Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND));

        validateChannelAccess(currentUser, channel);

        List<Message> pinned = messageRepository.findByChannelIdAndIsPinnedTrueOrderByPinnedAtDesc(channelId);
        return pinned.stream().map(MessageResponse::fromEntity).toList();
    }

    /**
     * Toggles pin status for a message and records the pin timestamp.
     */
    @Override
    @Transactional
    public MessageResponse togglePinMessage(User currentUser, Long messageId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        validateChannelAccess(currentUser, msg.getChannel(), ServerPermission.READ_MESSAGE);

        if (msg.getChannel() instanceof GuildChannel guildChannel) {
            Server server = guildChannel.getGroup().getServer();
            boolean isOwner = server.getOwner().getId().equals(currentUser.getId());
            if (!isOwner) {
                ServerMember member = serverMemberRepository.findByServerIdAndUserId(server.getId(), currentUser.getId())
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_ROOM_MEMBER));
                List<PermissionOverride> overrides = permissionOverrideRepository.findByChannelId(guildChannel.getId());
                Set<ServerPermission> perms = channelPermissionEvaluator.computeChannelPermissions(member, guildChannel, overrides);
                if (!perms.contains(ServerPermission.MANAGE_MESSAGES) && !perms.contains(ServerPermission.MANAGE_CHANNEL)) {
                    throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền ghim tin nhắn trong kênh này");
                }
            }
        }

        msg.setPinned(!msg.isPinned());
        msg.setPinnedAt(msg.isPinned() ? LocalDateTime.now() : null);
        Message saved = messageRepository.save(msg);

        return MessageResponse.fromEntity(saved);
    }

    /**
     * Soft deletes a message by setting deletedAt timestamp, verifying ownership or MANAGE_MESSAGES.
     */
    @Override
    @Transactional
    public void deleteMessage(User currentUser, Long messageId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        boolean isSender = msg.getSender().getId().equals(currentUser.getId());
        if (!isSender) {
            if (msg.getChannel() instanceof GuildChannel guildChannel) {
                Server server = guildChannel.getGroup().getServer();
                boolean isOwner = server.getOwner().getId().equals(currentUser.getId());
                if (!isOwner) {
                    ServerMember member = serverMemberRepository.findByServerIdAndUserId(server.getId(), currentUser.getId())
                            .orElseThrow(() -> new AppException(ErrorCode.NOT_ROOM_MEMBER));
                    List<PermissionOverride> overrides = permissionOverrideRepository.findByChannelId(guildChannel.getId());
                    Set<ServerPermission> perms = channelPermissionEvaluator.computeChannelPermissions(member, guildChannel, overrides);
                    if (!perms.contains(ServerPermission.MANAGE_MESSAGES) && !perms.contains(ServerPermission.MANAGE_CHANNEL)) {
                        throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền xóa tin nhắn của người khác");
                    }
                }
            } else {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn chỉ có thể xóa tin nhắn của chính mình");
            }
        }

        msg.setDeletedAt(LocalDateTime.now());
        messageRepository.save(msg);
    }

    /**
     * Adds an emoji reaction to a message if not already reacted by the user.
     */
    @Override
    @Transactional
    public MessageResponse addReaction(User currentUser, Long messageId, String emoji) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        validateChannelAccess(currentUser, msg.getChannel(), ServerPermission.READ_MESSAGE);

        var existing = reactionRepository.findByMessageAndUserAndEmoji(msg, currentUser, emoji);
        if (existing.isEmpty()) {
            Reaction r = Reaction.builder()
                    .message(msg)
                    .user(currentUser)
                    .emoji(emoji)
                    .build();
            reactionRepository.save(r);
        }

        Message updatedMsg = messageRepository.findById(messageId).orElse(msg);
        return MessageResponse.fromEntity(updatedMsg);
    }

    /**
     * Removes an emoji reaction previously added by the user.
     */
    @Override
    @Transactional
    public MessageResponse removeReaction(User currentUser, Long messageId, String emoji) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        validateChannelAccess(currentUser, msg.getChannel(), ServerPermission.READ_MESSAGE);

        reactionRepository.findByMessageAndUserAndEmoji(msg, currentUser, emoji)
                .ifPresent(reactionRepository::delete);

        Message updatedMsg = messageRepository.findById(messageId).orElse(msg);
        return MessageResponse.fromEntity(updatedMsg);
    }

    /**
     * Validates that the user has permission to view and interact with the channel.
     * For Guild channels, checks membership and evaluates effective permissions.
     * For DM channels, checks that the user is included in the recipients list.
     */
    private void validateChannelAccess(User user, Channel channel) {
        validateChannelAccess(user, channel, ServerPermission.READ_MESSAGE);
    }

    private void validateChannelAccess(User user, Channel channel, ServerPermission requiredPerm) {
        if (channel instanceof GuildChannel guildChannel) {
            Server server = guildChannel.getGroup().getServer();
            Long serverId = server.getId();
            ServerMember member = serverMemberRepository.findByServerIdAndUserId(serverId, user.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_ROOM_MEMBER, "Bạn không phải thành viên của server này"));

            // Server owner always has full access
            if (server.getOwner().getId().equals(user.getId())) {
                return;
            }

            List<PermissionOverride> overrides = permissionOverrideRepository.findByChannelId(guildChannel.getId());
            Set<ServerPermission> perms = channelPermissionEvaluator.computeChannelPermissions(member, guildChannel, overrides);

            if (requiredPerm != null && !perms.contains(requiredPerm)) {
                if (requiredPerm == ServerPermission.SEND_MESSAGE) {
                    throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền gửi tin nhắn trong kênh này");
                }
                throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền xem kênh này");
            }
        } else if (channel instanceof DMChannel dmChannel) {
            boolean isMember = dmChannel.getRecipients().stream()
                    .anyMatch(u -> u.getId().equals(user.getId()));
            if (!isMember) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không tham gia kênh chat này");
            }
        }
    }
}
