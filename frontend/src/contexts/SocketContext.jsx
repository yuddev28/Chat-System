import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL } from '../config/constants';
import { useAuthContext } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuthContext();
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [user]);

  /**
   * Subscribes to a channel topic: /topic/channel/{channelId}
   * Returns an unsubscribe function.
   */
  const subscribeChannel = useCallback((channelId, callback) => {
    if (!clientRef.current || !clientRef.current.connected) {
      // If client not connected yet, queue or wait
      let sub = null;
      const checkInterval = setInterval(() => {
        if (clientRef.current && clientRef.current.connected) {
          clearInterval(checkInterval);
          sub = clientRef.current.subscribe(`/topic/channel/${channelId}`, (message) => {
            try {
              const body = JSON.parse(message.body);
              callback(body);
            } catch (err) {
              console.error('Failed to parse STOMP message', err);
            }
          });
        }
      }, 300);

      return () => {
        clearInterval(checkInterval);
        if (sub) sub.unsubscribe();
      };
    }

    const subscription = clientRef.current.subscribe(`/topic/channel/${channelId}`, (message) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch (err) {
        console.error('Failed to parse STOMP message', err);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Optional helper to publish message over WebSocket STOMP
   */
  const sendStompMessage = useCallback((channelId, payload) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/chat.sendMessage/${channelId}`,
        body: JSON.stringify(payload),
      });
      return true;
    }
    return false;
  }, []);

  return (
    <SocketContext.Provider value={{ connected, subscribeChannel, sendStompMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within a SocketProvider');
  return ctx;
}
