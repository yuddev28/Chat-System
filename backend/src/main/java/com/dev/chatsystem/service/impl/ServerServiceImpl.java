package com.dev.chatsystem.service.impl;

import com.dev.chatsystem.dto.request.AssignMemberRolesRequest;
import com.dev.chatsystem.dto.request.CreateRoleRequest;
import com.dev.chatsystem.dto.request.CreateServerRequest;
import com.dev.chatsystem.dto.response.ServerMemberResponse;
import com.dev.chatsystem.dto.response.ServerResponse;
import com.dev.chatsystem.dto.response.ServerRoleResponse;
import com.dev.chatsystem.exception.AppException;
import com.dev.chatsystem.exception.ErrorCode;
import com.dev.chatsystem.model.*;
import com.dev.chatsystem.repository.*;
import com.dev.chatsystem.service.ServerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Implementation of ServerService managing servers, memberships, roles, invite codes, and bans.
 */
@Service
@RequiredArgsConstructor
public class ServerServiceImpl implements ServerService {

    private final ServerRepository serverRepository;
    private final ServerMemberRepository serverMemberRepository;
    private final ServerRoleRepository serverRoleRepository;
    private final ServerBanRepository serverBanRepository;
    private final ChannelGroupRepository channelGroupRepository;
    private final GuildChannelRepository guildChannelRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new server workspace.
     * Business logic:
     * 1. Generates an 8-character unique invite code.
     * 2. Sets the currentUser as the server owner.
     * 3. Creates the standard "@everyone" role (with basic send/read permissions).
     * 4. Creates the "Admin" role (with all permissions enabled).
     * 5. Registers the creator as the first ServerMember with both roles.
     * 6. Initializes a default ChannelGroup ("TEXT CHANNELS") and default channel ("general").
     * 7. Returns the fully populated ServerResponse.
     */
    @Override
    @Transactional
    public ServerResponse createServer(User currentUser, CreateServerRequest request) {
        String inviteCode = UUID.randomUUID().toString().substring(0, 8);

        Server server = Server.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .invitedCode(inviteCode)
                .owner(currentUser)
                .build();

        Server savedServer = serverRepository.save(server);

        // Create default roles: Member (basic read/send) and Owner (all permissions)
        ServerRole memberRole = ServerRole.builder()
                .name("Member")
                .position(0)
                .server(savedServer)
                .permissions(Set.of(ServerPermission.READ_MESSAGE, ServerPermission.SEND_MESSAGE))
                .build();
        serverRoleRepository.save(memberRole);

        ServerRole ownerRole = ServerRole.builder()
                .name("Owner")
                .hexColor("#F59E0B")
                .position(1)
                .server(savedServer)
                .permissions(Set.of(ServerPermission.values()))
                .build();
        serverRoleRepository.save(ownerRole);

        // Register the owner as a member with the Owner role
        ServerMember ownerMember = ServerMember.builder()
                .server(savedServer)
                .user(currentUser)
                .displayName(currentUser.getUsername())
                .roles(new ArrayList<>(List.of(ownerRole, memberRole)))
                .build();
        serverMemberRepository.save(ownerMember);

        // Initialize default category and #general channel
        ChannelGroup textGroup = ChannelGroup.builder()
                .server(savedServer)
                .name("TEXT CHANNELS")
                .position(0)
                .build();
        ChannelGroup savedGroup = channelGroupRepository.save(textGroup);

        GuildChannel generalChannel = GuildChannel.builder()
                .name("general")
                .group(savedGroup)
                .position(0)
                .type(ChannelType.GUILD_TEXT)
                .build();
        guildChannelRepository.save(generalChannel);

        return getServerDetails(currentUser, savedServer.getId());
    }

    /**
     * Retrieves server details, ensuring the caller is an active member.
     */
    @Override
    public ServerResponse getServerDetails(User currentUser, Long serverId) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy server"));

        if (!serverMemberRepository.existsByServerIdAndUserId(serverId, currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn không phải thành viên của server này");
        }

        return ServerResponse.fromEntity(server);
    }

    /**
     * Lists all servers the current user belongs to.
     */
    @Override
    public List<ServerResponse> getUserServers(User currentUser) {
        List<ServerMember> memberships = serverMemberRepository.findByUser(currentUser);
        return memberships.stream()
                .map(m -> ServerResponse.fromEntity(m.getServer()))
                .toList();
    }

    /**
     * Admits a user to a server via invite code.
     * Business logic:
     * 1. Finds the server by invite code.
     * 2. Checks if the user is banned from this server.
     * 3. If already a member, simply returns the server details.
     * 4. Otherwise, assigns the default "@everyone" role and saves a new ServerMember record.
     */
    @Override
    @Transactional
    public ServerResponse joinServerByInviteCode(User currentUser, String inviteCode) {
        Server server = serverRepository.findByInvitedCode(inviteCode)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Mã mời không hợp lệ"));

        if (serverBanRepository.existsByServerIdAndUserId(server.getId(), currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Bạn đã bị cấm khỏi server này");
        }

        if (serverMemberRepository.existsByServerIdAndUserId(server.getId(), currentUser.getId())) {
            return getServerDetails(currentUser, server.getId());
        }

        ServerRole memberRole = serverRoleRepository.findByServerIdAndName(server.getId(), "Member")
                .or(() -> serverRoleRepository.findByServerIdAndName(server.getId(), "@everyone"))
                .orElse(null);

        List<ServerRole> roles = new ArrayList<>();
        if (memberRole != null) roles.add(memberRole);

        ServerMember member = ServerMember.builder()
                .server(server)
                .user(currentUser)
                .displayName(currentUser.getUsername())
                .roles(roles)
                .build();
        serverMemberRepository.save(member);

        return getServerDetails(currentUser, server.getId());
    }

    /**
     * Adds an existing user directly to a server by ID.
     */
    @Override
    @Transactional
    public ServerMemberResponse addMemberToServer(User currentUser, Long serverId, Long targetUserId) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!serverMemberRepository.existsByServerIdAndUserId(serverId, currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (serverMemberRepository.existsByServerIdAndUserId(serverId, targetUserId)) {
            throw new AppException(ErrorCode.USER_ALREADY_IN_ROOM, "Người dùng đã ở trong server");
        }

        ServerMember member = ServerMember.builder()
                .server(server)
                .user(targetUser)
                .displayName(targetUser.getUsername())
                .build();
        return ServerMemberResponse.fromEntity(serverMemberRepository.save(member));
    }

    /**
     * Updates the roles of a member. Restricted to server owners.
     */
    @Override
    @Transactional
    public ServerMemberResponse assignMemberRoles(User currentUser, Long serverId, Long targetUserId, AssignMemberRolesRequest request) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!server.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Chỉ chủ server mới có thể phân vai trò");
        }

        ServerMember member = serverMemberRepository.findByServerIdAndUserId(serverId, targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_IN_ROOM));

        List<ServerRole> newRoles = request.getRoleIds() != null
                ? serverRoleRepository.findAllById(request.getRoleIds())
                : new ArrayList<>();

        member.setRoles(newRoles);
        return ServerMemberResponse.fromEntity(serverMemberRepository.save(member));
    }

    /**
     * Kicks a member from the server.
     */
    @Override
    @Transactional
    public void kickMember(User currentUser, Long serverId, Long targetUserId) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!server.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Chỉ chủ server mới có thể kick thành viên");
        }

        ServerMember member = serverMemberRepository.findByServerIdAndUserId(serverId, targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_IN_ROOM));

        serverMemberRepository.delete(member);
    }

    /**
     * Bans a member from a server.
     * Deletes their active membership and creates a ServerBan record to prevent future joins.
     */
    @Override
    @Transactional
    public void banMember(User currentUser, Long serverId, Long targetUserId, String reason) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!server.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Chỉ chủ server mới có thể ban thành viên");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        serverMemberRepository.findByServerIdAndUserId(serverId, targetUserId)
                .ifPresent(serverMemberRepository::delete);

        ServerBan ban = ServerBan.builder()
                .server(server)
                .user(targetUser)
                .reason(reason)
                .build();
        serverBanRepository.save(ban);
    }

    /**
     * Creates a new custom role with custom permissions and color.
     */
    @Override
    @Transactional
    public ServerRoleResponse createRole(User currentUser, Long serverId, CreateRoleRequest request) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!server.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        ServerRole role = ServerRole.builder()
                .server(server)
                .name(request.getName())
                .hexColor(request.getHexColor())
                .position(request.getPosition())
                .permissions(request.getPermissions() != null ? request.getPermissions() : new HashSet<>())
                .build();

        return ServerRoleResponse.fromEntity(serverRoleRepository.save(role));
    }

    /**
     * Updates the server member's display name (nickname) inside this specific server.
     */
    @Override
    @Transactional
    public ServerMemberResponse updateNickname(User currentUser, Long serverId, String nickname) {
        ServerMember member = serverMemberRepository.findByServerIdAndUserId(serverId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_ROOM_MEMBER, "Bạn không phải thành viên của server này"));

        String sanitized = (nickname != null && !nickname.trim().isEmpty())
                ? nickname.trim()
                : currentUser.getUsername();

        member.setDisplayName(sanitized);
        return ServerMemberResponse.fromEntity(serverMemberRepository.save(member));
    }

    /**
     * Deletes a server permanently. Cascades to channels, members, and roles.
     */
    @Override
    @Transactional
    public void deleteServer(User currentUser, Long serverId) {
        Server server = serverRepository.findById(serverId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));

        if (!server.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION, "Chỉ chủ server mới có thể xóa server");
        }

        serverRepository.delete(server);
    }
}
