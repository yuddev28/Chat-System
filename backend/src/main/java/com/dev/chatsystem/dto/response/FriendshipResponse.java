package com.dev.chatsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.dev.chatsystem.model.FriendRequestStatus;
import com.dev.chatsystem.model.FriendShip;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendshipResponse {
    private Long id;
    private UserResponse userA;
    private UserResponse userB;
    private FriendRequestStatus status;
    private LocalDateTime createdAt;

    public static FriendshipResponse fromEntity(FriendShip f) {
        if (f == null) return null;
        return FriendshipResponse.builder()
                .id(f.getId())
                .userA(UserResponse.fromEntity(f.getUserA()))
                .userB(UserResponse.fromEntity(f.getUserB()))
                .createdAt(f.getCreatedAt())
                .build();
    }
}
