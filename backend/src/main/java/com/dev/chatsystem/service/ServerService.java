package com.dev.chatsystem.service;

import com.dev.chatsystem.dto.request.AssignMemberRolesRequest;
import com.dev.chatsystem.dto.request.CreateRoleRequest;
import com.dev.chatsystem.dto.request.CreateServerRequest;
import com.dev.chatsystem.dto.response.ServerMemberResponse;
import com.dev.chatsystem.dto.response.ServerResponse;
import com.dev.chatsystem.dto.response.ServerRoleResponse;
import com.dev.chatsystem.model.User;

import java.util.List;

public interface ServerService {
    ServerResponse createServer(User currentUser, CreateServerRequest request);

    ServerResponse getServerDetails(User currentUser, Long serverId);

    List<ServerResponse> getUserServers(User currentUser);

    ServerResponse joinServerByInviteCode(User currentUser, String inviteCode);

    ServerMemberResponse addMemberToServer(User currentUser, Long serverId, Long targetUserId);

    ServerMemberResponse assignMemberRoles(User currentUser, Long serverId, Long targetUserId,
            AssignMemberRolesRequest request);

    void kickMember(User currentUser, Long serverId, Long targetUserId);

    void banMember(User currentUser, Long serverId, Long targetUserId, String reason);

    ServerRoleResponse createRole(User currentUser, Long serverId, CreateRoleRequest request);

    ServerMemberResponse updateNickname(User currentUser, Long serverId, String nickname);

    void deleteServer(User currentUser, Long serverId);
}
