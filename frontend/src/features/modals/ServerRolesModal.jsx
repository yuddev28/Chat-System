import { useState } from 'react';
import { Shield, Plus, Check } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { serverService } from '../../api';
import { PERMISSION_METADATA, SERVER_PERMISSIONS } from '../../config/permissions';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

const ROLE_COLORS = [
  '#99AAB5', // Standard Gray
  '#5865F2', // Blurple
  '#57F287', // Green
  '#FEE75C', // Yellow
  '#EB459E', // Pink
  '#ED4245', // Red
  '#F59E0B', // Amber
  '#0D9488', // Teal
];

export default function ServerRolesModal({ server, onClose, onRefreshServer }) {
  const { toast } = useFeedback();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [name, setName] = useState('');
  const [hexColor, setHexColor] = useState(ROLE_COLORS[0]);
  const [selectedPermissions, setSelectedPermissions] = useState([
    SERVER_PERMISSIONS.READ_MESSAGE,
    SERVER_PERMISSIONS.SEND_MESSAGE,
  ]);
  const [loading, setLoading] = useState(false);

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Tên vai trò không được để trống', 'error');
      return;
    }

    try {
      setLoading(true);
      await serverService.createRole(server.id, {
        name: name.trim(),
        hexColor,
        position: (server.roles?.length || 0) + 1,
        permissions: selectedPermissions,
      });

      toast(`Đã tạo vai trò "${name.trim()}" thành công!`, 'success');
      setName('');
      setActiveTab('list');
      onRefreshServer();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể tạo vai trò mới'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Cài đặt vai trò — ${server.name}`}
      maxWidth={580}
      footer={
        activeTab === 'create' ? (
          <>
            <Button variant="ghost" onClick={() => setActiveTab('list')} disabled={loading}>
              Quay lại danh sách
            </Button>
            <Button variant="primary" onClick={handleCreateRole} loading={loading}>
              Lưu vai trò
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        )
      }
    >
      <div>
        {/* Tab switch */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={`btn btn-sm ${activeTab === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('list')}
          >
            Danh sách vai trò ({server.roles?.length || 0})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'create' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('create')}
          >
            <Plus size={14} style={{ marginRight: 4 }} /> Tạo vai trò mới
          </button>
        </div>

        {activeTab === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(server.roles || []).map((role) => (
              <div
                key={role.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `4px solid ${role.hexColor || 'var(--text-subtle)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={18} color={role.hexColor || 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontWeight: 600, color: role.hexColor || 'var(--text-header)' }}>
                      {role.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                      Vị trí: {role.position} · {role.permissions?.length || 0} quyền hạn
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 220, justifyContent: 'flex-end' }}>
                  {(role.permissions || []).map((perm) => (
                    <span
                      key={perm}
                      style={{
                        fontSize: 10,
                        backgroundColor: 'var(--bg-card)',
                        padding: '2px 6px',
                        borderRadius: 3,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleCreateRole}>
            <Input
              label="TÊN VAI TRÒ"
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="vd: Moderator, VIP, Thành viên vàng..."
              required
              autoFocus
            />

            {/* Color Picker */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                MÀU SẮC HIỂN THỊ
              </label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {ROLE_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setHexColor(col)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: col,
                      border: hexColor === col ? '3px solid #ffffff' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
                  title="Chọn màu tùy biến"
                />
              </div>
            </div>

            {/* Permission Checkboxes */}
            <div>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                QUYỀN HẠN CỦA VAI TRÒ
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                {PERMISSION_METADATA.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: isChecked ? 'var(--bg-input)' : 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-header)' }}>
                          {perm.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                          {perm.description}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.key)}
                        style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
