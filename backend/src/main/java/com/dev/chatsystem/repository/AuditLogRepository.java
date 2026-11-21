package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByServerIdOrderByCreatedAtDesc(Long serverId);
}
