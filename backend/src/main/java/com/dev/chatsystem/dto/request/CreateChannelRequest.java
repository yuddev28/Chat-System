package com.dev.chatsystem.dto.request;

import com.dev.chatsystem.model.ChannelType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateChannelRequest {
    @NotBlank(message = "Tên kênh không được để trống")
    private String name;

    private int position;

    private Long serverId;

    private Long groupId;

    @NotNull(message = "Loại kênh không được để trống")
    private ChannelType type = ChannelType.GUILD_TEXT;

    private Boolean isPrivate = false;

    private List<Long> allowedRoleIds;
}
