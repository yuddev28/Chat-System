package com.dev.chatsystem.controller;

import com.dev.chatsystem.dto.request.CreateChannelGroupRequest;
import com.dev.chatsystem.dto.request.CreateChannelRequest;
import com.dev.chatsystem.dto.request.CreateDMChannelRequest;
import com.dev.chatsystem.dto.response.ApiResponse;
import com.dev.chatsystem.dto.response.ChannelGroupResponse;
import com.dev.chatsystem.dto.response.ChannelResponse;
import com.dev.chatsystem.dto.response.DMChannelResponse;
import com.dev.chatsystem.model.User;
import com.dev.chatsystem.service.ChannelService;
import com.dev.chatsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/channels")
@RequiredArgsConstructor
public class ChannelController {

    private final ChannelService channelService;
    private final UserService userService;

    @PostMapping("/groups/{serverId}")
    public ResponseEntity<ApiResponse<ChannelGroupResponse>> createChannelGroup(
            Authentication authentication,
            @PathVariable Long serverId,
            @Valid @RequestBody CreateChannelGroupRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ChannelGroupResponse group = channelService.createChannelGroup(currentUser, serverId, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo nhóm kênh thành công", group));
    }

    @GetMapping("/groups/{serverId}")
    public ResponseEntity<ApiResponse<List<ChannelGroupResponse>>> getServerChannelGroups(
            Authentication authentication,
            @PathVariable Long serverId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<ChannelGroupResponse> groups = channelService.getServerChannelGroups(currentUser, serverId);
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @PostMapping("/guild")
    public ResponseEntity<ApiResponse<ChannelResponse>> createGuildChannel(
            Authentication authentication,
            @Valid @RequestBody CreateChannelRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ChannelResponse channel = channelService.createGuildChannel(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo kênh server thành công", channel));
    }

    @GetMapping("/guild/server/{serverId}")
    public ResponseEntity<ApiResponse<List<ChannelResponse>>> getServerChannels(
            Authentication authentication,
            @PathVariable Long serverId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<ChannelResponse> channels = channelService.getServerChannels(currentUser, serverId);
        return ResponseEntity.ok(ApiResponse.success(channels));
    }

    @DeleteMapping("/{channelId}")
    public ResponseEntity<ApiResponse<Void>> deleteChannel(
            Authentication authentication,
            @PathVariable Long channelId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        channelService.deleteChannel(currentUser, channelId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa kênh", null));
    }

    @GetMapping("/{channelId}/permissions")
    public ResponseEntity<ApiResponse<List<com.dev.chatsystem.dto.response.PermissionOverrideResponse>>> getChannelPermissions(
            Authentication authentication,
            @PathVariable Long channelId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<com.dev.chatsystem.dto.response.PermissionOverrideResponse> list = channelService.getChannelPermissions(currentUser, channelId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{channelId}/permissions")
    public ResponseEntity<ApiResponse<com.dev.chatsystem.dto.response.PermissionOverrideResponse>> setChannelPermissionOverride(
            Authentication authentication,
            @PathVariable Long channelId,
            @Valid @RequestBody com.dev.chatsystem.dto.request.SetPermissionOverrideRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        com.dev.chatsystem.dto.response.PermissionOverrideResponse res = channelService.setChannelPermissionOverride(currentUser, channelId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quyền kênh thành công", res));
    }

    @DeleteMapping("/{channelId}/permissions/{roleId}")
    public ResponseEntity<ApiResponse<Void>> deleteChannelPermissionOverride(
            Authentication authentication,
            @PathVariable Long channelId,
            @PathVariable Long roleId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        channelService.deleteChannelPermissionOverride(currentUser, channelId, roleId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa phân quyền kênh", null));
    }

    @PatchMapping("/{channelId}/privacy")
    public ResponseEntity<ApiResponse<ChannelResponse>> toggleChannelPrivacy(
            Authentication authentication,
            @PathVariable Long channelId,
            @RequestParam boolean isPrivate) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        ChannelResponse res = channelService.toggleChannelPrivacy(currentUser, channelId, isPrivate);
        return ResponseEntity.ok(ApiResponse.success(isPrivate ? "Đã chuyển kênh sang riêng tư" : "Đã chuyển kênh sang công khai", res));
    }

    @PostMapping("/dm")
    public ResponseEntity<ApiResponse<DMChannelResponse>> getOrCreateDMChannel(
            Authentication authentication,
            @Valid @RequestBody CreateDMChannelRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        DMChannelResponse dm = channelService.getOrCreateDMChannel(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Tạo hoặc lấy kênh DM thành công", dm));
    }

    @GetMapping("/dm")
    public ResponseEntity<ApiResponse<List<DMChannelResponse>>> getUserDMChannels(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<DMChannelResponse> dms = channelService.getUserDMChannels(currentUser);
        return ResponseEntity.ok(ApiResponse.success(dms));
    }
}
