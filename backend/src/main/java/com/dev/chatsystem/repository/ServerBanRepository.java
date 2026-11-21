package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.ServerBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServerBanRepository extends JpaRepository<ServerBan, Long> {
    List<ServerBan> findByServerId(Long serverId);
    Optional<ServerBan> findByServerIdAndUserId(Long serverId, Long userId);
    boolean existsByServerIdAndUserId(Long serverId, Long userId);
}
