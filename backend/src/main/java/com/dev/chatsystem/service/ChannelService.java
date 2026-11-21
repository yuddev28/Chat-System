package com.dev.chatsystem.service;

import com.dev.chatsystem.dto.request.CreateChannelGroupRequest;
import com.dev.chatsystem.dto.request.CreateChannelRequest;
import com.dev.chatsystem.dto.request.CreateDMChannelRequest;
import com.dev.chatsystem.dto.response.ChannelGroupResponse;
import com.dev.chatsystem.dto.response.ChannelResponse;
import com.dev.chatsystem.dto.response.DMChannelResponse;
import com.dev.chatsystem.model.User;

import java.util.List;

public interface ChannelService {
    ChannelGroupResponse createChannelGroup(User currentUser, Long serverId, CreateChannelGroupRequest request);

    List<ChannelGroupResponse> getServerChannelGroups(User currentUser, Long serverId);

    ChannelResponse createGuildChannel(User currentUser, CreateChannelRequest request);

    List<ChannelResponse> getServerChannels(User currentUser, Long serverId);

    List<com.dev.chatsystem.dto.response.PermissionOverrideResponse> getChannelPermissions(User currentUser, Long channelId);

    com.dev.chatsystem.dto.response.PermissionOverrideResponse setChannelPermissionOverride(
            User currentUser, Long channelId, com.dev.chatsystem.dto.request.SetPermissionOverrideRequest request);

    void deleteChannelPermissionOverride(User currentUser, Long channelId, Long roleId);

    void deleteChannel(User currentUser, Long channelId);

    ChannelResponse toggleChannelPrivacy(User currentUser, Long channelId, boolean isPrivate);

    DMChannelResponse getOrCreateDMChannel(User currentUser, CreateDMChannelRequest request);

    List<DMChannelResponse> getUserDMChannels(User currentUser);
}
