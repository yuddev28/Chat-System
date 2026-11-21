package com.dev.chatsystem.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SendMessageRequest {
    private String content;
    private Long replyToId;
    private List<AttachmentRequest> attachments;

    @Data
    public static class AttachmentRequest {
        private String fileUrl;
        private String fileType;
        private int fileSize;
    }
}
