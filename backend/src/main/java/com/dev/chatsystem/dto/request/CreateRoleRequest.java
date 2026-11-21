package com.dev.chatsystem.dto.request;

import com.dev.chatsystem.model.ServerPermission;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class CreateRoleRequest {
    @NotBlank(message = "Tên vai trò không được để trống")
    private String name;

    private String hexColor;
    private int position;
    private Set<ServerPermission> permissions;
}
