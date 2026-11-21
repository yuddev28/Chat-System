package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.ServerRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServerRoleResponse {
    private Long id;
    private String name;
    private String hexColor;
    private int position;
    private Set<String> permissions;

    public static ServerRoleResponse fromEntity(ServerRole role) {
        if (role == null) return null;
        return ServerRoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .hexColor(role.getHexColor())
                .position(role.getPosition())
                .permissions(role.getPermissions().stream().map(Enum::name).collect(Collectors.toSet()))
                .build();
    }
}
