package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.Server;
import com.dev.chatsystem.model.ServerRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServerRoleRepository extends JpaRepository<ServerRole, Long> {
    List<ServerRole> findByServerOrderByPositionAsc(Server server);

    List<ServerRole> findByServerIdOrderByPositionAsc(Long serverId);

    List<ServerRole> findByServerId(Long serverId);

    Optional<ServerRole> findByServerIdAndName(Long serverId, String name);
}
