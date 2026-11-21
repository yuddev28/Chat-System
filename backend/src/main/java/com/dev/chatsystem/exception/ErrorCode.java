package com.dev.chatsystem.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Lỗi hệ thống không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_NOT_FOUND(1001, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    USER_EXISTED(1002, "Email hoặc tài khoản đã tồn tại", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(1003, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    UNAUTHENTICATED(1004, "Chưa đăng nhập hoặc phiên làm việc đã hết hạn", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED_ACTION(1005, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    
    FRIEND_REQUEST_NOT_FOUND(2001, "Không tìm thấy yêu cầu kết bạn", HttpStatus.NOT_FOUND),
    CANNOT_ADD_SELF(2002, "Không thể gửi yêu cầu kết bạn cho chính mình", HttpStatus.BAD_REQUEST),
    ALREADY_FRIENDS(2003, "Đã là bạn bè hoặc đang có yêu cầu chờ xử lý", HttpStatus.BAD_REQUEST),
    INVALID_USER_TAG(2004, "Định dạng Tag không hợp lệ (Ví dụ đúng: Username#1234)", HttpStatus.BAD_REQUEST),

    ROOM_NOT_FOUND(3001, "Không tìm thấy phòng chat", HttpStatus.NOT_FOUND),
    CHANNEL_NOT_FOUND(3002, "Không tìm thấy kênh chat", HttpStatus.NOT_FOUND),
    NOT_ROOM_MEMBER(3003, "Bạn không phải là thành viên của phòng chat này", HttpStatus.FORBIDDEN),
    ALREADY_IN_ROOM(3004, "Người dùng đã ở trong phòng chat", HttpStatus.BAD_REQUEST),
    CANNOT_MODIFY_OWNER(3005, "Không thể thay đổi quyền hoặc xóa Chủ room", HttpStatus.BAD_REQUEST),
    CO_OWNER_PERMISSION_DENIED(3006, "Phó room không có quyền thao tác với Phó room khác hoặc Chủ room", HttpStatus.FORBIDDEN),
    MESSAGE_NOT_FOUND(3007, "Không tìm thấy tin nhắn", HttpStatus.NOT_FOUND),
    INVALID_INPUT(4001, "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),

    USER_ALREADY_IN_ROOM(3008, "Người dùng đã là thành viên của phòng chat", HttpStatus.BAD_REQUEST),
    USER_NOT_IN_ROOM(3009, "Người dùng không phải là thành viên của phòng chat", HttpStatus.BAD_REQUEST),
    CANNOT_REMOVE_SELF(3010, "Không thể xóa chính mình khỏi phòng chat", HttpStatus.BAD_REQUEST),
    CANNOT_REMOVE_OWNER(3011, "Không thể xóa Chủ room khỏi phòng chat", HttpStatus.BAD_REQUEST),
    CANNOT_REMOVE_CO_OWNER(3012, "Không thể xóa Phó room khỏi phòng chat", HttpStatus.BAD_REQUEST),
    CANNOT_PROMOTE_SELF(3013, "Không thể thăng cấp chính mình lên Phó room", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
