import { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { useFeedback } from '../../components/ui/Feedback';

export default function MessageInput({
  channelTitle = '',
  replyToMessage = null,
  onCancelReply,
  onSend,
  disabled = false,
}) {
  const { toast } = useFeedback();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  const handleInput = (e) => {
    setContent(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle local file picker
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      // 10MB limit check
      if (file.size > 10 * 1024 * 1024) {
        toast(`Tệp ${file.name} vượt quá giới hạn 10MB`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setAttachments((prev) => [
          ...prev,
          {
            fileUrl: loadEvent.target.result,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    setAttachments((prev) => [
      ...prev,
      {
        fileUrl: manualUrl.trim(),
        fileType: manualUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ? 'image/jpeg' : 'application/octet-stream',
        fileSize: 0,
        name: 'Đường dẫn tệp',
      },
    ]);
    setManualUrl('');
    setShowUrlInput(false);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed && attachments.length === 0) return;

    const payload = {
      content: trimmed,
      replyToId: replyToMessage?.id || null,
      attachments: attachments.map(({ fileUrl, fileType, fileSize }) => ({
        fileUrl,
        fileType,
        fileSize,
      })),
    };

    try {
      setContent('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (onCancelReply) onCancelReply();

      await onSend(payload);
    } catch (err) {
      toast('Không gửi được tin nhắn', 'error');
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-box">
        {/* Reply Preview Bar */}
        {replyToMessage && (
          <div className="chat-input-reply-bar">
            <span>
              Đang trả lời <strong>{replyToMessage.sender?.username}</strong>: "
              {replyToMessage.content?.slice(0, 50)}..."
            </span>
            <button className="btn-icon" style={{ width: 18, height: 18 }} onClick={onCancelReply}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 6 }}>
            {attachments.map((att, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {att.fileType?.startsWith('image/') || att.fileUrl?.startsWith('data:image/') ? (
                  <img
                    src={att.fileUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 10, padding: 4, textAlign: 'center' }}>{att.name}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Manual URL input modal row */}
        {showUrlInput && (
          <div style={{ display: 'flex', gap: 6, paddingBottom: 6 }}>
            <input
              type="text"
              className="form-input"
              style={{ padding: '4px 8px', fontSize: 13 }}
              placeholder="Dán link ảnh hoặc tệp (https://...)"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddManualUrl()}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={handleAddManualUrl}>
              Thêm
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowUrlInput(false)}>
              Hủy
            </button>
          </div>
        )}

        {/* Text Input Row */}
        <div className="chat-input-row">
          {/* File Picker trigger */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
            disabled={disabled}
          />

          <button
            type="button"
            className="btn-icon"
            onClick={() => fileInputRef.current?.click()}
            title={disabled ? 'Không thể đính kèm' : 'Đính kèm tệp hoặc ảnh từ máy tính'}
            disabled={disabled}
          >
            <Paperclip size={20} />
          </button>

          <button
            type="button"
            className="btn-icon"
            onClick={() => setShowUrlInput((o) => !o)}
            title={disabled ? 'Không thể đính kèm' : 'Nhập đường dẫn ảnh/tệp URL'}
            disabled={disabled}
          >
            <ImageIcon size={20} />
          </button>

          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder={
              disabled
                ? 'Bạn không có quyền gửi tin nhắn trong kênh này.'
                : `Gửi tin nhắn tới #${channelTitle || 'kênh'}`
            }
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            style={{ cursor: disabled ? 'not-allowed' : undefined }}
          />

          <button
            type="button"
            className="btn-icon"
            style={{
              color: content.trim() || attachments.length > 0 ? 'var(--accent)' : 'var(--text-subtle)',
            }}
            onClick={handleSubmit}
            disabled={disabled || (!content.trim() && attachments.length === 0)}
            title="Gửi tin nhắn (Enter)"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
