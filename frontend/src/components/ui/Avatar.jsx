import { getInitials } from '../../utils/helpers';

export default function Avatar({ src, name, size = 36, status = null, className = '' }) {
  const initials = getInitials(name);

  return (
    <div className={`avatar-wrapper ${className}`} style={{ width: size, height: size }}>
      <div className="avatar" style={{ width: size, height: size, fontSize: Math.max(12, size * 0.38) }}>
        {src ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && <span className={`status-dot ${status}`} />}
    </div>
  );
}
