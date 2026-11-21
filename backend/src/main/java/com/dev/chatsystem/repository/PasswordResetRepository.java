package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.PasswordReset;
import com.dev.chatsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findTopByUserOrderByCreatedAtDesc(User user);
    Optional<PasswordReset> findByOtp(String otp);
}
