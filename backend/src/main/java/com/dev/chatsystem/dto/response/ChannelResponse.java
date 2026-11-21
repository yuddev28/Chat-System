package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.GuildChannel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChannelResponse {
    private Long id;
    private String name;
    private int position;
    private Long groupId;
    private String type;
    private Boolean isPrivate;
    private Set<String> myPermissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ChannelResponse fromGuildChannel(GuildChannel channel) {
        return fromGuildChannel(channel, false, null);
    }

    public static ChannelResponse fromGuildChannel(GuildChannel channel, boolean isPrivate, Set<String> myPermissions) {
        if (channel == null) return null;
        return ChannelResponse.builder()
                .id(channel.getId())
                .name(channel.getName())
                .position(channel.getPosition())
                .groupId(channel.getGroup() != null ? channel.getGroup().getId() : null)
                .type(channel.getType() != null ? channel.getType().name() : null)
                .isPrivate(isPrivate)
                .myPermissions(myPermissions)
                .createdAt(channel.getCreatedAt())
                .updatedAt(channel.getUpdatedAt())
                .build();
    }
}
