import { useState, useRef, useEffect } from 'react';
import {
  Users,
  Hash,
  Volume2,
  Lock,
  Plus,
  ChevronDown,
  Settings,
  Shield,
  UserCheck,
  Copy,
  Trash2,
  Sliders,
  LogOut,
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { useFeedback } from '../components/ui/Feedback';

export default function ChannelSidebar({
  currentUser,
  activeServer,
  groups = [],
  channels = [],
  dmChannels = [],
  view,
  friends = [],
  pendingCount = 0,
  onOpenFriends,
  onSelectChannel,
  onSelectDM,
  onCreateChannel,
  onCreateGroup,
  onCreateDM,
  onOpenSettings,
  onOpenServerRoles,
  onOpenChannelPermissions,
  onOpenNickname,
  onDeleteServer,
}) {
  const { toast } = useFeedback();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const menuRef = useRef(null);

  const isOwner = activeServer?.owner?.id === currentUser?.id;
  const isHomeView = !activeServer;

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleCopyInviteCode = () => {
    if (activeServer?.invitedCode) {
      navigator.clipboard.writeText(activeServer.invitedCode);
      toast('Đã sao chép mã mời vào bộ nhớ tạm!', 'success');
      setMenuOpen(false);
    }
  };

  // Group channels by groupId
  const unassignedChannels = channels.filter((c) => !c.groupId);
  const groupedChannels = groups.map((g) => ({
    ...g,
    channels: channels.filter((c) => c.groupId === g.id),
  }));

  return (
    <aside className="channel-sidebar" aria-label="Thanh kênh">
      {/* 1. HEADER (SERVER HEADER OR HOME HEADER) */}
      {isHomeView ? (
        <div className="sidebar-header" style={{ cursor: 'default' }}>
          <span>Trang chủ</span>
        </div>
      ) : (
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div className="sidebar-header" onClick={() => setMenuOpen((o) => !o)}>
            <span className="ellipsis" style={{ fontWeight: 700 }}>
              {activeServer.name}
            </span>
            <ChevronDown
              size={18}
              style={{
                transform: menuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform var(--transition-fast)',
              }}
            />
          </div>

          {/* SERVER OPTIONS DROPDOWN MENU */}
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 8,
                right: 8,
                backgroundColor: 'var(--bg-modal)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-high)',
                border: '1px solid var(--border-subtle)',
                padding: 6,
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <button
                className="channel-item"
                style={{ width: '100%' }}
                onClick={handleCopyInviteCode}
              >
                <Copy size={16} color="var(--accent)" />
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Sao chép mã mời</span>
              </button>

              <button
                className="channel-item"
                style={{ width: '100%' }}
                onClick={() => {
                  setMenuOpen(false);
                  onOpenNickname();
                }}
              >
                <UserCheck size={16} />
                <span>Đổi biệt danh máy chủ</span>
              </button>

              {isOwner && (
                <>
                  <div style={{ height: 1, backgroundColor: 'var(--divider)', margin: '4px 0' }} />

                  <button
                    className="channel-item"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setMenuOpen(false);
                      onCreateChannel(null);
                    }}
                  >
                    <Plus size={16} />
                    <span>Tạo kênh mới</span>
                  </button>

                  <button
                    className="channel-item"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setMenuOpen(false);
                      onCreateGroup();
                    }}
                  >
                    <Sliders size={16} />
                    <span>Tạo danh mục kênh</span>
                  </button>

                  <button
                    className="channel-item"
                    style={{ width: '100%' }}
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenServerRoles();
                    }}
                  >
                    <Shield size={16} />
                    <span>Cài đặt vai trò & quyền</span>
                  </button>

                  <div style={{ height: 1, backgroundColor: 'var(--divider)', margin: '4px 0' }} />

                  <button
                    className="channel-item"
                    style={{ width: '100%', color: 'var(--text-danger)' }}
                    onClick={() => {
                      setMenuOpen(false);
                      if (window.confirm(`Bạn có chắc muốn giải tán máy chủ "${activeServer.name}"?`)) {
                        onDeleteServer(activeServer.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Xóa máy chủ</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. CHANNELS LIST OR HOME NAVIGATION */}
      <div className="sidebar-content">
        {isHomeView ? (
          <>
            {/* Friends Navigation Item */}
            <div
              className={`channel-item ${view.type === 'friends' ? 'active' : ''}`}
              onClick={onOpenFriends}
            >
              <Users size={20} />
              <span style={{ fontWeight: 600 }}>Bạn bè</span>
              {pendingCount > 0 && <span className="badge-unread ml-auto">{pendingCount}</span>}
            </div>

            {/* Direct Messages Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 8px 4px 8px',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}
              >
                Tin nhắn trực tiếp
              </span>
              <button
                className="btn-icon"
                style={{ width: 20, height: 20 }}
                onClick={onCreateDM}
                title="Tạo cuộc trò chuyện trực tiếp"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Direct Messages List */}
            {dmChannels.length === 0 ? (
              <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-subtle)' }}>
                Chưa có cuộc trò chuyện nào. Bấm (+) để bắt đầu.
              </div>
            ) : (
              dmChannels.map((dm) => {
                const isActive = view.type === 'channel' && view.channelId === dm.id;
                const otherUsers = (dm.recipients || []).filter((r) => r.id !== currentUser?.id);
                const dmName =
                  dm.name || otherUsers.map((u) => u.displayName || u.username).join(', ') || 'Cuộc trò chuyện';

                return (
                  <div
                    key={dm.id}
                    className={`channel-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectDM(dm)}
                  >
                    <Avatar
                      src={otherUsers[0]?.avatarUrl}
                      name={dmName}
                      size={24}
                      status={otherUsers[0]?.status}
                    />
                    <span className="ellipsis" style={{ flex: 1 }}>
                      {dmName}
                    </span>
                  </div>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Unassigned channels if any */}
            {unassignedChannels.length > 0 && (
              <div className="category-channels">
                {unassignedChannels.map((channel) => {
                  const isActive = view.type === 'channel' && view.channelId === channel.id;
                  const isAnnouncement = channel.type === 'GUILD_ANNOUNCEMENT';
                  const canManage = isOwner || channel.myPermissions?.includes('MANAGE_CHANNEL');

                  return (
                    <div
                      key={channel.id}
                      className={`channel-item ${isActive ? 'active' : ''}`}
                      onClick={() => onSelectChannel(channel)}
                    >
                      {channel.isPrivate ? (
                        <Lock size={16} />
                      ) : isAnnouncement ? (
                        <Volume2 size={18} />
                      ) : (
                        <Hash size={18} />
                      )}
                      <span className="ellipsis">{channel.name}</span>
                      {canManage && (
                        <div className="channel-actions">
                          <button
                            className="btn-icon"
                            style={{ width: 22, height: 22 }}
                            title="Cài đặt phân quyền kênh"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChannelPermissions(channel);
                            }}
                          >
                            <Settings size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grouped channels (Categories) */}
            {groupedChannels.map((group) => {
              const isCollapsed = collapsedGroups[group.id];

              return (
                <div key={group.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="category-header" onClick={() => toggleGroup(group.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ChevronDown
                        size={14}
                        style={{
                          transform: isCollapsed ? 'rotate(-90deg)' : 'none',
                          transition: 'transform var(--transition-fast)',
                        }}
                      />
                      <span className="ellipsis">{group.name}</span>
                    </div>
                    {isOwner && (
                      <button
                        className="btn-icon"
                        style={{ width: 20, height: 20 }}
                        title="Tạo kênh trong danh mục này"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateChannel(group.id);
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="category-channels">
                      {group.channels?.length === 0 ? (
                        <div style={{ padding: '4px 16px', fontSize: 12, color: 'var(--text-subtle)' }}>
                          Chưa có kênh nào
                        </div>
                      ) : (
                        group.channels?.map((channel) => {
                          const isActive = view.type === 'channel' && view.channelId === channel.id;
                          const isAnnouncement = channel.type === 'GUILD_ANNOUNCEMENT';
                          const canManage = isOwner || channel.myPermissions?.includes('MANAGE_CHANNEL');

                          return (
                            <div
                              key={channel.id}
                              className={`channel-item ${isActive ? 'active' : ''}`}
                              onClick={() => onSelectChannel(channel)}
                            >
                              {channel.isPrivate ? (
                                <Lock size={16} />
                              ) : isAnnouncement ? (
                                <Volume2 size={18} />
                              ) : (
                                <Hash size={18} />
                              )}
                              <span className="ellipsis">{channel.name}</span>
                              {canManage && (
                                <div className="channel-actions">
                                  <button
                                    className="btn-icon"
                                    style={{ width: 22, height: 22 }}
                                    title="Cài đặt phân quyền kênh"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenChannelPermissions(channel);
                                    }}
                                  >
                                    <Settings size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* 3. USER FOOTER PROFILE */}
      <footer className="user-footer">
        <div className="user-footer-profile" title={currentUser?.email || ''}>
          <Avatar
            src={currentUser?.avatarUrl}
            name={currentUser?.username}
            size={32}
            status={currentUser?.status || 'ONLINE'}
          />
          <div className="user-footer-meta">
            <span className="user-footer-name ellipsis">
              {currentUser?.username || 'Khách'}
            </span>
            <span className="user-footer-tag ellipsis">
              {currentUser?.email?.split('@')[0] || ''}
            </span>
          </div>
        </div>

        <button
          className="btn-icon"
          onClick={onOpenSettings}
          title="Cài đặt giao diện & Hệ thống"
          aria-label="Cài đặt"
        >
          <Settings size={18} />
        </button>
      </footer>
    </aside>
  );
}
