import { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import PinnedDrawer from './PinnedDrawer';

export default function ChatView({
  kind = 'channel', // 'channel' | 'dm'
  title = '',
  subtitle = '',
  messages = [],
  pinnedMessages = [],
  status = 'idle',
  error = null,
  currentUser,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onSend,
  onTogglePin,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
  showMembersToggle = true,
  membersOpen = false,
  onToggleMembers,
  canSend = true,
}) {
  const [pinnedDrawerOpen, setPinnedDrawerOpen] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);

  return (
    <main className="main-view" aria-label="Khung trò chuyện">
      {/* 1. HEADER */}
      <ChatHeader
        kind={kind}
        title={title}
        subtitle={subtitle}
        pinnedCount={pinnedMessages.length}
        pinnedOpen={pinnedDrawerOpen}
        onTogglePinned={() => setPinnedDrawerOpen((o) => !o)}
        showMembersToggle={showMembersToggle}
        membersOpen={membersOpen}
        onToggleMembers={onToggleMembers}
      />

      {/* 2. CHAT BODY (MESSAGES) */}
      <div className="chat-body">
        {status === 'loading' ? (
          <div className="full-center" style={{ flex: 1, gap: 10, color: 'var(--text-muted)' }}>
            <span className="spinner" /> Đang tải lịch sử tin nhắn...
          </div>
        ) : status === 'error' ? (
          <div className="full-center" style={{ flex: 1, color: 'var(--text-danger)', padding: 16 }}>
            {error || 'Đã có lỗi xảy ra khi tải tin nhắn'}
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUser={currentUser}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
            onReply={(msg) => setReplyToMessage(msg)}
            onTogglePin={onTogglePin}
            onDelete={onDeleteMessage}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
          />
        )}

        {/* 3. INPUT BAR */}
        <MessageInput
          channelTitle={title}
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
          onSend={onSend}
          disabled={!canSend}
        />

        {/* 4. PINNED MESSAGES DRAWER */}
        <PinnedDrawer
          isOpen={pinnedDrawerOpen}
          onClose={() => setPinnedDrawerOpen(false)}
          pinnedMessages={pinnedMessages}
          onUnpin={onTogglePin}
        />
      </div>
    </main>
  );
}
