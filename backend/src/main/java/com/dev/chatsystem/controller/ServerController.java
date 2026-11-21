package com.dev.chatsystem.controller;

import com.dev.chatsystem.dto.request.AssignMemberRolesRequest;
import com.dev.chatsystem.dto.request.CreateRoleRequest;
import com.dev.chatsystem.dto.request.CreateServerRequest;
import com.dev.chatsystem.dto.response.ApiResponse;
import com.dev.chatsystem.dto.response.ServerMemberResponse;
import com.dev.chatsystem.dto.response.ServerResponse;
import com.dev.chatsystem.dto.response.ServerRoleResponse;
import com.dev.chatsystem.model.User;
import com.dev.chatsystem.service.ServerService;
import com.dev.chatsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servers")
@RequiredArgsConstructor
public class ServerController {

    private final ServerService serverService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<ServerResponse>> createServer(
            Authentication authentication,
            @Valid @RequestBody CreateServerRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ServerResponse server = serverService.createServer(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo server thành công", server));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServerResponse>>> getUserServers(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<ServerResponse> servers = serverService.getUserServers(currentUser);
        return ResponseEntity.ok(ApiResponse.success(servers));
    }

    @GetMapping("/{serverId}")
    public ResponseEntity<ApiResponse<ServerResponse>> getServerDetails(
            Authentication authentication,
            @PathVariable Long serverId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ServerResponse server = serverService.getServerDetails(currentUser, serverId);
        return ResponseEntity.ok(ApiResponse.success(server));
    }

    @PostMapping("/join/{inviteCode}")
    public ResponseEntity<ApiResponse<ServerResponse>> joinServerByInviteCode(
            Authentication authentication,
            @PathVariable String inviteCode) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ServerResponse server = serverService.joinServerByInviteCode(currentUser, inviteCode);
        return ResponseEntity.ok(ApiResponse.success("Tham gia server thành công", server));
    }

    @PostMapping("/{serverId}/members/{targetUserId}")
    public ResponseEntity<ApiResponse<ServerMemberResponse>> addMember(
            Authentication authentication,
            @PathVariable Long serverId,
            @PathVariable Long targetUserId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ServerMemberResponse member = serverService.addMemberToServer(currentUser, serverId, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã thêm thành viên vào server", member));
    }

    @PutMapping("/{serverId}/members/{targetUserId}/roles")
    public ResponseEntity<ApiResponse<ServerMemberResponse>> assignRoles(
            Authentication authentication,
            @PathVariable Long serverId,
            @PathVariable Long targetUserId,
            @RequestBody AssignMemberRolesRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ServerMemberResponse member = serverService.assignMemberRoles(currentUser, serverId, targetUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò thành công", member));
    }

    @DeleteMapping("/{serverId}/members/{targetUserId}/kick")
    public ResponseEntity<ApiResponse<Void>> kickMember(
            Authentication authentication,
            @PathVariable Long serverId,
            @PathVariable Long targetUserId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        serverService.kickMember(currentUser, serverId, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã kick thành viên khỏi server", null));
    }

    @PostMapping("/{serverId}/members/{targetUserId}/ban")
    public ResponseEntity<ApiResponse<Void>> banMember(
            Authentication authentication,
            @PathVariable Long serverId,
            @PathVariable Long targetUserId,
            @RequestParam(defaultValue = "Vi phạm quy định") String reason) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        serverService.banMember(currentUser, serverId, targetUserId, reason);
        return ResponseEntity.ok(ApiResponse.success("Đã ban thành viên khỏi server", null));
    }

    @PostMapping("/{serverId}/roles")
    public ResponseEntity<ApiResponse<ServerRoleResponse>> createRole(
            Authentication authentication,
            @PathVariable Long serverId,
            @Valid @RequestBody CreateRoleRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ServerRoleResponse role = serverService.createRole(currentUser, serverId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo vai trò thành công", role));
    }

    @PutMapping("/{serverId}/members/me/nickname")
    public ResponseEntity<ApiResponse<ServerMemberResponse>> updateNickname(
            Authentication authentication,
            @PathVariable Long serverId,
            @Valid @RequestBody com.dev.chatsystem.dto.request.UpdateNicknameRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ServerMemberResponse member = serverService.updateNickname(currentUser, serverId, request.getNickname());
        return ResponseEntity.ok(ApiResponse.success("Đổi biệt danh server thành công", member));
    }

    @DeleteMapping("/{serverId}")
    public ResponseEntity<ApiResponse<Void>> deleteServer(
            Authentication authentication,
            @PathVariable Long serverId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        serverService.deleteServer(currentUser, serverId);
        return ResponseEntity.ok(ApiResponse.success("Đã giải tán server", null));
    }
}
