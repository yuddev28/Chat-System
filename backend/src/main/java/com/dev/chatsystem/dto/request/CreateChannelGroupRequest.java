package com.dev.chatsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateChannelGroupRequest {
    @NotBlank(message = "Tên nhóm kênh không được để trống")
    private String name;

    private int position;
}
