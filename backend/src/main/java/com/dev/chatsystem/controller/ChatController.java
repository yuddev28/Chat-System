package com.dev.chatsystem.controller;

import com.dev.chatsystem.dto.request.SendMessageRequest;
import com.dev.chatsystem.dto.response.ApiResponse;
import com.dev.chatsystem.dto.response.MessageResponse;
import com.dev.chatsystem.dto.response.PageResponse;
import com.dev.chatsystem.model.User;
import com.dev.chatsystem.service.ChatService;
import com.dev.chatsystem.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    @PostMapping("/channels/{channelId}/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            Authentication authentication,
            @PathVariable Long channelId,
            @Valid @RequestBody SendMessageRequest request) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        MessageResponse message = chatService.sendMessage(currentUser, channelId, request);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @GetMapping("/channels/{channelId}/messages")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getChannelMessages(
            Authentication authentication,
            @PathVariable Long channelId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        PageResponse<MessageResponse> response = chatService.getChannelMessages(currentUser, channelId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/channels/{channelId}/pinned")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getPinnedMessages(
            Authentication authentication,
            @PathVariable Long channelId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        List<MessageResponse> messages = chatService.getPinnedMessages(currentUser, channelId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PutMapping("/messages/{messageId}/pin")
    public ResponseEntity<ApiResponse<MessageResponse>> togglePin(
            Authentication authentication,
            @PathVariable Long messageId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        MessageResponse message = chatService.togglePinMessage(currentUser, messageId);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            Authentication authentication,
            @PathVariable Long messageId) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        chatService.deleteMessage(currentUser, messageId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tin nhắn", null));
    }

    @PostMapping("/messages/{messageId}/reactions")
    public ResponseEntity<ApiResponse<MessageResponse>> addReaction(
            Authentication authentication,
            @PathVariable Long messageId,
            @RequestParam String emoji) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        MessageResponse message = chatService.addReaction(currentUser, messageId, emoji);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @DeleteMapping("/messages/{messageId}/reactions")
    public ResponseEntity<ApiResponse<MessageResponse>> removeReaction(
            Authentication authentication,
            @PathVariable Long messageId,
            @RequestParam String emoji) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        MessageResponse message = chatService.removeReaction(currentUser, messageId, emoji);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
