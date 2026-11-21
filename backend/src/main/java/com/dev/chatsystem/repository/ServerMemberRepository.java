package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.Server;
import com.dev.chatsystem.model.ServerMember;
import com.dev.chatsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServerMemberRepository extends JpaRepository<ServerMember, Long> {
    List<ServerMember> findByServerId(Long serverId);
    List<ServerMember> findByUser(User user);
    Optional<ServerMember> findByServerAndUser(Server server, User user);
    Optional<ServerMember> findByServerIdAndUserId(Long serverId, Long userId);
    boolean existsByServerIdAndUserId(Long serverId, Long userId);
}
