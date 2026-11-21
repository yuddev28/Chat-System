import apiClient from './apiClient';

export const chatService = {
  async sendMessage(channelId, data) {
    const res = await apiClient.post(`/chat/channels/${channelId}/messages`, data);
    return res.data?.data;
  },

  async getChannelMessages(channelId, page = 1, size = 50) {
    const res = await apiClient.get(`/chat/channels/${channelId}/messages`, {
      params: { page, size },
    });
    return res.data?.data; // PageResponse: { content, totalPages, totalElements, last, pageNo }
  },

  async getPinnedMessages(channelId) {
    const res = await apiClient.get(`/chat/channels/${channelId}/pinned`);
    return res.data?.data || [];
  },

  async togglePin(messageId) {
    const res = await apiClient.put(`/chat/messages/${messageId}/pin`);
    return res.data?.data;
  },

  async deleteMessage(messageId) {
    const res = await apiClient.delete(`/chat/messages/${messageId}`);
    return res.data;
  },

  async addReaction(messageId, emoji) {
    const res = await apiClient.post(`/chat/messages/${messageId}/reactions`, null, {
      params: { emoji },
    });
    return res.data?.data;
  },

  async removeReaction(messageId, emoji) {
    const res = await apiClient.delete(`/chat/messages/${messageId}/reactions`, {
      params: { emoji },
    });
    return res.data?.data;
  },
};
