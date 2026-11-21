import { useEffect, useMemo, useState } from 'react';
import { useAuth, useChannels, useFriends, useServers, useStomp } from './hooks/useAppData';
import { useMessages } from './hooks/useMessages';
import { useSettings } from './hooks/useSettings';
import { useFeedback } from './components/ui/Feedback';
import { channelService, serverService } from './api';
import { extractErrorMessage } from './utils/helpers';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { SettingsProvider } from './contexts/SettingsContext';

import AuthPage from './features/auth/AuthPage';
import ServerRail from './layout/ServerRail';
import ChannelSidebar from './layout/ChannelSidebar';
import ChatView from './features/chat/ChatView';
import FriendsPage from './features/friends/FriendsPage';
import MemberPanel from './features/rooms/MemberPanel';
import SettingsModal from './features/chat/SettingsModal';
import {
  CreateChannelModal,
  CreateDMModal,
  CreateGroupModal,
  CreateServerModal,
  JoinServerModal,
  ServerRolesModal,
  ChannelPermissionsModal,
  NicknameModal,
} from './features/modals';

const FRIENDS_VIEW = { type: 'friends' };

function ChatApp() {
  const { user, setUser, loading: authLoading, logout } = useAuth();
  const { settings, updateSetting } = useSettings();
  const { toast } = useFeedback();

  const authed = !!user;
  const {
    servers,
    activeServerDetails,
    refreshServers,
    fetchServerDetails,
    addServer,
    removeServer,
  } = useServers(authed);

  // Active Server (null = Home / Direct Messages view)
  const [activeServerId, setActiveServerId] = useState(null);

  // Active View: { type: 'friends' } | { type: 'channel', channelId, name, type, isDM }
  const [view, setView] = useState(FRIENDS_VIEW);

  const {
    groups,
    channels,
    dmChannels,
    refreshServerChannels,
    refreshDMs,
  } = useChannels(activeServerId, authed);

  const { friends, pending, loaded: friendsLoaded, refresh: refreshFriends } = useFriends(authed);
  const stompClient = useStomp();

  // Layout UI states
  const [membersOpen, setMembersOpen] = useState(() => window.innerWidth > 1000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'createServer' | 'joinServer' | 'createChannel' | 'createGroup' | 'createDM' | 'serverRoles' | 'channelPermissions' | 'nickname'
  const [createChannelGroupId, setCreateChannelGroupId] = useState(null);
  const [selectedChannelForPerm, setSelectedChannelForPerm] = useState(null);

  // Realtime Messages hook for active channel
  const activeChannelId = view.type === 'channel' ? view.channelId : null;
  const {
    messages,
    pinnedMessages,
    status: msgStatus,
    error: msgError,
    hasMore,
    loadingMore,
    loadOlderMessages,
    send: sendMessage,
    togglePin,
    deleteMsg,
    addReaction,
    removeReaction,
  } = useMessages({
    channelId: activeChannelId,
    stompClient,
    currentUserId: user?.id,
    soundEnabled: settings.soundEnabled,
  });

  // Fetch full server details (members, roles, inviteCode) when activeServerId changes
  useEffect(() => {
    if (activeServerId) {
      fetchServerDetails(activeServerId);
    }
  }, [activeServerId, fetchServerDetails]);

  // Active server object
  const activeServer = useMemo(() => {
    if (!activeServerId) return null;
    return activeServerDetails || servers.find((s) => s.id === activeServerId) || null;
  }, [activeServerId, activeServerDetails, servers]);

  // Navigation Handlers
  const handleOpenHome = () => {
    setActiveServerId(null);
    setView(FRIENDS_VIEW);
    refreshDMs();
    refreshFriends().catch(() => {});
  };

  const handleSelectServer = (serverId) => {
    setActiveServerId(serverId);
    channelService.getServerChannels(serverId).then((chns) => {
      if (chns && chns.length > 0) {
        setView({
          type: 'channel',
          channelId: chns[0].id,
          name: chns[0].name,
          channelType: chns[0].type,
          isDM: false,
          myPermissions: chns[0].myPermissions || [],
          isPrivate: chns[0].isPrivate || false,
        });
      } else {
        setView({ type: 'empty-server' });
      }
    });
  };

  const handleSelectChannel = (channel) => {
    const isDM = !channel.serverId && !activeServerId;
    const otherMembers = (channel.recipients || []).filter((r) => r.id !== user?.id);
    const displayName =
      channel.name ||
      otherMembers.map((m) => m.displayName || m.username).join(', ') ||
      'Trò chuyện';

    setView({
      type: 'channel',
      channelId: channel.id,
      name: isDM ? displayName : channel.name,
      channelType: channel.type,
      isDM,
      myPermissions: channel.myPermissions || [],
      isPrivate: channel.isPrivate || false,
    });
  };

  const handleStartDMWithUser = async (targetUser) => {
    try {
      const dm = await channelService.getOrCreateDMChannel([targetUser.id]);
      await refreshDMs();
      setActiveServerId(null);
      handleSelectChannel(dm);
    } catch (err) {
      toast(extractErrorMessage(err, 'Không tạo được cuộc trò chuyện DM'), 'error');
    }
  };

  // Kick member handler
  const handleKickMember = async (targetUserId) => {
    if (!activeServerId) return;
    try {
      await serverService.kickMember(activeServerId, targetUserId);
      await fetchServerDetails(activeServerId);
      toast('Đã đuổi thành viên khỏi máy chủ', 'success');
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể đuổi thành viên'), 'error');
    }
  };

  // Ban member handler
  const handleBanMember = async (targetUserId) => {
    if (!activeServerId) return;
    try {
      await serverService.banMember(activeServerId, targetUserId);
      await fetchServerDetails(activeServerId);
      toast('Đã cấm thành viên khỏi máy chủ', 'success');
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể cấm thành viên'), 'error');
    }
  };

  // Delete server handler
  const handleDeleteServer = async (serverId) => {
    try {
      await serverService.deleteServer(serverId);
      removeServer(serverId);
      handleOpenHome();
      toast('Đã giải tán máy chủ', 'success');
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể xóa máy chủ'), 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="full-center" style={{ height: '100vh', background: 'var(--bg-app)', gap: 10, color: 'var(--text-muted)' }}>
        <div className="spinner" /> Đang tải dữ liệu...
      </div>
    );
  }

  if (!authed) return <AuthPage onAuthSuccess={setUser} />;

  const isChannelView = view.type === 'channel';
  const showMemberPanel = isChannelView && !view.isDM && activeServer && membersOpen;

  return (
    <div className="shell">
      {/* 1. SERVER RAIL (Column 1 - 72px) */}
      <ServerRail
        servers={servers}
        activeServerId={activeServerId}
        onSelectServer={handleSelectServer}
        onOpenHome={handleOpenHome}
        onCreateServer={() => setModal('createServer')}
        onJoinServer={() => setModal('joinServer')}
      />

      {/* 2. CHANNEL SIDEBAR (Column 2 - 240px) */}
      <ChannelSidebar
        currentUser={user}
        activeServer={activeServer}
        groups={groups}
        channels={channels}
        dmChannels={dmChannels}
        view={view}
        friends={friends}
        pendingCount={pending.length}
        onOpenFriends={() => setView(FRIENDS_VIEW)}
        onSelectChannel={handleSelectChannel}
        onSelectDM={handleSelectChannel}
        onCreateChannel={(grpId = null) => {
          setCreateChannelGroupId(grpId);
          setModal('createChannel');
        }}
        onCreateGroup={() => setModal('createGroup')}
        onCreateDM={() => setModal('createDM')}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenServerRoles={() => setModal('serverRoles')}
        onOpenChannelPermissions={(channel) => {
          setSelectedChannelForPerm(channel);
          setModal('channelPermissions');
        }}
        onOpenNickname={() => setModal('nickname')}
        onDeleteServer={handleDeleteServer}
      />

      {/* 3. MAIN CONTENT (Column 3) */}
      {view.type === 'friends' && (
        <FriendsPage
          friends={friends}
          pending={pending}
          loaded={friendsLoaded}
          onRefresh={refreshFriends}
          onStartDM={handleStartDMWithUser}
        />
      )}

      {isChannelView && (
        <ChatView
          kind={view.isDM ? 'dm' : 'channel'}
          title={view.name}
          subtitle={
            !view.isDM && activeServer
              ? `${activeServer.name} · ${activeServer.members?.length || 0} thành viên`
              : ''
          }
          messages={messages}
          pinnedMessages={pinnedMessages}
          status={msgStatus}
          error={msgError}
          currentUser={user}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadOlderMessages}
          onSend={sendMessage}
          onTogglePin={togglePin}
          onDeleteMessage={deleteMsg}
          onAddReaction={addReaction}
          onRemoveReaction={removeReaction}
          showMembersToggle={!view.isDM}
          membersOpen={membersOpen}
          onToggleMembers={() => setMembersOpen((o) => !o)}
          canSend={
            view.isDM ||
            activeServer?.owner?.id === user?.id ||
            !view.myPermissions ||
            view.myPermissions.length === 0 ||
            view.myPermissions.includes('SEND_MESSAGE')
          }
        />
      )}

      {view.type === 'empty-server' && (
        <main className="main-view full-center">
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3 style={{ fontSize: 18, color: 'var(--text-header)', marginBottom: 8 }}>
              Chưa có kênh nào trong máy chủ
            </h3>
            <p style={{ fontSize: 14 }}>
              Hãy bấm nút (+) tại thanh bên để tạo kênh văn bản đầu tiên.
            </p>
          </div>
        </main>
      )}

      {/* 4. SERVER MEMBERS PANEL (Right Column - 240px) */}
      {showMemberPanel && (
        <MemberPanel
          members={activeServer.members || []}
          roles={activeServer.roles || []}
          currentUser={user}
          activeServer={activeServer}
          onKickMember={handleKickMember}
          onBanMember={handleBanMember}
          onStartDM={handleStartDMWithUser}
          onClose={() => setMembersOpen(false)}
        />
      )}

      {/* MODALS */}
      {modal === 'createServer' && (
        <CreateServerModal
          onClose={() => setModal(null)}
          onSuccess={(srv) => {
            addServer(srv);
            handleSelectServer(srv.id);
            toast(`Đã tạo máy chủ "${srv.name}"`, 'success');
          }}
        />
      )}

      {modal === 'joinServer' && (
        <JoinServerModal
          onClose={() => setModal(null)}
          onSuccess={async (srv) => {
            await refreshServers();
            handleSelectServer(srv.id);
            toast(`Đã tham gia máy chủ "${srv.name}"`, 'success');
          }}
        />
      )}

      {modal === 'createChannel' && activeServerId && (
        <CreateChannelModal
          serverId={activeServerId}
          defaultGroupId={createChannelGroupId}
          groups={groups}
          serverRoles={activeServer?.roles || []}
          onClose={() => setModal(null)}
          onSuccess={async (channel) => {
            await refreshServerChannels();
            handleSelectChannel(channel);
            toast(`Đã tạo kênh #${channel.name}`, 'success');
          }}
        />
      )}

      {modal === 'createGroup' && activeServerId && (
        <CreateGroupModal
          serverId={activeServerId}
          onClose={() => setModal(null)}
          onSuccess={async (group) => {
            await refreshServerChannels();
            toast(`Đã tạo danh mục "${group.name}"`, 'success');
          }}
        />
      )}

      {modal === 'createDM' && (
        <CreateDMModal
          friends={friends}
          onClose={() => setModal(null)}
          onSuccess={(dm) => {
            refreshDMs();
            handleSelectChannel(dm);
          }}
        />
      )}

      {modal === 'serverRoles' && activeServer && (
        <ServerRolesModal
          server={activeServer}
          onClose={() => setModal(null)}
          onRefreshServer={() => fetchServerDetails(activeServer.id)}
        />
      )}

      {modal === 'channelPermissions' && selectedChannelForPerm && activeServer && (
        <ChannelPermissionsModal
          channel={selectedChannelForPerm}
          serverRoles={activeServer.roles || []}
          onClose={() => {
            setSelectedChannelForPerm(null);
            setModal(null);
          }}
          onRefreshChannels={() => refreshServerChannels()}
        />
      )}

      {modal === 'nickname' && activeServer && (
        <NicknameModal
          serverId={activeServer.id}
          currentNickname={
            activeServer.members?.find((m) => m.user?.id === user?.id)?.displayName || ''
          }
          onClose={() => setModal(null)}
          onSuccess={async () => {
            await fetchServerDetails(activeServer.id);
          }}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          updateSetting={updateSetting}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <SocketProvider>
          <ChatApp />
        </SocketProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
