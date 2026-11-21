-- =============================================================================
-- ChatSystem Database Initialization Script (MySQL 8.0+)
-- Database: chat_system
-- Description: Creates all tables, foreign keys, unique constraints, and indexes
--              matching the entity models and class diagram.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `chat_system`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `chat_system`;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables in proper dependency order if they exist
DROP TABLE IF EXISTS `override_deny_permissions`;
DROP TABLE IF EXISTS `override_allow_permissions`;
DROP TABLE IF EXISTS `permission_overrides`;
DROP TABLE IF EXISTS `dm_recipients`;
DROP TABLE IF EXISTS `reactions`;
DROP TABLE IF EXISTS `attachments`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `guild_channels`;
DROP TABLE IF EXISTS `dm_channels`;
DROP TABLE IF EXISTS `channels`;
DROP TABLE IF EXISTS `channel_groups`;
DROP TABLE IF EXISTS `member_roles`;
DROP TABLE IF EXISTS `server_members`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `server_roles`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `server_bans`;
DROP TABLE IF EXISTS `servers`;
DROP TABLE IF EXISTS `friend_requests`;
DROP TABLE IF EXISTS `friendships`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `users`;

-- Drop any legacy obsolete tables if they exist from prior versions
DROP TABLE IF EXISTS `room_members`;
DROP TABLE IF EXISTS `rooms`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. USERS TABLE
-- =============================================================================
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'OFFLINE',
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `is_verified` BIT(1) NOT NULL DEFAULT b'0',
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. SERVERS TABLE
-- =============================================================================
CREATE TABLE `servers` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `invited_code` VARCHAR(50) DEFAULT NULL,
  `owner_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_servers_invited_code` (`invited_code`),
  CONSTRAINT `fk_servers_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. SERVER ROLES & ROLE PERMISSIONS
-- =============================================================================
CREATE TABLE `server_roles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `hex_color` VARCHAR(7) DEFAULT NULL,
  `position` INT NOT NULL DEFAULT 0,
  `server_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_server_roles_server` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` BIGINT NOT NULL,
  `permission` VARCHAR(50) NOT NULL,
  KEY `idx_role_permissions_role` (`role_id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `server_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. SERVER MEMBERS & MEMBER ROLES (Many-to-Many)
-- =============================================================================
CREATE TABLE `server_members` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `display_name` VARCHAR(100) DEFAULT NULL,
  `server_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_server_members_server_user` (`server_id`, `user_id`),
  CONSTRAINT `fk_server_members_server` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_server_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `member_roles` (
  `member_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  PRIMARY KEY (`member_id`, `role_id`),
  CONSTRAINT `fk_member_roles_member` FOREIGN KEY (`member_id`) REFERENCES `server_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_member_roles_role` FOREIGN KEY (`role_id`) REFERENCES `server_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. SERVER BANS & AUDIT LOGS
-- =============================================================================
CREATE TABLE `server_bans` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `reason` TEXT DEFAULT NULL,
  `user_id` BIGINT NOT NULL,
  `server_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_server_bans_server_user` (`server_id`, `user_id`),
  CONSTRAINT `fk_server_bans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_server_bans_server` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `log` TEXT NOT NULL,
  `server_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audit_logs_server` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. CHANNEL GROUPS (Categories)
-- =============================================================================
CREATE TABLE `channel_groups` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `position` INT NOT NULL DEFAULT 0,
  `server_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_channel_groups_server` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. CHANNELS (Inheritance Base Table - JOINED strategy)
-- =============================================================================
CREATE TABLE `channels` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Guild Channels table (Joined subclass table)
CREATE TABLE `guild_channels` (
  `id` BIGINT NOT NULL,
  `position` INT NOT NULL DEFAULT 0,
  `type` VARCHAR(30) NOT NULL,
  `group_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_guild_channels_channel` FOREIGN KEY (`id`) REFERENCES `channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_guild_channels_group` FOREIGN KEY (`group_id`) REFERENCES `channel_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DM Channels table (Joined subclass table)
CREATE TABLE `dm_channels` (
  `id` BIGINT NOT NULL,
  `is_group` BIT(1) NOT NULL DEFAULT b'0',
  `last_message_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_dm_channels_channel` FOREIGN KEY (`id`) REFERENCES `channels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DM Recipients (Many-to-Many: dm_channels <-> users)
CREATE TABLE `dm_recipients` (
  `channel_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  PRIMARY KEY (`channel_id`, `user_id`),
  CONSTRAINT `fk_dm_recipients_channel` FOREIGN KEY (`channel_id`) REFERENCES `dm_channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_dm_recipients_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. PERMISSION OVERRIDES & OVERRIDE PERMISSIONS
-- =============================================================================
CREATE TABLE `permission_overrides` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `channel_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_permission_overrides_channel` FOREIGN KEY (`channel_id`) REFERENCES `guild_channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_permission_overrides_role` FOREIGN KEY (`role_id`) REFERENCES `server_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `override_allow_permissions` (
  `override_id` BIGINT NOT NULL,
  `permission` VARCHAR(50) NOT NULL,
  KEY `idx_override_allow_override_id` (`override_id`),
  CONSTRAINT `fk_override_allow_override` FOREIGN KEY (`override_id`) REFERENCES `permission_overrides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `override_deny_permissions` (
  `override_id` BIGINT NOT NULL,
  `permission` VARCHAR(50) NOT NULL,
  KEY `idx_override_deny_override_id` (`override_id`),
  CONSTRAINT `fk_override_deny_override` FOREIGN KEY (`override_id`) REFERENCES `permission_overrides` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 9. MESSAGES, ATTACHMENTS & REACTIONS
-- =============================================================================
CREATE TABLE `messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `content` TEXT DEFAULT NULL,
  `is_pinned` BIT(1) NOT NULL DEFAULT b'0',
  `sender_id` BIGINT NOT NULL,
  `channel_id` BIGINT NOT NULL,
  `reply_to_id` BIGINT DEFAULT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  `pinned_at` DATETIME(6) DEFAULT NULL,
  `deleted_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_messages_channel_created` (`channel_id`, `created_at`),
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_channel` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_reply_to` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `attachments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `file_url` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) DEFAULT NULL,
  `file_size` INT DEFAULT NULL,
  `message_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_attachments_message` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reactions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `emoji` VARCHAR(50) NOT NULL,
  `message_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reactions_message_user_emoji` (`message_id`, `user_id`, `emoji`),
  CONSTRAINT `fk_reactions_message` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 10. FRIENDSHIPS & FRIEND REQUESTS
-- =============================================================================
CREATE TABLE `friendships` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_a_id` BIGINT NOT NULL,
  `user_b_id` BIGINT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'FRIEND',
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_friendships_user_a_b` (`user_a_id`, `user_b_id`),
  CONSTRAINT `fk_friendships_user_a` FOREIGN KEY (`user_a_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_friendships_user_b` FOREIGN KEY (`user_b_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `friend_requests` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `sender_id` BIGINT NOT NULL,
  `receiver_id` BIGINT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_friend_requests_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_friend_requests_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 11. PASSWORD RESETS
-- =============================================================================
CREATE TABLE `password_resets` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `otp` VARCHAR(10) NOT NULL,
  `user_id` BIGINT NOT NULL,
  `expired_at` DATETIME(6) NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
