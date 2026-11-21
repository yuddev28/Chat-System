import { useState, useRef, useEffect } from 'react';
import { Crown, MessageSquare, UserX, Ban } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';

export default function MemberPanel({
  members = [],
  roles = [],
  currentUser,
  activeServer,
  onKickMember,
  onBanMember,
  onStartDM,
  onClose,
}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  const isOwner = activeServer?.owner?.id === currentUser?.id;

  // Close context menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setSelectedMember(null);
      }
    };
    if (selectedMember) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedMember]);

  const handleMemberClick = (e, member) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: Math.min(rect.left - 180, window.innerWidth - 200), y: rect.top });
    setSelectedMember(member);
  };

  // Group members into Online / Offline
  const onlineMembers = members.filter((m) => m.user?.status && m.user.status !== 'OFFLINE');
  const offlineMembers = members.filter((m) => !m.user?.status || m.user.status === 'OFFLINE');

  const renderMemberRow = (member) => {
    const isServerOwner = activeServer?.owner?.id === member.user?.id;
    const isSelf = currentUser?.id === member.user?.id;

    // Find highest position role with color
    const sortedRoles = [...(member.roles || [])].sort((a, b) => (b.position || 0) - (a.position || 0));
    const roleWithColor = sortedRoles.find((r) => r.hexColor);
    const roleColor = roleWithColor ? roleWithColor.hexColor : undefined;

    return (
      <div
        key={member.id}
        className="member-item"
        onClick={(e) => handleMemberClick(e, member)}
        title={`Bấm để xem tùy chọn thành viên`}
      >
        <Avatar
          src={member.user?.avatarUrl}
          name={member.displayName || member.user?.username}
          size={32}
          status={member.user?.status || 'OFFLINE'}
        />

        <div className="ellipsis" style={{ flex: 1 }}>
          <div className="member-name" style={{ color: roleColor }}>
            <span className="ellipsis">{member.displayName || member.user?.username}</span>
            {isServerOwner && (
              <Crown size={14} color="#F59E0B" fill="#F59E0B" title="Chủ sở hữu máy chủ" />
            )}
          </div>
          {sortedRoles.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }} className="ellipsis">
              {sortedRoles[0].name}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className="member-panel" aria-label="Bảng thành viên máy chủ">
      {onlineMembers.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="member-group-title">Trực tuyến — {onlineMembers.length}</div>
          {onlineMembers.map(renderMemberRow)}
        </div>
      )}

      {offlineMembers.length > 0 && (
        <div>
          <div className="member-group-title">Ngoại tuyến — {offlineMembers.length}</div>
          {offlineMembers.map(renderMemberRow)}
        </div>
      )}

      {/* MEMBER CONTEXT MENU */}
      {selectedMember && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPosition.y,
            left: menuPosition.x,
            backgroundColor: 'var(--bg-modal)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-high)',
            padding: 6,
            zIndex: 1000,
            width: 190,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div style={{ padding: '6px 8px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
            {selectedMember.displayName || selectedMember.user?.username}
          </div>

          {selectedMember.user?.id !== currentUser?.id && (
            <button
              className="channel-item"
              style={{ width: '100%', fontSize: 13 }}
              onClick={() => {
                const target = selectedMember.user;
                setSelectedMember(null);
                onStartDM(target);
              }}
            >
              <MessageSquare size={16} />
              <span>Gửi tin nhắn riêng</span>
            </button>
          )}

          {isOwner && selectedMember.user?.id !== currentUser?.id && (
            <>
              <div style={{ height: 1, backgroundColor: 'var(--divider)', margin: '4px 0' }} />

              <button
                className="channel-item"
                style={{ width: '100%', fontSize: 13, color: 'var(--text-danger)' }}
                onClick={() => {
                  const targetId = selectedMember.user?.id;
                  setSelectedMember(null);
                  if (window.confirm(`Đuổi ${selectedMember.displayName} ra khỏi máy chủ?`)) {
                    onKickMember(targetId);
                  }
                }}
              >
                <UserX size={16} />
                <span>Đuổi khỏi máy chủ</span>
              </button>

              <button
                className="channel-item"
                style={{ width: '100%', fontSize: 13, color: 'var(--text-danger)' }}
                onClick={() => {
                  const targetId = selectedMember.user?.id;
                  setSelectedMember(null);
                  if (window.confirm(`Cấm vĩnh viễn ${selectedMember.displayName} khỏi máy chủ?`)) {
                    onBanMember(targetId);
                  }
                }}
              >
                <Ban size={16} />
                <span>Cấm vĩnh viễn (Ban)</span>
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
