import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { serverService } from '../../api';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

export default function JoinServerModal({ onClose, onSuccess }) {
  const { toast } = useFeedback();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = inviteCode.trim();
    if (!cleanCode) {
      toast('Vui lòng nhập mã mời', 'error');
      return;
    }

    try {
      setLoading(true);
      const server = await serverService.joinServerByInviteCode(cleanCode);
      onSuccess(server);
      onClose();
    } catch (err) {
      toast(extractErrorMessage(err, 'Mã mời không hợp lệ hoặc bạn đã bị cấm'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Tham gia máy chủ"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Tham gia
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Nhập mã mời 8 ký tự hoặc liên kết mời từ bạn bè để tham gia vào máy chủ có sẵn.
        </p>

        <Input
          label="MÃ MỜI"
          id="invite-code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="vd: a1b2c3d4"
          required
          autoFocus
        />
      </form>
    </Modal>
  );
}
