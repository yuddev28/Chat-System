export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || '/ws';

export const USER_STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  BUSY: 'BUSY',
  INVISIBLE: 'INVISIBLE',
};

export const CHANNEL_TYPE = {
  GUILD_TEXT: 'GUILD_TEXT',
  GUILD_ANNOUNCEMENT: 'GUILD_ANNOUNCEMENT',
};

export const STORAGE_KEYS = {
  SETTINGS: 'chatsystem_settings',
};

export const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'midnight' | 'light'
  accent: 'blurple', // 'blurple' | 'teal' | 'emerald' | 'amber' | 'rose'
  density: 'cozy', // 'cozy' | 'compact'
  soundEnabled: true,
};
