import { MessageSquare, Plus, Compass } from 'lucide-react';
import { getInitials } from '../utils/helpers';

export default function ServerRail({
  servers = [],
  activeServerId = null,
  onSelectServer,
  onOpenHome,
  onCreateServer,
  onJoinServer,
}) {
  const isHomeActive = activeServerId === null;

  return (
    <nav className="server-rail" aria-label="Thanh máy chủ">
      {/* 1. NÚT TRANG CHỦ / DMs */}
      <div className={`rail-btn-wrapper ${isHomeActive ? 'active' : ''}`}>
        <span className="rail-pill" />
        <button
          className="rail-btn"
          onClick={onOpenHome}
          title="Trang chủ / Bạn bè & Tin nhắn trực tiếp"
          aria-label="Trang chủ"
        >
          <MessageSquare size={24} />
        </button>
      </div>

      <div className="rail-separator" />

      {/* 2. DANH SÁCH MÁY CHỦ */}
      {servers.map((server) => {
        const isActive = activeServerId === server.id;
        const initials = getInitials(server.name);

        return (
          <div key={server.id} className={`rail-btn-wrapper ${isActive ? 'active' : ''}`}>
            <span className="rail-pill" />
            <button
              className="rail-btn"
              onClick={() => onSelectServer(server.id)}
              title={server.name}
              aria-label={server.name}
            >
              {server.avatarUrl ? (
                <img
                  src={server.avatarUrl}
                  alt={server.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span style={{ fontSize: 15, fontWeight: 700 }}>{initials}</span>
              )}
            </button>
          </div>
        );
      })}

      {/* 3. NÚT TẠO SERVER (+) */}
      <div className="rail-btn-wrapper">
        <button
          className="rail-btn rail-btn-action"
          onClick={onCreateServer}
          title="Tạo máy chủ mới"
          aria-label="Tạo máy chủ mới"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* 4. NÚT THAM GIA SERVER BẰNG MÃ MỜI */}
      <div className="rail-btn-wrapper">
        <button
          className="rail-btn rail-btn-action"
          onClick={onJoinServer}
          title="Tham gia máy chủ bằng mã mời"
          aria-label="Tham gia máy chủ"
        >
          <Compass size={22} />
        </button>
      </div>
    </nav>
  );
}
