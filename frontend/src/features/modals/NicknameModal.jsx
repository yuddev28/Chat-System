import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { serverService } from '../../api';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

export default function NicknameModal({ serverId, currentNickname = '', onClose, onSuccess }) {
  const { toast } = useFeedback();
  const [nickname, setNickname] = useState(currentNickname);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await serverService.updateNickname(serverId, nickname.trim());
      toast('Đã cập nhật biệt danh máy chủ thành công!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể cập nhật biệt danh'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Đổi biệt danh trong máy chủ"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Biệt danh này sẽ chỉ hiển thị cho các thành viên trong máy chủ hiện tại và không làm thay đổi tên tài khoản chính của bạn.
        </p>

        <Input
          label="BIỆT DANH MÁY CHỦ"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Nhập biệt danh mong muốn (để trống để dùng tên tài khoản)"
          autoFocus
        />
      </form>
    </Modal>
  );
}
