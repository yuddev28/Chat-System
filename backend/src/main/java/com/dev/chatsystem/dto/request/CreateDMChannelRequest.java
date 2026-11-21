package com.dev.chatsystem.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateDMChannelRequest {
    private String name;
    @NotEmpty(message = "Danh sách người nhận không được để trống")
    private List<Long> recipientIds;
}
