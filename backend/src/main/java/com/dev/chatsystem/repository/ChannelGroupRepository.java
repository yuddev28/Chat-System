package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.ChannelGroup;
import com.dev.chatsystem.model.Server;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelGroupRepository extends JpaRepository<ChannelGroup, Long> {
    List<ChannelGroup> findByServerOrderByPositionAsc(Server server);
    List<ChannelGroup> findByServerIdOrderByPositionAsc(Long serverId);
}
