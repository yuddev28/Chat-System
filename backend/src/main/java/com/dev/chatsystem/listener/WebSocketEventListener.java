package com.dev.chatsystem.listener;

import com.dev.chatsystem.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * Event Listener lắng nghe các sự kiện hệ thống của WebSocket Spring.
 * Đặc biệt là lắng nghe khi có người dùng tắt tab trình duyệt / mất kết nối mạng.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    // Helper class của Spring cho phép gửi tin nhắn tới kênh topic một cách chủ động từ bất kỳ đâu
    private final SimpMessageSendingOperations messagingTemplate;

    /**
     * Bắt sự kiện ngắt kết nối (SessionDisconnectEvent) từ trình duyệt Client.
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Lấy lại username đã lưu trong session ở phương thức addUser() trước đó
        String username = null;
        if (headerAccessor.getSessionAttributes() != null) {
            username = (String) headerAccessor.getSessionAttributes().get("username");
        }

        if (username != null) {
            log.info("Người dùng ngắt kết nối: {}", username);

            // Tạo tin nhắn sự kiện LEAVE
            ChatMessage chatMessage = ChatMessage.builder()
                    .type(ChatMessage.MessageType.LEAVE)
                    .sender(username)
                    .content(username + " đã rời khỏi phòng chat!")
                    .timestamp(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")))
                    .build();

            // Chủ động gửi thông báo rời phòng tới kênh "/topic/public" cho tất cả mọi người còn lại biết
            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }
}
