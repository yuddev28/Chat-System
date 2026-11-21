import { useState } from 'react';
import { Hash, Volume2, Lock } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { channelService } from '../../api';
import { CHANNEL_TYPE } from '../../config/constants';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

export default function CreateChannelModal({
  serverId,
  defaultGroupId = null,
  groups = [],
  serverRoles = [],
  onClose,
  onSuccess,
}) {
  const { toast } = useFeedback();
  const [name, setName] = useState('');
  const [type, setType] = useState(CHANNEL_TYPE.GUILD_TEXT);
  const [groupId, setGroupId] = useState(defaultGroupId || (groups[0]?.id ?? ''));
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter out default base role
  const nonDefaultRoles = serverRoles.filter(
    (r) => r.position !== 0 && r.name !== 'Member' && r.name !== '@everyone'
  );

  const toggleRoleSelection = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Tên kênh không được để trống', 'error');
      return;
    }

    try {
      setLoading(true);
      const newChannel = await channelService.createGuildChannel({
        name: name.trim(),
        serverId,
        groupId: groupId ? Number(groupId) : null,
        type,
        isPrivate,
        allowedRoleIds: isPrivate ? selectedRoleIds : [],
      });
      onSuccess(newChannel);
      onClose();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể tạo kênh'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Tạo kênh mới"
      maxWidth={480}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Tạo kênh
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Channel Type Selector */}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
            LOẠI KÊNH
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: type === CHANNEL_TYPE.GUILD_TEXT ? 'var(--bg-input)' : 'transparent',
                border: `1px solid ${type === CHANNEL_TYPE.GUILD_TEXT ? 'var(--accent)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="channelType"
                checked={type === CHANNEL_TYPE.GUILD_TEXT}
                onChange={() => setType(CHANNEL_TYPE.GUILD_TEXT)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <Hash size={20} color="var(--text-muted)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-header)' }}>Văn bản (Text)</div>
                <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                  Đăng tin nhắn, hình ảnh, tài liệu và biểu cảm emoji
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: type === CHANNEL_TYPE.GUILD_ANNOUNCEMENT ? 'var(--bg-input)' : 'transparent',
                border: `1px solid ${type === CHANNEL_TYPE.GUILD_ANNOUNCEMENT ? 'var(--accent)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="channelType"
                checked={type === CHANNEL_TYPE.GUILD_ANNOUNCEMENT}
                onChange={() => setType(CHANNEL_TYPE.GUILD_ANNOUNCEMENT)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <Volume2 size={20} color="var(--text-muted)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-header)' }}>Thông báo (Announcement)</div>
                <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                  Kênh dành riêng cho các thông báo quan trọng của máy chủ
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Channel Name */}
        <Input
          label="TÊN KÊNH"
          id="channel-name"
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          placeholder="vd: hoi-dap-lap-trinh"
          required
          autoFocus
        />

        {/* Group Selector */}
        {groups.length > 0 && (
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="group-select">
              DANH MỤC KÊNH
            </label>
            <select
              id="group-select"
              className="form-input"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">(Không thuộc danh mục nào)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Private Channel Toggle (Discord-style) */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Lock size={18} color={isPrivate ? 'var(--status-online)' : 'var(--text-muted)'} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-header)' }}>
                  Kênh riêng tư (Private Channel)
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                  Chỉ các vai trò được chọn mới có thể xem kênh này.
                </div>
              </div>
            </div>

            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: 40,
                height: 22,
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isPrivate ? 'var(--status-online)' : 'var(--bg-input-hover)',
                  borderRadius: 22,
                  transition: 'var(--transition-fast)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: "''",
                    height: 16,
                    width: 16,
                    left: isPrivate ? 21 : 3,
                    bottom: 3,
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    transition: 'var(--transition-fast)',
                  }}
                />
              </span>
            </label>
          </div>

          {/* Role Checkboxes when isPrivate is true */}
          {isPrivate && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                }}
              >
                VAI TRÒ ĐƯỢC PHÉP TRUY CẬP
              </div>

              {nonDefaultRoles.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                  Chưa có vai trò tùy chỉnh nào (chỉ bạn và chủ server có thể xem).
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                  {nonDefaultRoles.map((role) => {
                    const isChecked = selectedRoleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isChecked ? 'var(--bg-item-hover)' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRoleSelection(role.id)}
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: role.hexColor || 'var(--accent)',
                          }}
                        />
                        <span style={{ fontSize: 13, color: 'var(--text-header)' }}>{role.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
