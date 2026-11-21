package com.dev.chatsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateServerRequest {
    @NotBlank(message = "Tên server không được để trống")
    @Size(min = 2, max = 100, message = "Tên server từ 2 đến 100 ký tự")
    private String name;

    private String description;
    private String avatarUrl;
}
