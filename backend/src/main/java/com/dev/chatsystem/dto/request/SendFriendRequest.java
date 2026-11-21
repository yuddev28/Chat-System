package com.dev.chatsystem.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendFriendRequest {
    private Long targetUserId;
    private String userTag;
    private String username;
}
