import apiClient from './apiClient';

export const channelService = {
  async getChannelGroups(serverId) {
    const res = await apiClient.get(`/channels/groups/${serverId}`);
    return res.data?.data || [];
  },

  async createChannelGroup(serverId, data) {
    const res = await apiClient.post(`/channels/groups/${serverId}`, data);
    return res.data?.data;
  },

  async getServerChannels(serverId) {
    const res = await apiClient.get(`/channels/guild/server/${serverId}`);
    return res.data?.data || [];
  },

  async createGuildChannel(data) {
    const res = await apiClient.post('/channels/guild', data);
    return res.data?.data;
  },

  async deleteChannel(channelId) {
    const res = await apiClient.delete(`/channels/${channelId}`);
    return res.data;
  },

  async getChannelPermissions(channelId) {
    const res = await apiClient.get(`/channels/${channelId}/permissions`);
    return res.data?.data || [];
  },

  async setChannelPermissionOverride(channelId, data) {
    const res = await apiClient.post(`/channels/${channelId}/permissions`, data);
    return res.data?.data;
  },

  async deleteChannelPermissionOverride(channelId, roleId) {
    const res = await apiClient.delete(`/channels/${channelId}/permissions/${roleId}`);
    return res.data;
  },

  async toggleChannelPrivacy(channelId, isPrivate) {
    const res = await apiClient.patch(`/channels/${channelId}/privacy?isPrivate=${isPrivate}`);
    return res.data?.data;
  },

  async getUserDMChannels() {
    const res = await apiClient.get('/channels/dm');
    return res.data?.data || [];
  },

  async getOrCreateDMChannel(recipientIds, name = null) {
    const res = await apiClient.post('/channels/dm', { recipientIds, name });
    return res.data?.data;
  },
};
