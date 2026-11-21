package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.Server;
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
public class ServerResponse {
    private Long id;
    private String name;
    private String description;
    private String avatarUrl;
    private String invitedCode;
    private UserResponse owner;
    private List<ServerMemberResponse> members;
    private List<ChannelGroupResponse> channelGroups;
    private List<ServerRoleResponse> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ServerResponse fromEntity(Server server) {
        if (server == null) return null;
        return ServerResponse.builder()
                .id(server.getId())
                .name(server.getName())
                .description(server.getDescription())
                .avatarUrl(server.getAvatarUrl())
                .invitedCode(server.getInvitedCode())
                .owner(UserResponse.fromEntity(server.getOwner()))
                .members(server.getMembers() != null
                        ? server.getMembers().stream().map(ServerMemberResponse::fromEntity).collect(Collectors.toList())
                        : List.of())
                .channelGroups(server.getChannelGroups() != null
                        ? server.getChannelGroups().stream().map(ChannelGroupResponse::fromEntity).collect(Collectors.toList())
                        : List.of())
                .roles(server.getRoles() != null
                        ? server.getRoles().stream().map(ServerRoleResponse::fromEntity).collect(Collectors.toList())
                        : List.of())
                .createdAt(server.getCreatedAt())
                .updatedAt(server.getUpdatedAt())
                .build();
    }
}
