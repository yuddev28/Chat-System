package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.Message;
import com.dev.chatsystem.model.Reaction;
import com.dev.chatsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    List<Reaction> findByMessageId(Long messageId);
    Optional<Reaction> findByMessageAndUserAndEmoji(Message message, User user, String emoji);
}
