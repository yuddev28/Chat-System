import { Hash, Volume2, MessageSquare, Pin, Users } from 'lucide-react';

export default function ChatHeader({
  kind = 'channel', // 'channel' | 'dm'
  title = '',
  subtitle = '',
  pinnedCount = 0,
  pinnedOpen = false,
  onTogglePinned,
  showMembersToggle = true,
  membersOpen = false,
  onToggleMembers,
}) {
  return (
    <header className="chat-header">
      <div className="chat-header-title">
        {kind === 'dm' ? (
          <MessageSquare size={22} color="var(--text-muted)" />
        ) : (
          <Hash size={22} color="var(--text-muted)" />
        )}
        <span className="ellipsis">{title}</span>
        {subtitle && <span className="chat-header-subtitle ellipsis">{subtitle}</span>}
      </div>

      <div className="chat-header-actions">
        {/* Pinned Messages Button */}
        <button
          className={`btn-icon ${pinnedOpen ? 'active' : ''}`}
          onClick={onTogglePinned}
          title="Tin nhắn đã ghim"
          aria-label="Tin nhắn đã ghim"
          style={{ position: 'relative', color: pinnedOpen ? 'var(--text-header)' : undefined }}
        >
          <Pin size={20} />
          {pinnedCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
              }}
            />
          )}
        </button>

        {/* Member Panel Toggle Button (for Guild Channels) */}
        {showMembersToggle && (
          <button
            className={`btn-icon ${membersOpen ? 'active' : ''}`}
            onClick={onToggleMembers}
            title={membersOpen ? 'Ẩn danh sách thành viên' : 'Hiện danh sách thành viên'}
            aria-label="Danh sách thành viên"
            style={{ color: membersOpen ? 'var(--text-header)' : undefined }}
          >
            <Users size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
