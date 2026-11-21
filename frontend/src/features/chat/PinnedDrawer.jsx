import { X, Pin } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { formatTimestamp } from '../../utils/helpers';

export default function PinnedDrawer({
  isOpen = false,
  onClose,
  pinnedMessages = [],
  onUnpin,
}) {
  if (!isOpen) return null;

  return (
    <aside className="pinned-drawer" aria-label="Tin nhắn đã ghim">
      <div className="pinned-drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pin size={18} color="var(--accent)" />
          <span>Tin nhắn đã ghim ({pinnedMessages.length})</span>
        </div>
        <button className="btn-icon" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>
      </div>

      <div className="pinned-drawer-body">
        {pinnedMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-subtle)' }}>
            Chưa có tin nhắn nào được ghim trong kênh này.
          </div>
        ) : (
          pinnedMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                backgroundColor: 'var(--bg-panel)',
                borderRadius: 'var(--radius-sm)',
                padding: 12,
                border: '1px solid var(--border-subtle)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Avatar src={msg.sender?.avatarUrl} name={msg.sender?.username} size={28} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-header)' }}>
                    {msg.sender?.username}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                    {formatTimestamp(msg.createdAt)}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, color: 'var(--text-danger)' }}
                  onClick={() => onUnpin(msg.id)}
                  title="Gỡ ghim tin nhắn này"
                >
                  Gỡ ghim
                </button>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-normal)', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
