import apiClient from './apiClient';

export const friendService = {
  async getFriendsList() {
    const res = await apiClient.get('/friends');
    return res.data?.data || [];
  },

  async getPendingRequests() {
    const res = await apiClient.get('/friends/pending');
    return res.data?.data || [];
  },

  async sendFriendRequest(data) {
    const res = await apiClient.post('/friends/request', data);
    return res.data?.data;
  },

  async respondFriendRequest(requestId, accept) {
    const res = await apiClient.put(`/friends/request/${requestId}`, null, {
      params: { accept },
    });
    return res.data?.data;
  },

  async unfriend(targetUserId) {
    const res = await apiClient.delete(`/friends/${targetUserId}`);
    return res.data;
  },

  async blockUser(targetUserId) {
    const res = await apiClient.post(`/friends/block/${targetUserId}`);
    return res.data;
  },
};
