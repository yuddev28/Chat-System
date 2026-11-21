package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.ChannelGroup;
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
public class ChannelGroupResponse {
    private Long id;
    private String name;
    private int position;
    private List<ChannelResponse> channels;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ChannelGroupResponse fromEntity(ChannelGroup group) {
        if (group == null) return null;
        return ChannelGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .position(group.getPosition())
                .channels(group.getChannels() != null
                        ? group.getChannels().stream().map(ChannelResponse::fromGuildChannel).collect(Collectors.toList())
                        : List.of())
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }
}
