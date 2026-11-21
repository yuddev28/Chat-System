package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.Attachment;
import com.dev.chatsystem.model.Message;
import com.dev.chatsystem.model.Reaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private String content;
    private boolean isPinned;
    private LocalDateTime pinnedAt;
    private UserResponse sender;
    private Long replyToId;
    private ReplyToResponse replyTo;
    private Long channelId;
    private List<AttachmentResponse> attachments;
    private List<ReactionResponse> reactions;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReplyToResponse {
        private Long id;
        private String content;
        private String senderName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttachmentResponse {
        private Long id;
        private String fileUrl;
        private String fileType;
        private int fileSize;

        public static AttachmentResponse fromEntity(Attachment a) {
            if (a == null) return null;
            return AttachmentResponse.builder()
                    .id(a.getId())
                    .fileUrl(a.getFileUrl())
                    .fileType(a.getFileType())
                    .fileSize(a.getFileSize())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReactionResponse {
        private Long id;
        private String emoji;
        private Long userId;
        private String username;

        public static ReactionResponse fromEntity(Reaction r) {
            if (r == null) return null;
            return ReactionResponse.builder()
                    .id(r.getId())
                    .emoji(r.getEmoji())
                    .userId(r.getUser() != null ? r.getUser().getId() : null)
                    .username(r.getUser() != null ? r.getUser().getUsername() : null)
                    .build();
        }
    }

    public static MessageResponse fromEntity(Message msg) {
        if (msg == null) return null;
        return MessageResponse.builder()
                .id(msg.getId())
                .content(msg.getContent())
                .isPinned(msg.isPinned())
                .pinnedAt(msg.getPinnedAt())
                .sender(UserResponse.fromEntity(msg.getSender()))
                .replyToId(msg.getReplyTo() != null ? msg.getReplyTo().getId() : null)
                .replyTo(msg.getReplyTo() != null ? ReplyToResponse.builder()
                        .id(msg.getReplyTo().getId())
                        .content(msg.getReplyTo().getContent())
                        .senderName(msg.getReplyTo().getSender() != null ? msg.getReplyTo().getSender().getUsername() : null)
                        .build() : null)
                .channelId(msg.getChannel() != null ? msg.getChannel().getId() : null)
                .attachments(msg.getAttachments() != null
                        ? msg.getAttachments().stream().map(AttachmentResponse::fromEntity).collect(Collectors.toList())
                        : List.of())
                .reactions(msg.getReactions() != null
                        ? msg.getReactions().stream().map(ReactionResponse::fromEntity).collect(Collectors.toList())
                        : List.of())
                .createdAt(msg.getCreatedAt())
                .deletedAt(msg.getDeletedAt())
                .updatedAt(msg.getUpdatedAt())
                .build();
    }
}
