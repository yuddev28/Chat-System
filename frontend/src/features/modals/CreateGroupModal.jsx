import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { channelService } from '../../api';
import { useFeedback } from '../../components/ui/Feedback';
import { extractErrorMessage } from '../../utils/helpers';

export default function CreateGroupModal({ serverId, onClose, onSuccess }) {
  const { toast } = useFeedback();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Tên danh mục không được để trống', 'error');
      return;
    }

    try {
      setLoading(true);
      const group = await channelService.createChannelGroup(serverId, {
        name: name.trim().toUpperCase(),
        position: 0,
      });
      onSuccess(group);
      onClose();
    } catch (err) {
      toast(extractErrorMessage(err, 'Không thể tạo danh mục kênh'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Tạo danh mục kênh"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Tạo danh mục
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Danh mục giúp gom nhóm các kênh cùng chủ đề để máy chủ ngăn nắp và dễ tìm kiếm.
        </p>

        <Input
          label="TÊN DANH MỤC"
          id="group-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="vd: KÊNH THẢO LUẬN"
          required
          autoFocus
        />
      </form>
    </Modal>
  );
}
