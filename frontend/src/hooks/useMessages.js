import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../api';
import { playNotificationSound } from '../utils/sound';

export function useMessages({ channelId, stompClient, currentUserId, soundEnabled = true }) {
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load initial messages and pinned messages when channelId changes
  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setPinnedMessages([]);
      setStatus('idle');
      return;
    }

    let isMounted = true;
    setStatus('loading');
    setError(null);
    setPage(1);
    setHasMore(true);

    Promise.all([
      chatService.getChannelMessages(channelId, 1, 50),
      chatService.getPinnedMessages(channelId),
    ])
      .then(([pageData, pinned]) => {
        if (!isMounted) return;
        // Backend returns messages in reverse chronological order (newest first)
        // Reverse them to show in chat flow (oldest -> newest)
        const items = [...(pageData?.content || [])].reverse();
        setMessages(items);
        setPinnedMessages(pinned || []);
        setHasMore(!pageData?.last && (pageData?.totalPages || 1) > 1);
        setStatus('success');
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.response?.data?.message || 'Không thể tải tin nhắn');
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  // Load older messages (Scroll-up pagination)
  const loadOlderMessages = useCallback(async () => {
    if (!channelId || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const pageData = await chatService.getChannelMessages(channelId, nextPage, 50);

      const olderItems = [...(pageData?.content || [])].reverse();
      setMessages((prev) => [...olderItems, ...prev]);
      setPage(nextPage);
      setHasMore(!pageData?.last && (pageData?.totalPages || 1) > nextPage);
    } catch (err) {
      console.error('Failed to load older messages', err);
    } finally {
      setLoadingMore(false);
    }
  }, [channelId, loadingMore, hasMore, page]);

  // Subscribe to WebSocket STOMP topic for realtime updates
  useEffect(() => {
    if (!channelId || !stompClient?.subscribeChannel) return;

    const unsubscribe = stompClient.subscribeChannel(channelId, (incomingMsg) => {
      if (!incomingMsg || !incomingMsg.id) return;

      setMessages((prev) => {
        const index = prev.findIndex((m) => m.id === incomingMsg.id);
        if (index >= 0) {
          // Update existing message (e.g. pinned, reaction, soft delete)
          const updated = [...prev];
          updated[index] = incomingMsg;
          return updated;
        } else {
          // New message received
          if (soundEnabled && incomingMsg.sender?.id !== currentUserId) {
            playNotificationSound();
          }
          return [...prev, incomingMsg];
        }
      });

      // Update pinned messages if pin status changed
      if (incomingMsg.isPinned) {
        setPinnedMessages((prev) => {
          if (!prev.some((p) => p.id === incomingMsg.id)) {
            return [incomingMsg, ...prev];
          }
          return prev;
        });
      } else {
        setPinnedMessages((prev) => prev.filter((p) => p.id !== incomingMsg.id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [channelId, stompClient, currentUserId, soundEnabled]);

  // Actions
  const send = async (payload) => {
    if (!channelId) return;
    return await chatService.sendMessage(channelId, payload);
  };

  const togglePin = async (messageId) => {
    const updated = await chatService.togglePin(messageId);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
    if (updated.isPinned) {
      setPinnedMessages((prev) => [updated, ...prev.filter((p) => p.id !== messageId)]);
    } else {
      setPinnedMessages((prev) => prev.filter((p) => p.id !== messageId));
    }
    return updated;
  };

  const deleteMsg = async (messageId) => {
    await chatService.deleteMessage(messageId);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, deletedAt: new Date().toISOString() } : m))
    );
    setPinnedMessages((prev) => prev.filter((p) => p.id !== messageId));
  };

  const addReaction = async (messageId, emoji) => {
    const updated = await chatService.addReaction(messageId, emoji);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
    return updated;
  };

  const removeReaction = async (messageId, emoji) => {
    const updated = await chatService.removeReaction(messageId, emoji);
    setMessages((prev) => prev.map((m) => (m.id === messageId ? updated : m)));
    return updated;
  };

  return {
    messages,
    pinnedMessages,
    status,
    error,
    hasMore,
    loadingMore,
    loadOlderMessages,
    send,
    togglePin,
    deleteMsg,
    addReaction,
    removeReaction,
  };
}
