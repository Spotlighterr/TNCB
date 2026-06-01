import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  EnvelopeSimple,
  Phone as PhoneIcon,
  Camera,
  CheckCircle,
  WarningCircle,
  PencilSimple,
} from '@phosphor-icons/react';

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, updateProfile } = useApp();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ảnh đại diện không được vượt quá 2MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (JPG, PNG, GIF...).');
      return;
    }

    setError('');
    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const updates = { ...formData };

      // If avatar changed, convert to base64
      if (avatarFile) {
        updates.avatar = avatarPreview; // Already base64 from FileReader
      }

      const res = updateProfile(updates);
      if (res.success) {
        setSuccess('Cập nhật hồ sơ thành công!');
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 1500);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="profile-modal-overlay animate-fade-in" onClick={onClose}>
        <div
          className="profile-modal glass-strong animate-scale-in"
          onClick={(e) => e.stopPropagation()}
          id="profile-modal"
        >
          <button className="profile-modal-close" onClick={onClose}>
            <X size={20} />
          </button>

          <h2 className="profile-modal-title">
            <PencilSimple size={22} weight="duotone" />
            Cập nhật hồ sơ
          </h2>

          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <img
                src={avatarPreview}
                alt={currentUser.name}
                className="profile-avatar-img"
              />
              <button
                type="button"
                className="profile-avatar-edit-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Thay đổi ảnh đại diện"
              >
                <Camera size={16} weight="bold" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                id="avatar-file-input"
              />
            </div>
            <p className="profile-avatar-hint">
              Nhấn vào biểu tượng camera để tải ảnh đại diện mới (tối đa 2MB)
            </p>
          </div>

          {/* Error/Success */}
          {error && (
            <div className="profile-msg profile-msg-error">
              <WarningCircle size={16} weight="fill" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="profile-msg profile-msg-success">
              <CheckCircle size={16} weight="fill" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="profile-form" id="profile-edit-form">
            <div className="profile-form-group">
              <label className="form-label">Họ và tên</label>
              <div className="auth-input-wrap">
                <User size={18} />
                <input
                  className="auth-input"
                  required
                  placeholder="Nhập họ và tên"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label className="form-label">Email</label>
              <div className="auth-input-wrap">
                <EnvelopeSimple size={18} />
                <input
                  type="email"
                  className="auth-input"
                  required
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label className="form-label">Số điện thoại</label>
              <div className="auth-input-wrap">
                <PhoneIcon size={18} />
                <input
                  className="auth-input"
                  required
                  placeholder="09XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label className="form-label">Vai trò</label>
              <div className="auth-input-wrap" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <User size={18} />
                <input
                  className="auth-input"
                  disabled
                  value={currentUser.role === 'landlord' ? 'Chủ trọ / AMS' : 'Khách thuê'}
                  style={{ cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 'var(--space-2)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .profile-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(11, 15, 25, 0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: var(--z-modal-backdrop);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--content-padding);
        }

        .profile-modal {
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: var(--radius-lg);
          padding: var(--space-8) var(--space-6) var(--space-6);
          position: relative;
          box-shadow: var(--shadow-xl);
          animation: scaleIn var(--duration-spring) var(--ease-tactile) both;
        }

        .profile-modal-close {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .profile-modal-close:hover {
          background: var(--bg-secondary);
          color: var(--color-text-main);
        }

        .profile-modal-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
          color: var(--color-text-main);
          margin-bottom: var(--space-6);
        }

        .profile-modal-title svg {
          color: var(--color-accent);
        }

        /* Avatar Section */
        .profile-avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .profile-avatar-wrapper {
          position: relative;
          width: 96px;
          height: 96px;
          margin-bottom: var(--space-3);
        }

        .profile-avatar-img {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--color-accent-muted);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .profile-avatar-wrapper:hover .profile-avatar-img {
          border-color: var(--color-accent);
        }

        .profile-avatar-edit-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--color-surface);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-tactile);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .profile-avatar-edit-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .profile-avatar-edit-btn:active {
          transform: scale(0.95);
        }

        .profile-avatar-hint {
          font-size: var(--text-xs);
          color: var(--color-text-subtle);
          text-align: center;
        }

        /* Messages */
        .profile-msg {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3);
          border-radius: var(--radius-subtle);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          margin-bottom: var(--space-4);
        }

        .profile-msg-error {
          background: rgba(220, 38, 38, 0.08);
          border: 1px solid rgba(220, 38, 38, 0.2);
          color: var(--color-error);
        }

        .profile-msg-success {
          background: var(--color-accent-subtle);
          border: 1px solid var(--color-accent-muted);
          color: var(--color-accent);
        }

        /* Form */
        .profile-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .profile-form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
      `}</style>
    </>
  );
}
