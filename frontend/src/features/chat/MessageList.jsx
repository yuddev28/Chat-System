import { useEffect, useRef, useState, useCallback } from 'react';
import MessageItem from './MessageItem';
import { useFeedback } from '../../components/ui/Feedback';

export default function MessageList({
  messages = [],
  currentUser,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onReply,
  onTogglePin,
  onDelete,
  onAddReaction,
  onRemoveReaction,
}) {
  const { toast } = useFeedback();
  const scrollerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  // Jump to target message when clicking on reply preview
  const handleJumpToMessage = useCallback(
    (targetMessageId) => {
      if (!targetMessageId) return;

      const targetElement = document.getElementById(`message-${targetMessageId}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedMessageId(targetMessageId);

        setTimeout(() => {
          setHighlightedMessageId((cur) => (cur === targetMessageId ? null : cur));
        }, 1800);
      } else {
        toast('Tin nhắn gốc nằm ở các trang trước. Hãy cuộn lên trên để tải thêm.', 'info');
      }
    },
    [toast]
  );

  // Check scroll position
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const threshold = 40;
    isAtBottomRef.current =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= threshold;

    // Trigger load more when scrolled near the top
    if (scroller.scrollTop <= 10 && hasMore && !loadingMore && onLoadMore) {
      prevScrollHeightRef.current = scroller.scrollHeight;
      onLoadMore();
    }
  };

  // Adjust scroll after loading more older messages to prevent jumping
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller && prevScrollHeightRef.current > 0) {
      const heightDifference = scroller.scrollHeight - prevScrollHeightRef.current;
      if (heightDifference > 0) {
        scroller.scrollTop += heightDifference;
        prevScrollHeightRef.current = 0;
      }
    }
  }, [messages.length]);

  // Auto-scroll to bottom on new messages if user was at bottom
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller && isAtBottomRef.current) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="messages-scroller" ref={scrollerRef} onScroll={handleScroll}>
      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <span className="spinner" style={{ width: 18, height: 18 }} />
        </div>
      )}

      {messages.length === 0 ? (
        <div
          className="full-center"
          style={{
            flex: 1,
            flexDirection: 'column',
            color: 'var(--text-muted)',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-header)' }}>
            Chào mừng bạn đến với kênh!
          </span>
          <span style={{ fontSize: 14 }}>
            Đây là điểm bắt đầu của cuộc trò chuyện. Hãy gửi lời chào đầu tiên!
          </span>
        </div>
      ) : (
        messages.map((message) => {
          // Find target message if present in currently loaded messages
          const replyTarget = message.replyToId
            ? messages.find((m) => m.id === message.replyToId)
            : null;

          return (
            <MessageItem
              key={message.id}
              message={message}
              currentUser={currentUser}
              replyTargetMessage={replyTarget}
              isHighlighted={highlightedMessageId === message.id}
              onReply={onReply}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
              onJumpToMessage={handleJumpToMessage}
            />
          );
        })
      )}
    </div>
  );
}
