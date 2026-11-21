package com.dev.chatsystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dm_channels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DMChannel extends Channel {

    @Column(name = "is_group", nullable = false)
    private boolean isGroup;

    @ManyToMany
    @JoinTable(
            name = "dm_recipients",
            joinColumns = @JoinColumn(name = "channel_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> recipients = new ArrayList<>();

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Builder
    public DMChannel(Long id, List<Message> messages, String name, boolean isGroup, List<User> recipients, LocalDateTime lastMessageAt) {
        super(id, name, messages != null ? messages : new ArrayList<>(), null, null);
        this.isGroup = isGroup;
        this.recipients = recipients != null ? recipients : new ArrayList<>();
        this.lastMessageAt = lastMessageAt;
    }
}
