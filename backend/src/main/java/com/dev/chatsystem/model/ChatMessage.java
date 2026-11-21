package com.dev.chatsystem.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Model đại diện cho thông tin một Tin nhắn trong hệ thống Chat.
 * Bao gồm các loại tin nhắn:
 * - JOIN: Khi người dùng bắt đầu tham gia vào phòng chat
 * - CHAT: Tin nhắn văn bản thông thường
 * - LEAVE: Khi người dùng rời khỏi phòng chat (đóng tab, mất mạng)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    // Loại tin nhắn: CHAT, JOIN, LEAVE
    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }

    private MessageType type;    // Loại sự kiện (CHAT / JOIN / LEAVE)
    private String content;     // Nội dung tin nhắn
    private String sender;      // Tên biệt danh người gửi
    private String timestamp;   // Thời gian gửi (VD: 14:30)
}
