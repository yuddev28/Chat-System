package com.dev.chatsystem.service;

import com.dev.chatsystem.dto.request.SendMessageRequest;
import com.dev.chatsystem.dto.response.MessageResponse;
import com.dev.chatsystem.dto.response.PageResponse;
import com.dev.chatsystem.model.User;

import java.util.List;

public interface ChatService {
    MessageResponse sendMessage(User sender, Long channelId, SendMessageRequest request);

    PageResponse<MessageResponse> getChannelMessages(User currentUser, Long channelId, int page, int size);

    List<MessageResponse> getPinnedMessages(User currentUser, Long channelId);

    MessageResponse togglePinMessage(User currentUser, Long messageId);

    void deleteMessage(User currentUser, Long messageId);

    MessageResponse addReaction(User currentUser, Long messageId, String emoji);

    MessageResponse removeReaction(User currentUser, Long messageId, String emoji);
}
