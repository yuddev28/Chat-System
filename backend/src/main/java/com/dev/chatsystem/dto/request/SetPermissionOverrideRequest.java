package com.dev.chatsystem.dto.request;

import com.dev.chatsystem.model.ServerPermission;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SetPermissionOverrideRequest {
    @NotNull(message = "roleId không được để trống")
    private Long roleId;

    private List<ServerPermission> allowPermissions;
    private List<ServerPermission> denyPermissions;
}
