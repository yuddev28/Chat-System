import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="full-center"
          style={{
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--bg-app)',
            flexDirection: 'column',
            gap: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(242, 63, 67, 0.15)',
              color: 'var(--text-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-header)' }}>
            Đã có lỗi xảy ra trong giao diện
          </h2>

          <p style={{ maxWidth: 440, fontSize: 14, color: 'var(--text-muted)' }}>
            Hệ thống đã ghi nhận sự cố. Vui lòng thử tải lại trang hoặc đăng nhập lại.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            style={{ gap: 8 }}
          >
            <RefreshCw size={16} /> Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
