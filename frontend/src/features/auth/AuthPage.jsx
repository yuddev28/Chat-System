import { useState } from 'react';
import { MessageSquare, Lock, Mail, User, Phone, FileText } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AuthPage({ onAuthSuccess }) {
  const { login, register } = useAuthContext();
  const { toast } = useFeedback();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    description: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emailOrUsername || !formData.password) {
      toast('Vui lòng nhập đầy đủ tài khoản và mật khẩu', 'error');
      return;
    }

    try {
      setLoading(true);
      const user = await login({
        emailOrUsername: formData.emailOrUsername.trim(),
        password: formData.password,
      });
      toast(`Chào mừng trở lại, ${user?.username}!`, 'success');
      if (onAuthSuccess) onAuthSuccess(user);
    } catch (err) {
      toast(extractErrorMessage(err, 'Đăng nhập không thành công'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.username || !formData.password) {
      toast('Vui lòng điền các trường bắt buộc', 'error');
      return;
    }

    try {
      setLoading(true);
      await register({
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber?.trim() || null,
        description: formData.description?.trim() || null,
      });
      toast('Đăng ký tài khoản thành công! Đang đăng nhập...', 'success');

      // Auto login after registration
      const user = await login({
        emailOrUsername: formData.username.trim(),
        password: formData.password,
      });
      if (onAuthSuccess) onAuthSuccess(user);
    } catch (err) {
      toast(extractErrorMessage(err, 'Đăng ký không thành công'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="full-center"
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-app)',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-high)',
          border: '1px solid var(--border-subtle)',
          padding: 32,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <MessageSquare size={28} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-header)', marginBottom: 4 }}>
            {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng bạn trở lại!'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isRegister
              ? 'Tham gia trò chuyện và kết nối cùng cộng đồng'
              : 'Rất vui được gặp lại bạn trong hệ thống ChatSystem'}
          </p>
        </div>

        {!isRegister ? (
          <form onSubmit={handleLoginSubmit}>
            <Input
              label="Email hoặc Tên người dùng"
              id="emailOrUsername"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              placeholder="Nhập email hoặc username"
              required
              autoFocus
            />

            <Input
              label="Mật khẩu"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: 8 }}
              loading={loading}
            >
              Đăng nhập
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              autoFocus
            />

            <Input
              label="Tên người dùng (Username)"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="vd: hoangduy"
              required
            />

            <Input
              label="Mật khẩu"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
              required
            />

            <Input
              label="Số điện thoại (Không bắt buộc)"
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="0912..."
            />

            <Input
              label="Mô tả bản thân (Không bắt buộc)"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Vài dòng giới thiệu..."
            />

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: 8 }}
              loading={loading}
            >
              Đăng ký tài khoản
            </Button>
          </form>
        )}

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          {isRegister ? 'Đã có tài khoản?' : 'Cần một tài khoản?'}
          <button
            type="button"
            onClick={() => setIsRegister((prev) => !prev)}
            style={{
              color: 'var(--accent)',
              fontWeight: 600,
              marginLeft: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {isRegister ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
