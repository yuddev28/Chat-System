import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useSocketContext } from '../contexts/SocketContext';
import { serverService, channelService, friendService } from '../api';

export function useAuth() {
  return useAuthContext();
}

export function useStomp() {
  return useSocketContext();
}

export function useServers(authed) {
  const [servers, setServers] = useState([]);
  const [activeServerDetails, setActiveServerDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshServers = useCallback(async () => {
    if (!authed) return;
    try {
      setLoading(true);
      const list = await serverService.getMyServers();
      setServers(list);
    } catch (err) {
      console.error('Failed to load servers', err);
    } finally {
      setLoading(false);
    }
  }, [authed]);

  const fetchServerDetails = useCallback(async (serverId) => {
    if (!serverId) {
      setActiveServerDetails(null);
      return null;
    }
    try {
      const details = await serverService.getServerDetails(serverId);
      setActiveServerDetails(details);
      return details;
    } catch (err) {
      console.error('Failed to get server details', err);
      return null;
    }
  }, []);

  const addServer = (newServer) => {
    setServers((prev) => [newServer, ...prev]);
  };

  const removeServer = (serverId) => {
    setServers((prev) => prev.filter((s) => s.id !== serverId));
    setActiveServerDetails((cur) => (cur?.id === serverId ? null : cur));
  };

  useEffect(() => {
    refreshServers();
  }, [refreshServers]);

  return {
    servers,
    activeServerDetails,
    loading,
    refreshServers,
    fetchServerDetails,
    addServer,
    removeServer,
  };
}

export function useChannels(activeServerId, authed) {
  const [groups, setGroups] = useState([]);
  const [channels, setChannels] = useState([]);
  const [dmChannels, setDmChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshServerChannels = useCallback(async () => {
    if (!activeServerId || !authed) return;
    try {
      setLoading(true);
      const [grps, chns] = await Promise.all([
        channelService.getChannelGroups(activeServerId),
        channelService.getServerChannels(activeServerId),
      ]);
      setGroups(grps);
      setChannels(chns);
    } catch (err) {
      console.error('Failed to load server channels', err);
    } finally {
      setLoading(false);
    }
  }, [activeServerId, authed]);

  const refreshDMs = useCallback(async () => {
    if (!authed) return;
    try {
      const dms = await channelService.getUserDMChannels();
      setDmChannels(dms);
    } catch (err) {
      console.error('Failed to load DM channels', err);
    }
  }, [authed]);

  useEffect(() => {
    if (activeServerId) {
      refreshServerChannels();
    } else {
      setGroups([]);
      setChannels([]);
      refreshDMs();
    }
  }, [activeServerId, refreshServerChannels, refreshDMs]);

  return {
    groups,
    channels,
    dmChannels,
    loading,
    refreshServerChannels,
    refreshDMs,
  };
}

export function useFriends(authed) {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!authed) return;
    try {
      const [fList, pList] = await Promise.all([
        friendService.getFriendsList(),
        friendService.getPendingRequests(),
      ]);
      setFriends(fList);
      setPending(pList);
      setLoaded(true);
    } catch (err) {
      console.error('Failed to load friends', err);
    }
  }, [authed]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { friends, pending, loaded, refresh };
}
