import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Check,
  X,
  Slash,
  Trash2,
  Lock,
  Plus,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { channelService } from '../../api';
import { PERMISSION_METADATA } from '../../config/permissions';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

export default function ChannelPermissionsModal({
  channel,
  serverRoles = [],
  onClose,
  onRefreshChannels,
}) {
  const { toast } = useFeedback();

  // Find base @everyone or Member role
  const defaultRole = useMemo(() => {
    return (
      serverRoles.find(
        (r) => r.position === 0 || r.name === 'Member' || r.name === '@everyone'
      ) || serverRoles[0]
    );
  }, [serverRoles]);

  const [selectedRoleId, setSelectedRoleId] = useState(defaultRole?.id || null);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddRoleMenu, setShowAddRoleMenu] = useState(false);

  // States per permission for the selected role: 'allow' | 'inherit' | 'deny'
  const [permStates, setPermStates] = useState({});
  const [originalStates, setOriginalStates] = useState({});

  // Fetch overrides on mount or channel change
  const loadPermissions = async () => {
    if (!channel?.id) return;
    try {
      setLoading(true);
      const data = await channelService.getChannelPermissions(channel.id);
      setOverrides(data || []);
    } catch (err) {
      console.error('Failed to load channel permissions', err);
      toast(extractErrorMessage(err, 'Không thể tải phân quyền kênh'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [channel?.id]);

  // Selected role object
  const selectedRole = useMemo(() => {
    return serverRoles.find((r) => r.id === selectedRoleId) || defaultRole;
  }, [serverRoles, selectedRoleId, defaultRole]);

  // Check if channel is currently private
  const defaultOverride = useMemo(() => {
    if (!defaultRole) return null;
    return overrides.find((o) => o.roleId === defaultRole.id);
  }, [overrides, defaultRole]);

  const isPrivate = Boolean(defaultOverride?.denyPermissions?.includes('READ_MESSAGE'));

  // Sync state when selectedRoleId or overrides change
  useEffect(() => {
    if (!selectedRoleId) return;
    const currentOverride = overrides.find((o) => o.roleId === selectedRoleId);

    const initial = {};
    PERMISSION_METADATA.forEach((perm) => {
      if (currentOverride?.allowPermissions?.includes(perm.key)) {
        initial[perm.key] = 'allow';
      } else if (currentOverride?.denyPermissions?.includes(perm.key)) {
        initial[perm.key] = 'deny';
      } else {
        initial[perm.key] = 'inherit';
      }
    });

    setPermStates(initial);
    setOriginalStates(initial);
  }, [selectedRoleId, overrides]);

  // Detect unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(permStates).some((key) => permStates[key] !== originalStates[key]);
  }, [permStates, originalStates]);

  const handleSetState = (permKey, state) => {
    setPermStates((prev) => ({ ...prev, [permKey]: state }));
  };

  const handleResetChanges = () => {
    setPermStates({ ...originalStates });
  };

  const handleSaveOverride = async () => {
    if (!selectedRoleId || !channel?.id) return;

    const allows = [];
    const denies = [];
    Object.entries(permStates).forEach(([key, state]) => {
      if (state === 'allow') allows.push(key);
      if (state === 'deny') denies.push(key);
    });

    try {
      setSaving(true);
      await channelService.setChannelPermissionOverride(channel.id, {
        roleId: selectedRoleId,
        allowPermissions: allows,
        denyPermissions: denies,
      });

      toast(`Đã lưu quyền cho vai trò "${selectedRole?.name}"!`, 'success');
      await loadPermissions();
      if (onRefreshChannels) onRefreshChannels();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể cập nhật quyền kênh'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOverride = async (roleIdToDelete) => {
    if (!roleIdToDelete || !channel?.id) return;
    try {
      setSaving(true);
      await channelService.deleteChannelPermissionOverride(channel.id, roleIdToDelete);
      toast('Đã xóa quyền ghi đè, vai trò trở về quyền mặc định', 'success');
      await loadPermissions();
      if (selectedRoleId === roleIdToDelete && defaultRole) {
        setSelectedRoleId(defaultRole.id);
      }
      if (onRefreshChannels) onRefreshChannels();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể xóa quyền ghi đè'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePrivacy = async () => {
    if (!channel?.id) return;
    try {
      setSaving(true);
      await channelService.toggleChannelPrivacy(channel.id, !isPrivate);
      toast(
        !isPrivate
          ? 'Đã chuyển kênh sang chế độ Riêng tư 🔒'
          : 'Đã chuyển kênh sang chế độ Công khai',
        'success'
      );
      await loadPermissions();
      if (onRefreshChannels) onRefreshChannels();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể đổi trạng thái riêng tư'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa kênh #${channel?.name}? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      setSaving(true);
      await channelService.deleteChannel(channel.id);
      toast(`Đã xóa kênh #${channel?.name}`, 'success');
      if (onRefreshChannels) onRefreshChannels();
      onClose();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể xóa kênh'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Roles available to add override for
  const rolesWithOverrides = useMemo(() => {
    const ids = new Set(overrides.map((o) => o.roleId));
    return serverRoles.filter((r) => ids.has(r.id) && r.id !== defaultRole?.id);
  }, [overrides, serverRoles, defaultRole]);

  const availableRolesToAdd = useMemo(() => {
    const existingIds = new Set([
      defaultRole?.id,
      ...overrides.map((o) => o.roleId),
    ]);
    return serverRoles.filter((r) => !existingIds.has(r.id));
  }, [overrides, serverRoles, defaultRole]);

  // Group permissions into categories
  const generalPerms = PERMISSION_METADATA.filter(
    (p) => p.category === 'general' || ['READ_MESSAGE', 'MANAGE_CHANNEL', 'INVITE'].includes(p.key)
  );
  const textPerms = PERMISSION_METADATA.filter(
    (p) => p.category === 'text' || ['SEND_MESSAGE', 'MANAGE_MESSAGES'].includes(p.key)
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Cài đặt quyền — #${channel?.name}`}
      maxWidth={820}
    >
      <div style={{ display: 'flex', minHeight: 460, position: 'relative' }}>
        {/* ================= LEFT SIDEBAR (ROLES LIST) ================= */}
        <aside
          style={{
            width: 220,
            backgroundColor: 'var(--bg-sidebar)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>VAI TRÒ / THÀNH VIÊN</span>
              {availableRolesToAdd.length > 0 && (
                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: 20, height: 20 }}
                  title="Thêm vai trò ghi đè quyền"
                  onClick={() => setShowAddRoleMenu((o) => !o)}
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {/* Dropdown to add new role */}
            {showAddRoleMenu && availableRolesToAdd.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-modal)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 4,
                  boxShadow: 'var(--shadow-medium)',
                  marginBottom: 6,
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-subtle)', padding: '2px 6px' }}>
                  Chọn vai trò để thêm:
                </div>
                {availableRolesToAdd.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className="channel-item"
                    style={{ width: '100%', fontSize: 12, padding: '6px 8px' }}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setShowAddRoleMenu(false);
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: role.hexColor || 'var(--text-muted)',
                        marginRight: 6,
                      }}
                    />
                    <span className="ellipsis">{role.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Base @everyone / Member Role */}
            {defaultRole && (
              <div
                className={`channel-item ${selectedRoleId === defaultRole.id ? 'active' : ''}`}
                style={{ cursor: 'pointer', padding: '8px 10px' }}
                onClick={() => setSelectedRoleId(defaultRole.id)}
              >
                <Shield size={16} color="var(--text-muted)" />
                <span className="ellipsis" style={{ fontWeight: 600 }}>
                  @{defaultRole.name}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)', marginLeft: 'auto' }}>
                  (Mặc định)
                </span>
              </div>
            )}

            {/* Specific Roles with Overrides */}
            {rolesWithOverrides.map((role) => {
              const isSelected = selectedRoleId === role.id;
              return (
                <div
                  key={role.id}
                  className={`channel-item ${isSelected ? 'active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: role.hexColor || 'var(--accent)',
                        flexShrink: 0,
                      }}
                    />
                    <span className="ellipsis">{role.name}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-icon"
                    style={{ width: 20, height: 20, opacity: isSelected ? 1 : 0.6 }}
                    title="Xóa quyền ghi đè này"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOverride(role.id);
                    }}
                  >
                    <Trash2 size={12} color="var(--text-danger)" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Delete Channel Button */}
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--divider)' }}>
            <button
              type="button"
              className="channel-item"
              style={{
                width: '100%',
                color: 'var(--text-danger)',
                fontWeight: 600,
                fontSize: 12,
              }}
              onClick={handleDeleteChannel}
            >
              <Trash2 size={14} />
              <span>Xóa kênh này</span>
            </button>
          </div>
        </aside>

        {/* ================= RIGHT PANEL (PERMISSION DETAILS) ================= */}
        <section
          style={{
            flex: 1,
            paddingLeft: 20,
            overflowY: 'auto',
            maxHeight: 520,
            paddingBottom: hasUnsavedChanges ? 72 : 16,
          }}
        >
          {/* Header of selected role */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: selectedRole?.hexColor || 'var(--text-muted)',
                  }}
                />
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-header)' }}>
                  Phân quyền cho {selectedRole?.name}
                </h3>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: '4px 0 0 0' }}>
                {selectedRoleId === defaultRole?.id
                  ? 'Áp dụng cho tất cả thành viên trong máy chủ trừ khi có vai trò cụ thể ghi đè.'
                  : 'Ghi đè quyền riêng biệt cho vai trò này trên kênh.'}
              </p>
            </div>
          </div>

          {/* QUICK TOGGLE: PRIVATE CHANNEL (only when editing default role) */}
          {selectedRoleId === defaultRole?.id && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Lock size={20} color={isPrivate ? 'var(--status-online)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-header)' }}>
                    Kênh riêng tư (Private Channel)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    Chỉ các vai trò và thành viên được cấp quyền riêng mới có thể nhìn thấy kênh này.
                  </div>
                </div>
              </div>

              <label
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: 44,
                  height: 24,
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={handleTogglePrivacy}
                  disabled={saving}
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
                    borderRadius: 24,
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: "''",
                      height: 18,
                      width: 18,
                      left: isPrivate ? 22 : 3,
                      bottom: 3,
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transition: 'var(--transition-fast)',
                    }}
                  />
                </span>
              </label>
            </div>
          )}

          {/* PERMISSION CATEGORIES */}
          {loading ? (
            <div className="full-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
              <span className="spinner" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Category 1: General Channel Permissions */}
              <div>
                <h4
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                    marginBottom: 10,
                  }}
                >
                  Quyền kênh chung
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {generalPerms.map((perm) => (
                    <PermissionRow
                      key={perm.key}
                      perm={perm}
                      state={permStates[perm.key] || 'inherit'}
                      onSetState={(state) => handleSetState(perm.key, state)}
                    />
                  ))}
                </div>
              </div>

              {/* Category 2: Text Channel Permissions */}
              <div>
                <h4
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                    marginBottom: 10,
                  }}
                >
                  Quyền tin nhắn văn bản
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {textPerms.map((perm) => (
                    <PermissionRow
                      key={perm.key}
                      perm={perm}
                      state={permStates[perm.key] || 'inherit'}
                      onSetState={(state) => handleSetState(perm.key, state)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================= DISCORD FLOATING STICKY SAVE BAR ================= */}
        {hasUnsavedChanges && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 236,
              right: 12,
              backgroundColor: '#111214',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-high)',
              border: '1px solid var(--border-subtle)',
              zIndex: 20,
              animation: 'fadeIn var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-header)', fontSize: 13 }}>
              <AlertTriangle size={16} color="var(--text-warning)" />
              <span>Cẩn thận — bạn có thay đổi chưa lưu!</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetChanges}
                disabled={saving}
              >
                <RotateCcw size={14} style={{ marginRight: 4 }} /> Đặt lại
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveOverride}
                loading={saving}
              >
                <Check size={14} style={{ marginRight: 4 }} /> Lưu thay đổi
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Subcomponent: Individual 3-state permission row
function PermissionRow({ perm, state, onSetState }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        backgroundColor: 'var(--bg-input)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ paddingRight: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-header)' }}>
          {perm.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
          {perm.description}
        </div>
      </div>

      {/* Tri-State Control Group */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)',
          padding: 2,
          border: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        {/* Deny (Red X) */}
        <button
          type="button"
          className="btn-icon"
          style={{
            width: 30,
            height: 30,
            backgroundColor: state === 'deny' ? 'var(--text-danger)' : 'transparent',
            color: state === 'deny' ? '#ffffff' : 'var(--text-muted)',
            transition: 'var(--transition-fast)',
          }}
          onClick={() => onSetState('deny')}
          title="Từ chối quyền (Deny)"
        >
          <X size={15} />
        </button>

        {/* Inherit (Slash /) */}
        <button
          type="button"
          className="btn-icon"
          style={{
            width: 30,
            height: 30,
            backgroundColor: state === 'inherit' ? 'var(--bg-input-hover)' : 'transparent',
            color: state === 'inherit' ? 'var(--text-header)' : 'var(--text-muted)',
            transition: 'var(--transition-fast)',
          }}
          onClick={() => onSetState('inherit')}
          title="Kế thừa mặc định (Inherit)"
        >
          <Slash size={15} />
        </button>

        {/* Allow (Green Check) */}
        <button
          type="button"
          className="btn-icon"
          style={{
            width: 30,
            height: 30,
            backgroundColor: state === 'allow' ? 'var(--status-online)' : 'transparent',
            color: state === 'allow' ? '#ffffff' : 'var(--text-muted)',
            transition: 'var(--transition-fast)',
          }}
          onClick={() => onSetState('allow')}
          title="Cho phép quyền (Allow)"
        >
          <Check size={15} />
        </button>
      </div>
    </div>
  );
}
