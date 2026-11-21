package com.dev.chatsystem.controller;

import com.dev.chatsystem.dto.request.SendMessageRequest;
import com.dev.chatsystem.model.User;
import com.dev.chatsystem.service.ChatService;
import com.dev.chatsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private final ChatService chatService;
    private final UserService userService;

    @MessageMapping("/chat.sendMessage/{channelId}")
    public void sendMessage(
            @DestinationVariable Long channelId,
            @Payload SendMessageRequest request,
            Principal principal) {
        if (principal == null) return;
        User currentUser = userService.getUserByEmail(principal.getName());
        chatService.sendMessage(currentUser, channelId, request);
    }
}
