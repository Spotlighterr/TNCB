import { useState, useRef, useEffect } from 'react';
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
  ShieldCheck,
  QrCode,
} from '@phosphor-icons/react';

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, updateProfile, setupMFA, verifyMFA, disableMFA, toggleOTP } = useApp();
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

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // MFA states
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'mfa'
  const [mfaStep, setMfaStep] = useState('status'); // 'status', 'setup', 'disable'
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
      });
      setAvatarPreview(currentUser?.avatar || '');
      setAvatarFile(null);
      setError('');
      setSuccess('');
      // Reset MFA states
      setActiveTab('info');
      setMfaStep('status');
      setMfaSecret('');
      setMfaQrCode('');
      setMfaCode('');
      setMfaError('');
      setMfaSuccess('');
      setMfaLoading(false);
    } else if (shouldRender) {
      setIsClosing(true);
      timer = setTimeout(() => {
        setShouldRender(false);
      }, 250);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!shouldRender || !currentUser) return null;

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

  const handleInitiateMfaSetup = async () => {
    setMfaError('');
    setMfaSuccess('');
    setMfaLoading(true);
    try {
      const res = await setupMFA();
      if (res.success) {
        setMfaSecret(res.secret);
        setMfaQrCode(res.qrCodeUrl);
        setMfaStep('setup');
      } else {
        setMfaError(res.message || 'Không thể thiết lập MFA lúc này.');
      }
    } catch {
      setMfaError('Lỗi kết nối máy chủ.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfaActivation = async (e) => {
    e.preventDefault();
    setMfaError('');
    setMfaSuccess('');
    if (mfaCode.length !== 6) {
      setMfaError('Mã xác thực phải gồm 6 chữ số.');
      return;
    }
    setMfaLoading(true);
    try {
      const res = await verifyMFA(mfaCode);
      if (res.success) {
        setMfaSuccess('Kích hoạt Bảo mật 2 lớp (MFA) thành công!');
        setMfaCode('');
        setTimeout(() => {
          setMfaStep('status');
          setMfaSuccess('');
        }, 2000);
      } else {
        setMfaError(res.message || 'Mã xác thực không chính xác.');
      }
    } catch {
      setMfaError('Lỗi kết nối máy chủ.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    setMfaError('');
    setMfaSuccess('');
    if (mfaCode.length !== 6) {
      setMfaError('Mã xác thực phải gồm 6 chữ số.');
      return;
    }
    setMfaLoading(true);
    try {
      const res = await disableMFA(mfaCode);
      if (res.success) {
        setMfaSuccess('Đã tắt bảo mật 2 lớp (MFA) thành công.');
        setMfaCode('');
        setTimeout(() => {
          setMfaStep('status');
          setMfaSuccess('');
        }, 2000);
      } else {
        setMfaError(res.message || 'Mã xác thực không chính xác.');
      }
    } catch {
      setMfaError('Lỗi kết nối máy chủ.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleToggleOTP = async (enabled) => {
    setMfaError('');
    setMfaSuccess('');
    setOtpLoading(true);
    try {
      const res = await toggleOTP(enabled);
      if (res.success) {
        setMfaSuccess(`Đã ${enabled ? 'bật' : 'tắt'} xác thực OTP qua email thành công.`);
        setTimeout(() => setMfaSuccess(''), 2000);
      } else {
        setMfaError(res.message || 'Không thể cấu hình OTP lúc này.');
      }
    } catch {
      setMfaError('Lỗi kết nối máy chủ.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      <div className={`profile-modal-overlay animate-fade-in ${isClosing ? 'is-closing' : ''}`} onClick={onClose}>
        <div
          className={`profile-modal glass-strong animate-scale-in ${isClosing ? 'is-closing' : ''} ${isSubmitting ? 'is-submitting' : ''} ${success ? 'is-success' : ''}`}
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

          {/* Profile Modal Tabs */}
          <div className="profile-modal-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
            <button
              type="button"
              className={`profile-modal-tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
              style={{
                flex: 1,
                padding: 'var(--space-3) 0',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'info' ? '2px solid var(--color-accent)' : '2px solid transparent',
                color: activeTab === 'info' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'info' ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-smooth)',
                fontSize: '14px',
              }}
            >
              Thông tin cá nhân
            </button>
            <button
              type="button"
              className={`profile-modal-tab ${activeTab === 'mfa' ? 'active' : ''}`}
              onClick={() => setActiveTab('mfa')}
              style={{
                flex: 1,
                padding: 'var(--space-3) 0',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'mfa' ? '2px solid var(--color-accent)' : '2px solid transparent',
                color: activeTab === 'mfa' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'mfa' ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-smooth)',
                fontSize: '14px',
              }}
            >
              Bảo mật & Xác thực
            </button>
          </div>

          {/* Tab Content: Profile Info */}
          {activeTab === 'info' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                  <label className="auth-input-wrap">
                    <User size={18} />
                    <input
                      className="auth-input"
                      required
                      placeholder="Nhập họ và tên"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                </div>

                <div className="profile-form-group">
                  <label className="form-label">Email</label>
                  <label className="auth-input-wrap">
                    <EnvelopeSimple size={18} />
                    <input
                      type="email"
                      className="auth-input"
                      required
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </label>
                </div>

                <div className="profile-form-group">
                  <label className="form-label">Số điện thoại</label>
                  <label className="auth-input-wrap">
                    <PhoneIcon size={18} />
                    <input
                      className="auth-input"
                      required
                      placeholder="09XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </label>
                </div>

                <div className="profile-form-group">
                  <label className="form-label">Vai trò</label>
                  <label className="auth-input-wrap" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                    <User size={18} />
                    <input
                      className="auth-input"
                      disabled
                      value={currentUser.role === 'landlord' ? 'Chủ trọ / AMS' : 'Khách thuê'}
                      style={{ cursor: 'not-allowed' }}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: 'var(--space-2)', gap: 'var(--space-2)' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tab Content: MFA Settings */}
          {activeTab === 'mfa' && (
            <div className="mfa-profile-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* MFA Error/Success */}
              {mfaError && (
                <div className="profile-msg profile-msg-error" style={{ marginBottom: 0 }}>
                  <WarningCircle size={16} weight="fill" />
                  <span>{mfaError}</span>
                </div>
              )}
              {mfaSuccess && (
                <div className="profile-msg profile-msg-success" style={{ marginBottom: 0 }}>
                  <CheckCircle size={16} weight="fill" />
                  <span>{mfaSuccess}</span>
                </div>
              )}

              {mfaStep === 'status' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {/* Section 1: Email OTP */}
                  <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>Xác thực qua Email OTP</strong>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        background: currentUser.otpEnabled ? 'rgba(46, 204, 113, 0.15)' : 'rgba(127, 140, 141, 0.15)',
                        color: currentUser.otpEnabled ? '#2ecc71' : 'var(--color-text-muted)'
                      }}>
                        {currentUser.otpEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.4', marginBottom: 'var(--space-3)' }}>
                      Yêu cầu nhập mã xác thực OTP gửi qua Email mỗi khi đăng nhập bằng mật khẩu (không áp dụng khi đăng nhập bằng Google SSO).
                    </p>
                    <button
                      type="button"
                      className={`btn ${currentUser.otpEnabled ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleToggleOTP(!currentUser.otpEnabled)}
                      disabled={otpLoading}
                      style={{ width: '100%', fontSize: '13px', padding: '8px 16px' }}
                    >
                      {otpLoading ? 'Đang xử lý...' : (currentUser.otpEnabled ? 'Tắt xác thực OTP qua Email' : 'Kích hoạt OTP qua Email')}
                    </button>
                  </div>

                  {/* Section 2: Authenticator App (MFA) */}
                  <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--color-text-main)' }}>Ứng dụng xác thực (MFA / 2FA)</strong>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        background: currentUser.mfaEnabled ? 'rgba(46, 204, 113, 0.15)' : 'rgba(127, 140, 141, 0.15)',
                        color: currentUser.mfaEnabled ? '#2ecc71' : 'var(--color-text-muted)'
                      }}>
                        {currentUser.mfaEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.4', marginBottom: 'var(--space-3)' }}>
                      Bảo vệ tài khoản bằng ứng dụng Authenticator (Google / Microsoft). Khi bật, bước này sẽ được ưu tiên hơn Email OTP.
                    </p>
                    {currentUser.mfaEnabled ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setMfaCode('');
                          setMfaStep('disable');
                        }}
                        style={{ width: '100%', fontSize: '13px', padding: '8px 16px', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                      >
                        Tắt bảo mật Authenticator
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleInitiateMfaSetup}
                        disabled={mfaLoading}
                        style={{ width: '100%', fontSize: '13px', padding: '8px 16px' }}
                      >
                        {mfaLoading ? 'Đang khởi tạo...' : 'Kích hoạt bảo mật Authenticator'}
                      </button>
                    )}
                  </div>

                  {currentUser.mfaEnabled && currentUser.otpEnabled && (
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic', marginTop: 'var(--space-1)' }}>
                      * Đang bật cả hai: Hệ thống sẽ chỉ yêu cầu Authenticator (MFA) vì có tính bảo mật cao hơn.
                    </p>
                  )}
                </div>
              )}

              {mfaStep === 'setup' && (
                <form onSubmit={handleVerifyMfaActivation} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <p style={{ fontWeight: 'var(--weight-semibold)', fontSize: '14px', marginBottom: 'var(--space-3)' }}>Quét mã QR</p>
                    {mfaQrCode ? (
                      <img src={mfaQrCode} alt="MFA QR Code" style={{ display: 'block', margin: '0 auto var(--space-3)', width: '160px', height: '160px', borderRadius: 'var(--radius-sm)', border: '4px solid white' }} />
                    ) : (
                      <div style={{ width: '160px', height: '160px', margin: '0 auto var(--space-3)', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={48} />
                      </div>
                    )}
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Nếu không thể quét QR, nhập khoá thiết lập thủ công:</p>
                    <code style={{ display: 'inline-block', padding: 'var(--space-1) var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.05em' }}>{mfaSecret}</code>
                  </div>

                  <div className="profile-form-group">
                    <label className="form-label">Nhập mã xác thực 6 số để hoàn tất:</label>
                    <label className="auth-input-wrap">
                      <ShieldCheck size={18} />
                      <input
                        className="auth-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="Ví dụ: 123456"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setMfaStep('status')}
                      style={{ flex: 1 }}
                    >
                      Huỷ bỏ
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={mfaLoading}
                      style={{ flex: 1 }}
                    >
                      {mfaLoading ? 'Đang xác thực...' : 'Bật MFA'}
                    </button>
                  </div>
                </form>
              )}

              {mfaStep === 'disable' && (
                <form onSubmit={handleDisableMfa} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div className="profile-msg profile-msg-error" style={{ marginBottom: 0, background: 'rgba(220, 38, 38, 0.05)', border: '1px solid rgba(220, 38, 38, 0.15)' }}>
                    <WarningCircle size={20} weight="fill" />
                    <div>
                      <strong style={{ display: 'block', marginBottom: 'var(--space-1)' }}>Cảnh báo an toàn</strong>
                      <span style={{ fontSize: '12px' }}>Tắt bảo mật 2 lớp sẽ làm giảm đáng kể mức độ bảo vệ của tài khoản bạn.</span>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label className="form-label">Nhập mã xác thực 6 số hiện tại để tắt:</label>
                    <label className="auth-input-wrap">
                      <ShieldCheck size={18} />
                      <input
                        className="auth-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="Nhập mã 6 số"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setMfaStep('status')}
                      style={{ flex: 1 }}
                    >
                      Huỷ bỏ
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={mfaLoading}
                      style={{ flex: 1, backgroundColor: 'var(--color-error)' }}
                    >
                      {mfaLoading ? 'Đang tắt...' : 'Xác nhận Tắt'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
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

        /* Animations & Premium Micro-interactions */
        .profile-modal-overlay.is-closing {
          animation: fadeOut 0.25s var(--ease-smooth) both;
        }

        .profile-modal.is-closing {
          animation: scaleOut 0.22s var(--ease-tactile) both;
        }

        .profile-modal.is-submitting {
          animation: modalBreathe 1.5s var(--ease-smooth) infinite;
        }

        .profile-modal.is-success {
          animation: successPop 0.55s var(--ease-spring) both;
          border-color: var(--color-success) !important;
          box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.25), 0 20px 50px rgba(16, 185, 129, 0.15) !important;
        }

        .is-success .profile-avatar-img {
          animation: avatarSuccessPop 0.6s var(--ease-spring) both;
          border-color: var(--color-success) !important;
        }

        .profile-msg {
          animation: alertSlideIn 0.35s var(--ease-spring) both;
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes modalBreathe {
          0%, 100% { 
            box-shadow: var(--shadow-xl); 
            border-color: var(--color-border); 
          }
          50% { 
            box-shadow: var(--shadow-xl), var(--shadow-glow-accent); 
            border-color: var(--color-accent-muted); 
          }
        }

        @keyframes successPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.025); }
          100% { transform: scale(1); }
        }

        @keyframes avatarSuccessPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }

        @keyframes alertSlideIn {
          0% { opacity: 0; transform: translateY(-12px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
