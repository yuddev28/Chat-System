package com.dev.chatsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email hoặc Username không được để trống")
    private String emailOrUsername;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
}
