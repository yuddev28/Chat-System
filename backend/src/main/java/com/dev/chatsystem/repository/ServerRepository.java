package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.Server;
import com.dev.chatsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServerRepository extends JpaRepository<Server, Long> {
    Optional<Server> findByInvitedCode(String invitedCode);
    List<Server> findByOwner(User owner);
}
