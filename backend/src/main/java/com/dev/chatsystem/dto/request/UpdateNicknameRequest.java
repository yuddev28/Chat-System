package com.dev.chatsystem.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateNicknameRequest {
    @Size(max = 100, message = "Biệt danh không được vượt quá 100 ký tự")
    private String nickname;
}
