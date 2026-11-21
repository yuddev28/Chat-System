package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.DMChannel;
import com.dev.chatsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DMChannelRepository extends JpaRepository<DMChannel, Long> {

    @Query("SELECT d FROM DMChannel d JOIN d.recipients r WHERE r = :user ORDER BY d.lastMessageAt DESC NULLS LAST")
    List<DMChannel> findByUser(@Param("user") User user);

    @Query("SELECT d FROM DMChannel d WHERE d.isGroup = false AND :user1 MEMBER OF d.recipients AND :user2 MEMBER OF d.recipients")
    Optional<DMChannel> findDirectDmBetween(@Param("user1") User user1, @Param("user2") User user2);
}
