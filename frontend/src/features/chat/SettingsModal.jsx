import { LogOut } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useAuthContext } from '../../contexts/AuthContext';

export default function SettingsModal({ settings, updateSetting, onClose }) {
  const { logout, user } = useAuthContext();

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất khỏi tài khoản?')) {
      onClose();
      await logout();
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Cài đặt giao diện & Hệ thống" maxWidth={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* User Info Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-input)',
            padding: 12,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-header)' }}>{user?.username}</div>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{user?.email}</div>
          </div>

          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: 4 }} /> Đăng xuất
          </Button>
        </div>

        {/* 1. THEME SELECTION */}
        <div>
          <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
            CHỦ ĐỀ HIỂN THỊ (THEME)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'dark', label: 'Tối (Discord)' },
              { id: 'midnight', label: 'Nửa đêm (AMOLED)' },
              { id: 'light', label: 'Sáng (Light)' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                className={`btn btn-secondary ${settings.theme === t.id ? 'btn-primary' : ''}`}
                style={{ fontSize: 12, padding: '8px 4px', textAlign: 'center' }}
                onClick={() => updateSetting('theme', t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. ACCENT COLOR */}
        <div>
          <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
            MÀU ĐIỂM NHẤN (ACCENT COLOR)
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { id: 'blurple', color: '#5865f2', label: 'Blurple' },
              { id: 'teal', color: '#0d9488', label: 'Teal' },
              { id: 'emerald', color: '#10b981', label: 'Emerald' },
              { id: 'amber', color: '#f59e0b', label: 'Amber' },
              { id: 'rose', color: '#f43f5e', label: 'Rose' },
            ].map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => updateSetting('accent', acc.id)}
                title={acc.label}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: acc.color,
                  border: settings.accent === acc.id ? '3px solid #ffffff' : 'none',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-fast)',
                }}
              />
            ))}
          </div>
        </div>

        {/* 3. MESSAGE DENSITY */}
        <div>
          <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
            MẬT ĐỘ TIN NHẮN (DENSITY)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className={`btn btn-secondary ${settings.density === 'cozy' ? 'btn-primary' : ''}`}
              onClick={() => updateSetting('density', 'cozy')}
            >
              Ấm cúng (Cozy)
            </button>
            <button
              type="button"
              className={`btn btn-secondary ${settings.density === 'compact' ? 'btn-primary' : ''}`}
              onClick={() => updateSetting('density', 'compact')}
            >
              Thu gọn (Compact)
            </button>
          </div>
        </div>

        {/* 4. SOUND TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-header)' }}>
              Âm thanh thông báo
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
              Phát âm thanh nhẹ khi có tin nhắn mới trong kênh
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
        </div>
      </div>
    </Modal>
  );
}
