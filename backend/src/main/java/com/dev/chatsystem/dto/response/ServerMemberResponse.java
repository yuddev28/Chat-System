package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.ServerMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServerMemberResponse {
    private Long id;
    private String displayName;
    private UserResponse user;
    private List<ServerRoleResponse> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ServerMemberResponse fromEntity(ServerMember member) {
        if (member == null) return null;
        return ServerMemberResponse.builder()
                .id(member.getId())
                .displayName(member.getDisplayName())
                .user(UserResponse.fromEntity(member.getUser()))
                .roles(member.getRoles() != null
                        ? member.getRoles().stream().map(ServerRoleResponse::fromEntity).collect(Collectors.toList())
                        : List.of())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
