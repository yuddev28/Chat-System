package com.dev.chatsystem.dto.response;

import com.dev.chatsystem.model.DMChannel;
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
public class DMChannelResponse {
    private Long id;
    private String name;
    private boolean isGroup;
    private List<UserResponse> recipients;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DMChannelResponse fromEntity(DMChannel dm) {
        if (dm == null) return null;
        return DMChannelResponse.builder()
                .id(dm.getId())
                .name(dm.getName())
                .isGroup(dm.isGroup())
                .recipients(dm.getRecipients() != null
                        ? dm.getRecipients().stream().map(UserResponse::fromEntity).collect(Collectors.toList())
                        : List.of())
                .lastMessageAt(dm.getLastMessageAt())
                .createdAt(dm.getCreatedAt())
                .updatedAt(dm.getUpdatedAt())
                .build();
    }
}
