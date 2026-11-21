import apiClient from './apiClient';

export const serverService = {
  async getMyServers() {
    const res = await apiClient.get('/servers');
    return res.data?.data || [];
  },

  async getServerDetails(serverId) {
    const res = await apiClient.get(`/servers/${serverId}`);
    return res.data?.data;
  },

  async createServer(data) {
    const res = await apiClient.post('/servers', data);
    return res.data?.data;
  },

  async joinServerByInviteCode(inviteCode) {
    const res = await apiClient.post(`/servers/join/${inviteCode}`);
    return res.data?.data;
  },

  async updateNickname(serverId, nickname) {
    const res = await apiClient.put(`/servers/${serverId}/members/me/nickname`, { nickname });
    return res.data?.data;
  },

  async createRole(serverId, roleData) {
    const res = await apiClient.post(`/servers/${serverId}/roles`, roleData);
    return res.data?.data;
  },

  async assignMemberRoles(serverId, targetUserId, roleIds) {
    const res = await apiClient.put(`/servers/${serverId}/members/${targetUserId}/roles`, { roleIds });
    return res.data?.data;
  },

  async kickMember(serverId, targetUserId) {
    const res = await apiClient.delete(`/servers/${serverId}/members/${targetUserId}/kick`);
    return res.data;
  },

  async banMember(serverId, targetUserId, reason = 'Vi phạm quy định') {
    const res = await apiClient.post(`/servers/${serverId}/members/${targetUserId}/ban`, null, {
      params: { reason },
    });
    return res.data;
  },

  async deleteServer(serverId) {
    const res = await apiClient.delete(`/servers/${serverId}`);
    return res.data;
  },
};
