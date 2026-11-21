import { useState } from 'react';
import { Users, UserPlus, MessageSquare, Check, X, UserMinus, Search } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { friendService } from '../../api';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

export default function FriendsPage({
  friends = [],
  pending = [],
  loaded = true,
  onRefresh,
  onStartDM,
}) {
  const { toast } = useFeedback();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'add'
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Send friend request
  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!tagInput.trim()) {
      toast('Vui lòng nhập Username hoặc UserTag', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await friendService.sendFriendRequest({ userTag: tagInput.trim() });
      toast('Đã gửi lời mời kết bạn thành công!', 'success');
      setTagInput('');
      onRefresh();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không gửi được lời mời kết bạn'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Respond friend request (Accept or Reject)
  const handleRespond = async (requestId, accept) => {
    try {
      await friendService.respondFriendRequest(requestId, accept);
      toast(accept ? 'Đã chấp nhận kết bạn!' : 'Đã từ chối lời mời kết bạn', 'success');
      onRefresh();
    } catch (err) {
      toast(extractErrorMessage(err, 'Thao tác không thành công'), 'error');
    }
  };

  // Unfriend
  const handleUnfriend = async (targetUserId, friendName) => {
    if (!window.confirm(`Bạn có chắc muốn hủy kết bạn với ${friendName}?`)) return;
    try {
      await friendService.unfriend(targetUserId);
      toast(`Đã hủy kết bạn với ${friendName}`, 'success');
      onRefresh();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể hủy kết bạn'), 'error');
    }
  };

  // Filtered friends
  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="main-view" aria-label="Trang quản lý bạn bè">
      {/* 1. FRIENDS HEADER TAB BAR */}
      <header className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <Users size={22} color="var(--text-muted)" />
            <span>Bạn bè</span>
          </div>

          <div style={{ height: 20, width: 1, backgroundColor: 'var(--divider)' }} />

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`btn btn-sm ${activeTab === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('all')}
            >
              Tất cả ({friends.length})
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'pending' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('pending')}
              style={{ position: 'relative' }}
            >
              Chờ xử lý
              {pending.length > 0 && <span className="badge-unread ml-auto">{pending.length}</span>}
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'add' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('add')}
              style={activeTab !== 'add' ? { color: 'var(--text-positive)' } : undefined}
            >
              <UserPlus size={14} style={{ marginRight: 4 }} />
              Thêm bạn
            </button>
          </div>
        </div>
      </header>

      {/* 2. TAB BODY */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* TAB 1: ALL FRIENDS */}
        {activeTab === 'all' && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px',
                }}
              >
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bạn bè..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-normal)',
                    width: '100%',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>
              TẤT CẢ BẠN BÈ — {filteredFriends.length}
            </div>

            {filteredFriends.length === 0 ? (
              <div style={{ color: 'var(--text-subtle)', padding: '24px 0', textAlign: 'center' }}>
                {searchQuery ? 'Không tìm thấy bạn bè nào phù hợp.' : 'Chưa có bạn bè nào. Hãy bấm "Thêm bạn"!'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="channel-item"
                    style={{
                      padding: '10px 12px',
                      justifyContent: 'space-between',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar
                        src={friend.avatarUrl}
                        name={friend.username}
                        size={36}
                        status={friend.status || 'OFFLINE'}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-header)' }}>
                          {friend.username}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                          {friend.status === 'ONLINE' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-icon"
                        onClick={() => onStartDM(friend)}
                        title="Gửi tin nhắn riêng"
                        style={{ backgroundColor: 'var(--bg-card)' }}
                      >
                        <MessageSquare size={18} />
                      </button>

                      <button
                        className="btn-icon"
                        onClick={() => handleUnfriend(friend.id, friend.username)}
                        title="Hủy kết bạn"
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-danger)' }}
                      >
                        <UserMinus size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PENDING REQUESTS */}
        {activeTab === 'pending' && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>
              LỜI MỜI ĐANG CHỜ — {pending.length}
            </div>

            {pending.length === 0 ? (
              <div style={{ color: 'var(--text-subtle)', padding: '24px 0', textAlign: 'center' }}>
                Không có lời mời kết bạn nào đang chờ.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="channel-item"
                    style={{
                      padding: '10px 14px',
                      justifyContent: 'space-between',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar
                        src={req.sender?.avatarUrl}
                        name={req.sender?.username}
                        size={36}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-header)' }}>
                          {req.sender?.username}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                          Lời mời kết bạn gửi đến bạn
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-icon"
                        style={{ backgroundColor: 'var(--status-online)', color: '#fff' }}
                        onClick={() => handleRespond(req.id, true)}
                        title="Chấp nhận kết bạn"
                      >
                        <Check size={18} />
                      </button>

                      <button
                        className="btn-icon"
                        style={{ backgroundColor: 'var(--text-danger)', color: '#fff' }}
                        onClick={() => handleRespond(req.id, false)}
                        title="Từ chối lời mời"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD FRIEND */}
        {activeTab === 'add' && (
          <div style={{ maxWidth: 540 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-header)', marginBottom: 6 }}>
              THÊM BẠN BÈ
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Bạn có thể thêm bạn bè bằng Tên người dùng hoặc UserTag của họ (ví dụ: `hoangduy` hoặc `duy#1234`).
            </p>

            <form onSubmit={handleSendRequest}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px 6px 4px 14px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <input
                  type="text"
                  placeholder="Nhập tên người dùng hoặc UserTag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-normal)',
                    fontSize: 14,
                  }}
                  autoFocus
                />
                <Button type="submit" variant="primary" loading={submitting}>
                  Gửi lời mời
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
