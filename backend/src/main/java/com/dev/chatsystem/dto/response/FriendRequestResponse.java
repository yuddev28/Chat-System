package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.FriendRequest;
import com.dev.chatsystem.model.FriendRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestResponse {
    private Long id;
    private UserResponse sender;
    private UserResponse receiver;
    private FriendRequestStatus status;
    private LocalDateTime createdAt;

    public static FriendRequestResponse fromEntity(FriendRequest req) {
        if (req == null) return null;
        return FriendRequestResponse.builder()
                .id(req.getId())
                .sender(UserResponse.fromEntity(req.getSender()))
                .receiver(UserResponse.fromEntity(req.getReceiver()))
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
