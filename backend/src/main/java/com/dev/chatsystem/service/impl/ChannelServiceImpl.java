package com.dev.chatsystem.service.impl;

import com.dev.chatsystem.dto.request.CreateChannelGroupRequest;
import com.dev.chatsystem.dto.request.CreateChannelRequest;
import com.dev.chatsystem.dto.request.CreateDMChannelRequest;
import com.dev.chatsystem.dto.response.ChannelGroupResponse;
import com.dev.chatsystem.dto.response.ChannelResponse;
import com.dev.chatsystem.dto.response.DMChannelResponse;
import com.dev.chatsystem.exception.AppException;
import com.dev.chatsystem.exception.ErrorCode;
import com.dev.chatsystem.model.*;
import com.dev.chatsystem.repository.*;
import com.dev.chatsystem.security.ChannelPermissionEvaluator;
import com.dev.chatsystem.service.ChannelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of ChannelService managing Server Categories, Guild Channels,
 * and DM Channels.
 */
@Service
@RequiredArgsConstructor
public class ChannelServiceImpl implements ChannelService {

    private final ChannelRepository channelRepository;
    private final ChannelGroupRepository channelGroupRepository;
    private final GuildChannelRepository guildChannelRepository;
    private final DMChannelRepository dmChannelRepository;
    private final ServerRepository serverRepository;
    private final ServerMemberRepository serverMemberRepository;
    private final UserRepository userRepository;
    private final PermissionOverrideRepository permissionOverrideRepository;
    private final ServerRoleRepository serverRoleRepository;
    private final ChannelPermissionEvaluator channelPermissionEvaluator;

    /**
     * Checks if a user has management permissions (Server Owner or MANAGE_CHANNEL role permission).
     */
    private boolean canManageChannel(Server server, User user) {
        if (server.getOwner().getId().equals(user.getId())) {
            return true;
        }
        return serverMemberRepository.findByServerIdAndUserId(server.getId(), user.getId())
                .map(member -> {
                    if (member.getRoles() == null) return false;
                    return member.getRoles().stream()
                            .anyMatch(role -> role.getPermissions() != null
                                    && role.getPermissions().contains(ServerPermission.MANAGE_CHANNEL));
                })
                .orElse(false);
    }

    /**
     * Creates a new ChannelGroup (Category) inside a server.
     * Verifies that the server exists and that the requesting user is the server
     * owner.
     */
    @Override
    @Transactional
    public ChannelGroupResponse createChannelGroup(User currentUser, Long serverId, CreateChannelGroupRequest request) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!server.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Chỉ chủ server mới có thể tạo nhóm kênh");
        }

        ChannelGroup group = ChannelGroup.builder()
                .server(server)
                .name(request.getName().trim())
                .position(request.getPosition())
                .build();

        return ChannelGroupResponse.fromEntity(channelGroupRepository.save(group));
    }

    /**
     * Retrieves all channel groups for a given server, verifying that the user is a
     * member of the server.
     */
    @Override
    public List<ChannelGroupResponse> getServerChannelGroups(User currentUser, Long serverId) {
        if (!serverMemberRepository.existsByServerIdAndUserId(serverId, currentUser.getId())) {
            throw new AppException(ErrorCode.NOT_ROOM_MEMBER);
        }

        List<ChannelGroup> groups = channelGroupRepository.findByServerIdOrderByPositionAsc(serverId);
        return groups.stream().map(ChannelGroupResponse::fromEntity).toList();
    }

    /**
     * Creates a new GuildChannel under a specific ChannelGroup or the server's
     * default group.
     * Business logic:
     * 1. If groupId is provided, verifies that group exists and matches the server.
     * 2. If groupId is omitted but serverId is provided, locates or creates a
     * default "TEXT CHANNELS" group.
     * 3. Verifies that the current user is the owner of the server.
     * 4. Normalizes the channel name to lowercase kebab-case (e.g. "General Chat"
     * -> "general-chat").
     * 5. Saves and returns the channel response.
     */
    @Override
    @Transactional
    public ChannelResponse createGuildChannel(User currentUser, CreateChannelRequest request) {
        ChannelGroup group = null;

        if (request.getGroupId() != null) {
            group = channelGroupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND, "Không tìm thấy nhóm kênh"));
        } else if (request.getServerId() != null) {
            Server server = serverRepository.findById(request.getServerId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
            List<ChannelGroup> existingGroups = channelGroupRepository.findByServerIdOrderByPositionAsc(server.getId());
            if (!existingGroups.isEmpty()) {
                group = existingGroups.get(0);
            } else {
                group = channelGroupRepository.save(ChannelGroup.builder()
                        .server(server)
                        .name("TEXT CHANNELS")
                        .position(0)
                        .build());
            }
        } else {
            throw new AppException(ErrorCode.ROOM_NOT_FOUND, "Cần cung cấp groupId hoặc serverId");
        }

        Server server = group.getServer();
        if (!canManageChannel(server, currentUser)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền tạo kênh trong máy chủ này");
        }

        GuildChannel channel = GuildChannel.builder()
                .group(group)
                .name(request.getName().trim().toLowerCase().replaceAll("\\s+", "-"))
                .position(request.getPosition())
                .type(request.getType() != null ? request.getType() : ChannelType.GUILD_TEXT)
                .build();

        GuildChannel saved = guildChannelRepository.save(channel);

        // If channel is marked as private during creation:
        boolean isPrivate = Boolean.TRUE.equals(request.getIsPrivate());
        if (isPrivate) {
            ServerRole defaultRole = serverRoleRepository.findByServerIdAndName(server.getId(), "Member")
                    .or(() -> serverRoleRepository.findByServerIdAndName(server.getId(), "@everyone"))
                    .orElseGet(() -> {
                        List<ServerRole> rList = serverRoleRepository.findByServerIdOrderByPositionAsc(server.getId());
                        return rList.isEmpty() ? null : rList.get(0);
                    });

            if (defaultRole != null) {
                PermissionOverride defaultOverride = PermissionOverride.builder()
                        .channel(saved)
                        .role(defaultRole)
                        .denyPermission(new ArrayList<>(List.of(ServerPermission.READ_MESSAGE)))
                        .allowPermission(new ArrayList<>())
                        .build();
                permissionOverrideRepository.save(defaultOverride);
            }

            if (request.getAllowedRoleIds() != null && !request.getAllowedRoleIds().isEmpty()) {
                List<ServerRole> allowedRoles = serverRoleRepository.findAllById(request.getAllowedRoleIds());
                for (ServerRole role : allowedRoles) {
                    if (role.getServer().getId().equals(server.getId())
                            && (defaultRole == null || !role.getId().equals(defaultRole.getId()))) {
                        PermissionOverride roleOverride = PermissionOverride.builder()
                                .channel(saved)
                                .role(role)
                                .allowPermission(new ArrayList<>(List.of(ServerPermission.READ_MESSAGE, ServerPermission.SEND_MESSAGE)))
                                .denyPermission(new ArrayList<>())
                                .build();
                        permissionOverrideRepository.save(roleOverride);
                    }
                }
            }
        }

        Set<String> myPerms = EnumSet.allOf(ServerPermission.class).stream().map(Enum::name).collect(Collectors.toSet());
        return ChannelResponse.fromGuildChannel(saved, isPrivate, myPerms);
    }

    /**
     * Returns guild channels in a server visible to the current user,
     * resolved through Discord's permission inheritance algorithm.
     */
    @Override
    public List<ChannelResponse> getServerChannels(User currentUser, Long serverId) {
        ServerMember member = serverMemberRepository.findByServerIdAndUserId(serverId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_ROOM_MEMBER));

        Server server = member.getServer();
        boolean isOwner = server.getOwner().getId().equals(currentUser.getId());
        List<GuildChannel> channels = guildChannelRepository.findByServerId(serverId);

        List<ChannelResponse> visibleChannels = new ArrayList<>();
        for (GuildChannel channel : channels) {
            List<PermissionOverride> overrides = permissionOverrideRepository.findByChannelId(channel.getId());
            boolean isPrivate = channelPermissionEvaluator.isPrivateChannel(overrides);

            if (isOwner) {
                Set<String> perms = EnumSet.allOf(ServerPermission.class).stream().map(Enum::name).collect(Collectors.toSet());
                visibleChannels.add(ChannelResponse.fromGuildChannel(channel, isPrivate, perms));
            } else {
                Set<ServerPermission> computed = channelPermissionEvaluator.computeChannelPermissions(member, channel, overrides);
                if (computed.contains(ServerPermission.READ_MESSAGE)) {
                    Set<String> perms = computed.stream().map(Enum::name).collect(Collectors.toSet());
                    visibleChannels.add(ChannelResponse.fromGuildChannel(channel, isPrivate, perms));
                }
            }
        }

        return visibleChannels;
    }

    @Override
    public List<com.dev.chatsystem.dto.response.PermissionOverrideResponse> getChannelPermissions(User currentUser,
            Long channelId) {
        GuildChannel channel = guildChannelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND));

        Long serverId = channel.getGroup().getServer().getId();
        if (!serverMemberRepository.existsByServerIdAndUserId(serverId, currentUser.getId())) {
            throw new AppException(ErrorCode.NOT_ROOM_MEMBER);
        }

        List<PermissionOverride> overrides = permissionOverrideRepository.findByChannelId(channelId);
        return overrides.stream().map(com.dev.chatsystem.dto.response.PermissionOverrideResponse::fromEntity).toList();
    }

    @Override
    @Transactional
    public com.dev.chatsystem.dto.response.PermissionOverrideResponse setChannelPermissionOverride(
            User currentUser, Long channelId, com.dev.chatsystem.dto.request.SetPermissionOverrideRequest request) {
        GuildChannel channel = guildChannelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND));

        Server server = channel.getGroup().getServer();
        if (!canManageChannel(server, currentUser)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền phân quyền kênh này");
        }

        ServerRole role = serverRoleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy vai trò"));

        if (!role.getServer().getId().equals(server.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Vai trò không thuộc server này");
        }

        PermissionOverride override = permissionOverrideRepository.findByChannelIdAndRoleId(channelId, role.getId())
                .orElseGet(() -> PermissionOverride.builder()
                        .channel(channel)
                        .role(role)
                        .build());

        override.setAllowPermission(
                request.getAllowPermissions() != null ? new ArrayList<>(request.getAllowPermissions())
                        : new ArrayList<>());
        override.setDenyPermission(request.getDenyPermissions() != null ? new ArrayList<>(request.getDenyPermissions())
                : new ArrayList<>());

        PermissionOverride saved = permissionOverrideRepository.save(override);
        return com.dev.chatsystem.dto.response.PermissionOverrideResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteChannelPermissionOverride(User currentUser, Long channelId, Long roleId) {
        GuildChannel channel = guildChannelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND));

        Server server = channel.getGroup().getServer();
        if (!canManageChannel(server, currentUser)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền xóa quyền kênh");
        }

        permissionOverrideRepository.deleteByChannelIdAndRoleId(channelId, roleId);
    }

    @Override
    @Transactional
    public void deleteChannel(User currentUser, Long channelId) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND));

        if (channel instanceof GuildChannel guildChannel) {
            if (!canManageChannel(guildChannel.getGroup().getServer(), currentUser)) {
                throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền xóa kênh này");
            }
        }

        channelRepository.delete(channel);
    }

    @Override
    @Transactional
    public ChannelResponse toggleChannelPrivacy(User currentUser, Long channelId, boolean isPrivate) {
        GuildChannel channel = guildChannelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_FOUND));

        Server server = channel.getGroup().getServer();
        if (!canManageChannel(server, currentUser)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không có quyền chỉnh sửa kênh này");
        }

        ServerRole defaultRole = serverRoleRepository.findByServerIdAndName(server.getId(), "Member")
                .or(() -> serverRoleRepository.findByServerIdAndName(server.getId(), "@everyone"))
                .orElseGet(() -> {
                    List<ServerRole> rList = serverRoleRepository.findByServerIdOrderByPositionAsc(server.getId());
                    return rList.isEmpty() ? null : rList.get(0);
                });

        if (defaultRole != null) {
            PermissionOverride override = permissionOverrideRepository.findByChannelIdAndRoleId(channelId, defaultRole.getId())
                    .orElseGet(() -> PermissionOverride.builder()
                            .channel(channel)
                            .role(defaultRole)
                            .allowPermission(new ArrayList<>())
                            .denyPermission(new ArrayList<>())
                            .build());

            List<ServerPermission> denies = override.getDenyPermission() != null
                    ? new ArrayList<>(override.getDenyPermission())
                    : new ArrayList<>();

            if (isPrivate) {
                if (!denies.contains(ServerPermission.READ_MESSAGE)) {
                    denies.add(ServerPermission.READ_MESSAGE);
                }
            } else {
                denies.remove(ServerPermission.READ_MESSAGE);
            }
            override.setDenyPermission(denies);
            permissionOverrideRepository.save(override);
        }

        List<PermissionOverride> overrides = permissionOverrideRepository.findByChannelId(channelId);
        boolean actualIsPrivate = channelPermissionEvaluator.isPrivateChannel(overrides);
        Set<String> perms = EnumSet.allOf(ServerPermission.class).stream().map(Enum::name).collect(Collectors.toSet());

        return ChannelResponse.fromGuildChannel(channel, actualIsPrivate, perms);
    }

    /**
     * Initiates or retrieves an existing Direct Message channel.
     * Business logic:
     * 1. Collects unique recipients including the currentUser and target user(s).
     * 2. If it is a 1-on-1 chat (exactly 2 recipients), queries dmChannelRepository
     * to see
     * if an existing direct channel already connects them. Returns existing channel
     * if found.
     * 3. Otherwise, creates a new DMChannel record (with isGroup = true for > 2
     * recipients) and persists it.
     */
    @Override
    @Transactional
    public DMChannelResponse getOrCreateDMChannel(User currentUser, CreateDMChannelRequest request) {
        List<User> recipients = new ArrayList<>();
        recipients.add(currentUser);

        if (request.getRecipientIds() != null) {
            for (Long recipientId : request.getRecipientIds()) {
                if (!recipientId.equals(currentUser.getId())) {
                    User user = userRepository.findById(recipientId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                    recipients.add(user);
                }
            }
        }

        boolean isGroup = recipients.size() > 2;

        if (!isGroup && recipients.size() == 2) {
            User other = recipients.get(1);
            var existing = dmChannelRepository.findDirectDmBetween(currentUser, other);
            if (existing.isPresent()) {
                return DMChannelResponse.fromEntity(existing.get());
            }
        }

        DMChannel dmChannel = DMChannel.builder()
                .name(isGroup ? request.getName() : null)
                .isGroup(isGroup)
                .recipients(recipients)
                .build();

        return DMChannelResponse.fromEntity(dmChannelRepository.save(dmChannel));
    }

    /**
     * Lists all DM conversations involving the current user.
     */
    @Override
    public List<DMChannelResponse> getUserDMChannels(User currentUser) {
        List<DMChannel> list = dmChannelRepository.findByUser(currentUser);
        return list.stream().map(DMChannelResponse::fromEntity).toList();
    }
}
