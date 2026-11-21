package com.dev.chatsystem.service;

import com.dev.chatsystem.dto.request.LoginRequest;
import com.dev.chatsystem.dto.request.RegisterRequest;
import com.dev.chatsystem.dto.response.UserResponse;
import com.dev.chatsystem.model.User;
import org.springframework.http.ResponseCookie;

public interface UserService {
    UserResponse register(RegisterRequest request);

    ResponseCookie login(LoginRequest request);

    ResponseCookie logout();

    UserResponse getCurrentUserProfile(String email);

    User getUserByEmail(String email);

    UserResponse mapToUserResponse(User user);
}
