export const SERVER_PERMISSIONS = {
  SEND_MESSAGE: 'SEND_MESSAGE',
  READ_MESSAGE: 'READ_MESSAGE',
  INVITE: 'INVITE',
  MANAGE_CHANNEL: 'MANAGE_CHANNEL',
  KICK_MEMBER: 'KICK_MEMBER',
  BAN_MEMBER: 'BAN_MEMBER',
  MANAGE_MESSAGES: 'MANAGE_MESSAGES',
};

export const PERMISSION_METADATA = [
  {
    key: SERVER_PERMISSIONS.READ_MESSAGE,
    name: 'Xem kênh & đọc tin nhắn',
    description: 'Cho phép thành viên nhìn thấy kênh này và đọc lịch sử tin nhắn.',
    category: 'general',
  },
  {
    key: SERVER_PERMISSIONS.MANAGE_CHANNEL,
    name: 'Quản lý kênh',
    description: 'Cho phép tạo, chỉnh sửa hoặc xóa kênh và danh mục.',
    category: 'general',
  },
  {
    key: SERVER_PERMISSIONS.INVITE,
    name: 'Tạo lời mời',
    description: 'Cho phép thành viên mời người khác vào máy chủ qua mã mời.',
    category: 'general',
  },
  {
    key: SERVER_PERMISSIONS.SEND_MESSAGE,
    name: 'Gửi tin nhắn',
    description: 'Cho phép thành viên gửi tin nhắn văn bản và tệp vào kênh.',
    category: 'text',
  },
  {
    key: SERVER_PERMISSIONS.MANAGE_MESSAGES,
    name: 'Quản lý tin nhắn',
    description: 'Cho phép xóa tin nhắn của người khác và ghim tin nhắn trong kênh.',
    category: 'text',
  },
  {
    key: SERVER_PERMISSIONS.KICK_MEMBER,
    name: 'Đuổi thành viên',
    description: 'Cho phép đuổi thành viên ra khỏi máy chủ.',
    category: 'membership',
  },
  {
    key: SERVER_PERMISSIONS.BAN_MEMBER,
    name: 'Cấm thành viên',
    description: 'Cho phép cấm vĩnh viễn thành viên khỏi máy chủ.',
    category: 'membership',
  },
];

export const CHANNEL_PERMISSION_KEYS = [
  SERVER_PERMISSIONS.READ_MESSAGE,
  SERVER_PERMISSIONS.MANAGE_CHANNEL,
  SERVER_PERMISSIONS.INVITE,
  SERVER_PERMISSIONS.SEND_MESSAGE,
  SERVER_PERMISSIONS.MANAGE_MESSAGES,
];
