package com.dev.chatsystem.service;

import com.dev.chatsystem.dto.request.SendFriendRequest;
import com.dev.chatsystem.dto.response.FriendRequestResponse;
import com.dev.chatsystem.dto.response.FriendshipResponse;
import com.dev.chatsystem.dto.response.UserResponse;
import com.dev.chatsystem.model.User;

import java.util.List;

public interface FriendshipService {
    FriendRequestResponse sendFriendRequest(User currentUser, SendFriendRequest request);

    FriendshipResponse respondFriendRequest(User currentUser, Long requestId, boolean accept);

    void unfriend(User currentUser, Long targetUserId);

    void blockUser(User currentUser, Long targetUserId);

    List<UserResponse> getFriendsList(User currentUser);

    List<FriendRequestResponse> getPendingRequests(User currentUser);
}
