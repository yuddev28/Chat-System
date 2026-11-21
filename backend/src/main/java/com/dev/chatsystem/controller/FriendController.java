package com.dev.chatsystem.controller;

import com.dev.chatsystem.dto.request.SendFriendRequest;
import com.dev.chatsystem.dto.response.ApiResponse;
import com.dev.chatsystem.dto.response.FriendRequestResponse;
import com.dev.chatsystem.dto.response.FriendshipResponse;
import com.dev.chatsystem.dto.response.UserResponse;
import com.dev.chatsystem.model.User;
import com.dev.chatsystem.service.FriendshipService;
import com.dev.chatsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendshipService friendshipService;
    private final UserService userService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> sendFriendRequest(
            Authentication authentication,
            @Valid @RequestBody SendFriendRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        FriendRequestResponse response = friendshipService.sendFriendRequest(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi yêu cầu kết bạn", response));
    }

    @PutMapping("/request/{requestId}")
    public ResponseEntity<ApiResponse<FriendshipResponse>> respondFriendRequest(
            Authentication authentication,
            @PathVariable Long requestId,
            @RequestParam boolean accept) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        FriendshipResponse response = friendshipService.respondFriendRequest(currentUser, requestId, accept);
        String msg = accept ? "Đã chấp nhận kết bạn" : "Đã từ chối kết bạn";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<ApiResponse<Void>> unfriend(
            Authentication authentication,
            @PathVariable Long targetUserId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        friendshipService.unfriend(currentUser, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã hủy kết bạn thành công", null));
    }

    @PostMapping("/block/{targetUserId}")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            Authentication authentication,
            @PathVariable Long targetUserId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        friendshipService.blockUser(currentUser, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã chặn người dùng thành công", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFriendsList(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<UserResponse> friends = friendshipService.getFriendsList(currentUser);
        return ResponseEntity.ok(ApiResponse.success(friends));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getPendingRequests(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<FriendRequestResponse> requests = friendshipService.getPendingRequests(currentUser);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
}
