import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { channelService } from '../../api';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

export default function CreateDMModal({ friends = [], onClose, onSuccess }) {
  const { toast } = useFeedback();
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSelect = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast('Vui lòng chọn ít nhất 1 người bạn', 'error');
      return;
    }

    try {
      setLoading(true);
      const dm = await channelService.getOrCreateDMChannel(
        selectedUserIds,
        selectedUserIds.length > 1 ? groupName.trim() || null : null
      );
      onSuccess(dm);
      onClose();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không tạo được cuộc trò chuyện DM'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Tạo cuộc trò chuyện riêng"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Tạo trò chuyện ({selectedUserIds.length})
          </Button>
        </>
      }
    >
      <div>
        {selectedUserIds.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
              TÊN NHÓM CHAT (TÙY CHỌN)
            </label>
            <input
              type="text"
              className="form-input"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="vd: Nhóm Dự án Web"
            />
          </div>
        )}

        <div className="form-label" style={{ marginBottom: 8 }}>
          CHỌN BẠN BÈ ({selectedUserIds.length} đã chọn)
        </div>

        {friends.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-subtle)' }}>
            Bạn chưa có bạn bè nào để tạo trò chuyện. Hãy kết bạn trước!
          </div>
        ) : (
          <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {friends.map((friend) => {
              const isSelected = selectedUserIds.includes(friend.id);

              return (
                <div
                  key={friend.id}
                  onClick={() => toggleSelect(friend.id)}
                  className={`channel-item ${isSelected ? 'active' : ''}`}
                  style={{
                    padding: '8px 12px',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar
                      src={friend.avatarUrl}
                      name={friend.username}
                      size={32}
                      status={friend.status || 'OFFLINE'}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-header)' }}>
                      {friend.username}
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    style={{ accentColor: 'var(--accent)', pointerEvents: 'none' }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
