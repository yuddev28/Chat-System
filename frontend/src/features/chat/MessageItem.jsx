import { useState } from 'react';
import { Reply, Pin, Trash2, File, Download, CornerDownRight } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { formatTimestamp } from '../../utils/helpers';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥'];

export default function MessageItem({
  message,
  currentUser,
  replyTargetMessage = null,
  isHighlighted = false,
  onReply,
  onTogglePin,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  onJumpToMessage,
}) {
  const isAuthor = currentUser?.id === message.sender?.id;
  const isDeleted = !!message.deletedAt;

  // Resolve reply target details (from backend replyTo DTO or from local message list lookup)
  const replySenderName =
    message.replyTo?.senderName ||
    replyTargetMessage?.sender?.username ||
    'tin nhắn trước';

  const replyContent =
    message.replyTo?.content ||
    replyTargetMessage?.content ||
    (message.replyToId ? 'Bấm để xem tin nhắn gốc' : '');

  // Group reactions by emoji
  const reactionsMap = (message.reactions || []).reduce((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = { count: 0, users: [], hasReacted: false };
    }
    acc[r.emoji].count += 1;
    acc[r.emoji].users.push(r.username);
    if (r.userId === currentUser?.id) {
      acc[r.emoji].hasReacted = true;
    }
    return acc;
  }, {});

  const handleReactionClick = (emoji, hasReacted) => {
    if (hasReacted) {
      onRemoveReaction(message.id, emoji);
    } else {
      onAddReaction(message.id, emoji);
    }
  };

  return (
    <div
      id={`message-${message.id}`}
      className={`message-item ${message.isPinned ? 'is-pinned' : ''} ${
        isHighlighted ? 'highlight-jump' : ''
      }`}
    >
      {/* Floating Toolbar on Hover */}
      {!isDeleted && (
        <div className="message-toolbar">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="btn-icon"
              style={{ width: 28, height: 28, fontSize: 14 }}
              onClick={() => onAddReaction(message.id, emoji)}
              title={`Thả cảm xúc ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          <button
            className="btn-icon"
            style={{ width: 28, height: 28 }}
            onClick={() => onReply(message)}
            title="Trả lời tin nhắn"
          >
            <Reply size={16} />
          </button>

          <button
            className="btn-icon"
            style={{
              width: 28,
              height: 28,
              color: message.isPinned ? 'var(--accent)' : undefined,
            }}
            onClick={() => onTogglePin(message.id)}
            title={message.isPinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn'}
          >
            <Pin size={16} />
          </button>

          {isAuthor && (
            <button
              className="btn-icon"
              style={{ width: 28, height: 28, color: 'var(--text-danger)' }}
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
                  onDelete(message.id);
                }
              }}
              title="Xóa tin nhắn"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {/* Avatar */}
      <div className="message-avatar">
        <Avatar
          src={message.sender?.avatarUrl}
          name={message.sender?.username}
          size={40}
        />
      </div>

      {/* Message Body */}
      <div className="message-content-wrapper">
        {/* Reply To Preview (Interactive jump button) */}
        {message.replyToId && (
          <div
            className="message-reply-preview"
            onClick={() => onJumpToMessage && onJumpToMessage(message.replyToId)}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'color var(--transition-fast)',
            }}
            title="Bấm để nhảy tới tin nhắn này"
          >
            <span style={{ fontWeight: 600, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CornerDownRight size={12} />
              @{replySenderName}:
            </span>
            <span
              style={{
                marginLeft: 4,
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 420,
              }}
            >
              {replyContent || '[Tin nhắn gốc]'}
            </span>
          </div>
        )}

        {/* Sender Meta */}
        <div className="message-meta">
          <span className="message-author">{message.sender?.username || 'Người dùng'}</span>
          <span className="message-timestamp">{formatTimestamp(message.createdAt)}</span>
          {message.isPinned && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--accent)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Pin size={12} /> Đã ghim
            </span>
          )}
        </div>

        {/* Content */}
        {isDeleted ? (
          <p style={{ fontStyle: 'italic', color: 'var(--text-subtle)', fontSize: 13 }}>
            [Tin nhắn này đã bị xóa]
          </p>
        ) : (
          <p className="message-text">{message.content}</p>
        )}

        {/* Attachments Grid */}
        {!isDeleted && message.attachments && message.attachments.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 8,
            }}
          >
            {message.attachments.map((att, idx) => {
              const isImage =
                att.fileType?.startsWith('image/') ||
                att.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
                att.fileUrl?.startsWith('data:image/');

              if (isImage) {
                return (
                  <div
                    key={att.id || idx}
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      maxWidth: 360,
                      maxHeight: 240,
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <img
                      src={att.fileUrl}
                      alt="Attachment"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer',
                      }}
                      onClick={() => window.open(att.fileUrl, '_blank')}
                    />
                  </div>
                );
              }

              return (
                <a
                  key={att.id || idx}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: 'var(--text-normal)',
                    fontSize: 13,
                  }}
                >
                  <File size={20} color="var(--accent)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Tệp đính kèm</div>
                    {att.fileSize > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {(att.fileSize / 1024).toFixed(1)} KB
                      </div>
                    )}
                  </div>
                  <Download size={16} style={{ marginLeft: 8 }} />
                </a>
              );
            })}
          </div>
        )}

        {/* Reactions Badges */}
        {!isDeleted && Object.keys(reactionsMap).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {Object.entries(reactionsMap).map(([emoji, data]) => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji, data.hasReacted)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: data.hasReacted ? 'var(--accent-light)' : 'var(--bg-input)',
                  border: `1px solid ${data.hasReacted ? 'var(--accent)' : 'transparent'}`,
                  fontSize: 12,
                  color: data.hasReacted ? 'var(--text-header)' : 'var(--text-normal)',
                }}
                title={data.users.join(', ')}
              >
                <span>{emoji}</span>
                <span style={{ fontWeight: 600 }}>{data.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
