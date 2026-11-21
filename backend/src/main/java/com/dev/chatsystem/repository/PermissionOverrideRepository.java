package com.dev.chatsystem.repository;

import com.dev.chatsystem.model.PermissionOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface PermissionOverrideRepository extends JpaRepository<PermissionOverride, Long> {
    List<PermissionOverride> findByChannelId(Long channelId);
    Optional<PermissionOverride> findByChannelIdAndRoleId(Long channelId, Long roleId);
    void deleteByChannelIdAndRoleId(Long channelId, Long roleId);
}
