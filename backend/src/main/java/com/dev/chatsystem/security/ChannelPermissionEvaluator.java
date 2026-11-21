package com.dev.chatsystem.security;

import com.dev.chatsystem.model.GuildChannel;
import com.dev.chatsystem.model.PermissionOverride;
import com.dev.chatsystem.model.Server;
import com.dev.chatsystem.model.ServerMember;
import com.dev.chatsystem.model.ServerPermission;
import com.dev.chatsystem.model.ServerRole;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Component responsible for evaluating channel permissions following Discord's
 * permission hierarchy algorithm (Base roles -> @everyone override -> specific role overrides).
 */
@Component
public class ChannelPermissionEvaluator {

    /**
     * Determines whether a channel is considered "private" (i.e. default @everyone / Member role is denied READ_MESSAGE).
     */
    public boolean isPrivateChannel(List<PermissionOverride> channelOverrides) {
        if (channelOverrides == null || channelOverrides.isEmpty()) {
            return false;
        }
        return channelOverrides.stream().anyMatch(po ->
                isDefaultRole(po.getRole())
                        && po.getDenyPermission() != null
                        && po.getDenyPermission().contains(ServerPermission.READ_MESSAGE)
        );
    }

    /**
     * Identifies the base default role (@everyone or Member with position 0).
     */
    public boolean isDefaultRole(ServerRole role) {
        if (role == null) return false;
        return role.getPosition() == 0
                || "Member".equalsIgnoreCase(role.getName())
                || "@everyone".equalsIgnoreCase(role.getName());
    }

    /**
     * Evaluates effective channel permissions for a server member on a specific guild channel
     * following Discord's permission inheritance algorithm.
     */
    public Set<ServerPermission> computeChannelPermissions(
            ServerMember member,
            GuildChannel channel,
            List<PermissionOverride> channelOverrides) {

        Server server = channel.getGroup().getServer();

        // 1. Server Owner has full permissions
        if (server.getOwner().getId().equals(member.getUser().getId())) {
            return EnumSet.allOf(ServerPermission.class);
        }

        List<ServerRole> memberRoles = member.getRoles() != null ? member.getRoles() : List.of();

        // 2. Base permissions = Union of all permissions across member's roles
        Set<ServerPermission> effective = EnumSet.noneOf(ServerPermission.class);
        for (ServerRole role : memberRoles) {
            if (role.getPermissions() != null) {
                effective.addAll(role.getPermissions());
            }
        }

        if (channelOverrides == null || channelOverrides.isEmpty()) {
            return effective;
        }

        // 3. Find and apply the base default role (@everyone or Member) override
        PermissionOverride defaultOverride = channelOverrides.stream()
                .filter(po -> isDefaultRole(po.getRole()))
                .findFirst()
                .orElse(null);

        if (defaultOverride != null) {
            if (defaultOverride.getDenyPermission() != null) {
                effective.removeAll(defaultOverride.getDenyPermission());
            }
            if (defaultOverride.getAllowPermission() != null) {
                effective.addAll(defaultOverride.getAllowPermission());
            }
        }

        // 4. Specific role overrides for roles that the member has (excluding default role)
        Set<Long> memberRoleIds = memberRoles.stream().map(ServerRole::getId).collect(Collectors.toSet());
        Long defaultRoleId = defaultOverride != null && defaultOverride.getRole() != null
                ? defaultOverride.getRole().getId()
                : null;

        Set<ServerPermission> roleDenies = EnumSet.noneOf(ServerPermission.class);
        Set<ServerPermission> roleAllows = EnumSet.noneOf(ServerPermission.class);

        for (PermissionOverride po : channelOverrides) {
            if (po.getRole() != null && memberRoleIds.contains(po.getRole().getId())) {
                if (defaultRoleId != null && po.getRole().getId().equals(defaultRoleId)) {
                    continue; // Already applied in step 3
                }
                if (po.getDenyPermission() != null) {
                    roleDenies.addAll(po.getDenyPermission());
                }
                if (po.getAllowPermission() != null) {
                    roleAllows.addAll(po.getAllowPermission());
                }
            }
        }

        // Discord rule: specific role allows override denies
        effective.removeAll(roleDenies);
        effective.addAll(roleAllows);

        return effective;
    }
}

