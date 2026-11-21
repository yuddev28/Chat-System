package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.PermissionOverride;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionOverrideResponse {
    private Long id;
    private Long channelId;
    private Long roleId;
    private String roleName;
    private String roleHexColor;
    private List<String> allowPermissions;
    private List<String> denyPermissions;

    public static PermissionOverrideResponse fromEntity(PermissionOverride po) {
        if (po == null) return null;
        return PermissionOverrideResponse.builder()
                .id(po.getId())
                .channelId(po.getChannel() != null ? po.getChannel().getId() : null)
                .roleId(po.getRole() != null ? po.getRole().getId() : null)
                .roleName(po.getRole() != null ? po.getRole().getName() : null)
                .roleHexColor(po.getRole() != null ? po.getRole().getHexColor() : null)
                .allowPermissions(po.getAllowPermission() != null
                        ? po.getAllowPermission().stream().map(Enum::name).toList()
                        : List.of())
                .denyPermissions(po.getDenyPermission() != null
                        ? po.getDenyPermission().stream().map(Enum::name).toList()
                        : List.of())
                .build();
    }
}
