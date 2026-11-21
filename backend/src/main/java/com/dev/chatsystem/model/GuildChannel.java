package com.dev.chatsystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "guild_channels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GuildChannel extends Channel {

    private int position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ChannelGroup group;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChannelType type;

    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PermissionOverride> permissionOverrides = new ArrayList<>();

    @Builder
    public GuildChannel(Long id, List<Message> messages, String name, int position, ChannelGroup group, ChannelType type, List<PermissionOverride> permissionOverrides) {
        super(id, name, messages != null ? messages : new ArrayList<>(), null, null);
        this.position = position;
        this.group = group;
        this.type = type;
        this.permissionOverrides = permissionOverrides != null ? permissionOverrides : new ArrayList<>();
    }
}
