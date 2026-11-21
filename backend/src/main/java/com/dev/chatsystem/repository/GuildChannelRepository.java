package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.GuildChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuildChannelRepository extends JpaRepository<GuildChannel, Long> {
    List<GuildChannel> findByGroupIdOrderByPositionAsc(Long groupId);

    @Query("SELECT gc FROM GuildChannel gc WHERE gc.group.server.id = :serverId ORDER BY gc.position ASC")
    List<GuildChannel> findByServerId(@Param("serverId") Long serverId);
}
