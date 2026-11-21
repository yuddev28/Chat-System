import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { serverService } from '../../api';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

export default function CreateServerModal({ onClose, onSuccess }) {
  const { toast } = useFeedback();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Tên máy chủ không được để trống', 'error');
      return;
    }

    try {
      setLoading(true);
      const server = await serverService.createServer({
        name: name.trim(),
        description: description.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });
      onSuccess(server);
      onClose();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể tạo máy chủ'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Tạo máy chủ của bạn"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Tạo máy chủ
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Máy chủ là nơi bạn và bạn bè có thể giao lưu, trò chuyện và chia sẻ. Hãy đặt tên cho máy chủ của bạn!
        </p>

        <Input
          label="TÊN MÁY CHỦ"
          id="server-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="vd: Cộng đồng Lập trình viên"
          required
          autoFocus
        />

        <Input
          label="MÔ TẢ (KHÔNG BẮT BUỘC)"
          id="server-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về máy chủ..."
        />

        <Input
          label="URL ẢNH ĐẠI DIỆN (KHÔNG BẮT BUỘC)"
          id="server-avatar"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://... ảnh máy chủ"
        />
      </form>
    </Modal>
  );
}
