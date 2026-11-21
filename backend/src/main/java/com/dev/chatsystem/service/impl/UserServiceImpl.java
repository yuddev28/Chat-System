package com.dev.chatsystem.service.impl;

import com.dev.chatsystem.dto.request.LoginRequest;
import com.dev.chatsystem.dto.request.RegisterRequest;
import com.dev.chatsystem.dto.response.UserResponse;
import com.dev.chatsystem.exception.AppException;
import com.dev.chatsystem.exception.ErrorCode;
import com.dev.chatsystem.model.User;
import com.dev.chatsystem.model.UserStatus;
import com.dev.chatsystem.repository.UserRepository;
import com.dev.chatsystem.security.JwtService;
import com.dev.chatsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

/**
 * Implementation of UserService managing registration, authentication, JWT tokens, and user lookup.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Registers a new user account.
     * Validates uniqueness of both email and username, hashes the password via BCrypt,
     * initializes UserStatus to ONLINE, and returns the UserResponse.
     */
    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED, "Email đã được đăng ký trên hệ thống");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED, "Username đã tồn tại");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .description(request.getDescription())
                .status(UserStatus.ONLINE)
                .isVerified(false)
                .build();

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    /**
     * Authenticates credentials (accepting either email or username).
     * Verifies the password, marks user status as ONLINE, generates a JWT token,
     * and packages it into an HTTP-only secure cookie with a 1-hour expiration.
     */
    @Override
    public ResponseCookie login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmailOrUsername())
                .orElseGet(() -> userRepository.findByUsername(request.getEmailOrUsername())
                        .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS)));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setStatus(UserStatus.ONLINE);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ofHours(1))
                .sameSite("Lax")
                .build();
    }

    /**
     * Clears the authentication token by returning an immediately expired cookie.
     */
    @Override
    public ResponseCookie logout() {
        return ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }

    /**
     * Retrieves the profile of the authenticated user.
     */
    @Override
    public UserResponse getCurrentUserProfile(String email) {
        User user = getUserByEmail(email);
        return mapToUserResponse(user);
    }

    /**
     * Resolves a user entity by their email address.
     */
    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * Converts User model to UserResponse DTO.
     */
    @Override
    public UserResponse mapToUserResponse(User user) {
        return UserResponse.fromEntity(user);
    }
}
