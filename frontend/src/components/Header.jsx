import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProfileModal from './ProfileModal';
import {
  House,
  MagnifyingGlass,
  ChartBar,
  List,
  X,
  UserCircle,
  Buildings,
  SignIn,
  SignOut,
  User,
  Lock,
  Phone as PhoneIcon,
  EnvelopeSimple,
  CheckCircle,
  Sun,
  Moon,
  ShieldCheck,
  ArrowLeft,
  PencilSimple,
  Key,
} from '@phosphor-icons/react';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', icon: House },
  { to: '/search', label: 'Tìm phòng', icon: MagnifyingGlass },
  { to: '/dashboard', label: 'Quản lý', icon: ChartBar },
];

export default function Header() {
  const {
    currentUser,
    login,
    loginWithGoogle,
    completeGoogleProfile,
    registerStep1,
    verifyRegistrationOTP,
    resendOTP,
    forgotPasswordStep1,
    resetPassword,
    logout,
    theme,
    toggleTheme,
    currentOTP,
    isAuthOpen,
    setIsAuthOpen,
    authMode,
    setAuthMode,
    verifyLoginMFA,
    verifyLoginOTP
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('tenant');

  // OTP states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoOTP, setDemoOTP] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpInputRefs = useRef([]);

  // Forgot password states
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotUserName, setForgotUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  // Google SSO states
  const [tempSSOToken, setTempSSOToken] = useState('');
  const [ssoUser, setSSOUser] = useState(null);
  const [ssoPhone, setSsoPhone] = useState('');
  const [ssoRole, setSsoRole] = useState('tenant');
  const [tempMfaToken, setTempMfaToken] = useState('');
  const [tempOtpToken, setTempOtpToken] = useState('');

  // Messages
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // --- OTP Countdown Timer ---
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // --- Google Identity Services (SSO) Initialization ---
  useEffect(() => {
    let timer;
    if (isAuthOpen && authMode === 'login') {
      timer = setTimeout(() => {
        try {
          if (typeof window.google !== 'undefined') {
            window.google.accounts.id.initialize({
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1029384756-abcdefg.apps.googleusercontent.com',
              callback: handleGoogleLoginResponse,
            });
            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-btn'),
              { theme: 'outline', size: 'large', width: '100%' }
            );
          }
        } catch (err) {
          console.error('Lỗi khởi tạo Google SSO:', err);
        }
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAuthOpen, authMode]);

  // --- OTP Input Handler ---
  const handleOtpChange = useCallback((index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Only last char
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }, [otpDigits]);

  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }, [otpDigits]);

  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newDigits = pastedData.split('');
      setOtpDigits(newDigits);
      otpInputRefs.current[5]?.focus();
    }
  }, []);

  // --- Reset all form states ---
  const resetAuthForms = () => {
    setEmail('');
    setPassword('');
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegRole('tenant');
    setOtpDigits(['', '', '', '', '', '']);
    setDemoOTP('');
    setOtpCountdown(0);
    setForgotPhone('');
    setForgotEmail('');
    setForgotUserName('');
    setNewPassword('');
    setConfirmNewPassword('');
    setAuthError('');
    setAuthSuccess('');
    setSsoPhone('');
    setSsoRole('tenant');
    setTempSSOToken('');
    setSSOUser(null);
    setTempMfaToken('');
  };

  const closeAuthModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsAuthOpen(false);
      setIsClosing(false);
      resetAuthForms();
      setAuthMode('login');
    }, 300);
  };

  // --- Login Submit ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.requiresMfa) {
        setTempMfaToken(res.tempMfaToken);
        setOtpDigits(['', '', '', '', '', '']);
        setAuthMode('mfa-login-verify');
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else if (res.requiresOtp) {
        setTempOtpToken(res.tempOtpToken);
        setDemoOTP(res.otp); // Save the demo OTP returned in sandbox mode
        setOtpDigits(['', '', '', '', '', '']);
        setAuthMode('otp-login-verify');
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setAuthSuccess('Đăng nhập thành công!');
        setTimeout(() => {
          closeAuthModal();
          navigate('/dashboard');
        }, 1000);
      }
    } else {
      setAuthError(res.message);
    }
  };

  // --- Register Step 1: Send OTP ---
  const handleRegisterStep1 = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setAuthError('Vui lòng điền đầy đủ các thông tin.');
      return;
    }

    const res = await registerStep1(regName, regEmail, regPhone, regPassword, regRole);
    if (res.success) {
      setDemoOTP(res.otp);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setAuthMode('otp-verify');
      setAuthError('');
      // Auto-focus first OTP input after render
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } else {
      setAuthError(res.message);
    }
  };

  // --- Register Step 2: Verify OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setAuthError('');
    const otpValue = otpDigits.join('');

    if (otpValue.length !== 6) {
      setAuthError('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }

    const res = await verifyRegistrationOTP(otpValue);
    if (res.success) {
      setAuthSuccess('Xác thực thành công! Tài khoản đã được tạo.');
      setTimeout(() => {
        closeAuthModal();
        navigate('/dashboard');
      }, 1500);
    } else {
      setAuthError(res.message);
    }
  };

  // --- Resend OTP ---
  const handleResendOTP = async () => {
    if (otpCountdown > 0) return;
    setAuthError('');
    const res = await resendOTP();
    if (res.success) {
      setDemoOTP(res.otp);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setAuthSuccess('Đã gửi lại mã OTP mới.');
      setTimeout(() => {
        setAuthSuccess('');
        otpInputRefs.current[0]?.focus();
      }, 2000);
    } else {
      setAuthError(res.message);
    }
  };

  // --- Forgot Password Step 1: Enter email ---
  const handleForgotStep1 = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!forgotEmail) {
      setAuthError('Vui lòng nhập địa chỉ email đã đăng ký.');
      return;
    }

    const res = await forgotPasswordStep1(forgotEmail);
    if (res.success) {
      setDemoOTP(res.otp);
      setForgotUserName(res.userName);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setAuthMode('forgot-otp');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } else {
      setAuthError(res.message);
    }
  };

  // --- Forgot Password Step 2: Verify OTP + Reset ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    const otpValue = otpDigits.join('');

    if (otpValue.length !== 6) {
      setAuthError('Vui lòng nhập đầy đủ 6 chữ số mã OTP.');
      return;
    }

    if (!newPassword) {
      setAuthError('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setAuthError('Mật khẩu xác nhận không khớp.');
      return;
    }

    const res = await resetPassword(otpValue, newPassword);
    if (res.success) {
      setAuthSuccess(res.message);
      setTimeout(() => {
        resetAuthForms();
        setAuthMode('login');
      }, 2000);
    } else {
      setAuthError(res.message);
    }
  };

  // --- Google Sign-In handlers ---
  const handleGoogleLoginResponse = async (response) => {
    setAuthError('');
    setAuthSuccess('');
    const idToken = response.credential;
    const res = await loginWithGoogle(idToken);
    if (res.success) {
      if (res.needsCompletion) {
        setTempSSOToken(res.tempToken);
        setSSOUser(res.user);
        setSsoPhone('');
        setSsoRole('tenant');
        setAuthMode('complete-profile');
      } else if (res.requiresMfa) {
        setTempMfaToken(res.tempMfaToken);
        setOtpDigits(['', '', '', '', '', '']);
        setAuthMode('mfa-login-verify');
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setAuthSuccess('Đăng nhập bằng Google thành công!');
        setTimeout(() => {
          closeAuthModal();
          navigate('/dashboard');
        }, 1000);
      }
    } else {
      setAuthError(res.message);
    }
  };

  const handleCompleteProfileSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!ssoPhone || !ssoRole) {
      setAuthError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;
    if (!phoneRegex.test(ssoPhone)) {
      setAuthError('Số điện thoại không hợp lệ. Vui lòng nhập SĐT Việt Nam.');
      return;
    }

    const res = await completeGoogleProfile(ssoPhone, ssoRole, tempSSOToken);
    if (res.success) {
      setAuthSuccess('Hoàn tất đăng ký tài khoản thành công!');
      setTimeout(() => {
        closeAuthModal();
        navigate('/dashboard');
      }, 1000);
    } else {
      setAuthError(res.message);
    }
  };

  const handleVerifyMfaLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setAuthError('Vui lòng nhập đủ 6 chữ số mã xác thực.');
      return;
    }
    const res = await verifyLoginMFA(tempMfaToken, code);
    if (res.success) {
      setAuthSuccess('Đăng nhập thành công!');
      setTimeout(() => {
        closeAuthModal();
        navigate('/dashboard');
      }, 1000);
    } else {
      setAuthError(res.message);
    }
  };

  const handleVerifyOtpLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setAuthError('Vui lòng nhập đủ 6 chữ số mã OTP.');
      return;
    }
    const res = await verifyLoginOTP(tempOtpToken, code);
    if (res.success) {
      setAuthSuccess('Đăng nhập thành công!');
      setTimeout(() => {
        closeAuthModal();
        navigate('/dashboard');
      }, 1000);
    } else {
      setAuthError(res.message);
    }
  };

  // --- OTP Input Component (reusable for both register and forgot flows) ---
  const renderOTPInput = () => (
    <div className="otp-input-container" id="otp-input-group">
      {otpDigits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (otpInputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`otp-digit-input ${digit ? 'filled' : ''}`}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(index, e)}
          onPaste={index === 0 ? handleOtpPaste : undefined}
          autoComplete="one-time-code"
          id={`otp-digit-${index}`}
        />
      ))}
    </div>
  );

  // --- Demo OTP Badge ---
  const renderDemoOTPBadge = () => (
    <div className="otp-demo-badge">
      <ShieldCheck size={16} weight="fill" />
      <span>Mã OTP mô phỏng: <strong>{demoOTP}</strong></span>
    </div>
  );

  return (
    <>
      <header className="header glass" id="main-header">
      <div className="header-inner container">
        {/* Logo */}
        <Link to="/" className="header-logo" id="logo-link">
          <Buildings size={28} weight="duotone" color="var(--color-accent)" />
          <span className="header-logo-text">
            Find<span className="header-logo-accent">X</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav hide-mobile" id="desktop-nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`header-nav-link ${isActive(link.to) ? 'active' : ''}`}
              id={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <link.icon size={18} weight={isActive(link.to) ? 'fill' : 'regular'} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="header-actions">
          {currentUser ? (
            /* User Panel (Logged In) */
            <div className="user-profile-wrapper">
              <button
                className="user-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
                id="profile-trigger-btn"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="user-trigger-avatar"
                />
                <span className="user-trigger-name hide-mobile">{currentUser.name}</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown glass-strong animate-scale-in" id="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>{currentUser.name}</strong>
                    <span className="profile-dropdown-role">
                      {currentUser.role === 'landlord' ? 'Chủ trọ / AMS' : 'Khách thuê'}
                    </span>
                  </div>
                  <button
                    className="profile-dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    id="edit-profile-btn"
                  >
                    <PencilSimple size={18} />
                    Cập nhật hồ sơ
                  </button>
                  <Link
                    to="/dashboard"
                    className="profile-dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ChartBar size={18} />
                    Trang quản trị
                  </Link>
                  <button
                    className="profile-dropdown-item logout-btn"
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                      navigate('/');
                    }}
                    id="logout-btn"
                  >
                    <SignOut size={18} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login Button (Logged Out) */
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsAuthOpen(true);
                setAuthMode('login');
              }}
              id="login-trigger-btn"
            >
              <SignIn size={18} weight="bold" />
              <span className="hide-mobile">Đăng nhập</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle hide-desktop"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu animate-fade-in" id="mobile-menu">
          <nav className="mobile-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon size={20} weight={isActive(link.to) ? 'fill' : 'regular'} />
                {link.label}
              </Link>
            ))}
          </nav>
          {currentUser ? (
            <div className="mobile-auth-section">
              <div className="mobile-user-info">
                <img src={currentUser.avatar} alt="" className="user-trigger-avatar" />
                <div>
                  <strong>{currentUser.name}</strong>
                  <p className="text-caption" style={{ fontSize: '11px' }}>
                    {currentUser.role === 'landlord' ? 'Chủ trọ / AMS' : 'Khách thuê'}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
              >
                <SignOut size={16} />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="mobile-auth-section">
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  setIsAuthOpen(true);
                  setAuthMode('login');
                  setMobileMenuOpen(false);
                }}
              >
                <SignIn size={18} />
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      )}
    </header>

    {/* =================== AUTH MODAL =================== */}
    {isAuthOpen && (
        <div className={`auth-overlay animate-fade-in ${isClosing ? 'is-closing' : ''}`} onClick={closeAuthModal}>
          <div
            className={`auth-modal glass-strong animate-scale-in ${isClosing ? 'is-closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
            id="auth-modal"
          >
            <button className="auth-close-btn" onClick={closeAuthModal}>
              <X size={20} />
            </button>

            {/* ---- LOGIN / REGISTER Tabs (shown only for login & register modes) ---- */}
            {(authMode === 'login' || authMode === 'register') && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                >
                  Đăng nhập
                </button>
                <button
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* ---- Back button for OTP / Forgot flows ---- */}
            {(authMode === 'otp-verify' || authMode === 'forgot' || authMode === 'forgot-otp' || authMode === 'reset-password' || authMode === 'mfa-login-verify') && (
              <button
                className="auth-back-btn"
                onClick={() => {
                  setAuthError('');
                  setAuthSuccess('');
                  if (authMode === 'otp-verify') setAuthMode('register');
                  else if (authMode === 'forgot' || authMode === 'mfa-login-verify') setAuthMode('login');
                  else if (authMode === 'forgot-otp' || authMode === 'reset-password') setAuthMode('forgot');
                }}
              >
                <ArrowLeft size={18} />
                <span>Quay lại</span>
              </button>
            )}

            {/* Error / Success banners */}
            {authError && <div className="auth-error-banner">{authError}</div>}
            {authSuccess && (
              <div className="auth-success-banner">
                <CheckCircle size={18} weight="fill" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* ===================== LOGIN FORM ===================== */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="auth-form" id="login-form">
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Email tài khoản</label>
                  <label className="auth-input-wrap">
                    <EnvelopeSimple size={18} />
                    <input
                      type="email"
                      className="auth-input"
                      required
                      placeholder="email@tncb.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Mật khẩu</label>
                  <label className="auth-input-wrap">
                    <Lock size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      required
                      placeholder="Mật khẩu của bạn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                </div>

                {/* Forgot Password Link */}
                <div style={{ textAlign: 'right', marginBottom: 'var(--space-4)' }}>
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => {
                      setAuthMode('forgot');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                  >
                    <Key size={14} />
                    Quên mật khẩu?
                  </button>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Xác nhận đăng nhập
                </button>

                <div className="auth-divider" style={{ margin: 'var(--space-4) 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Hoặc đăng nhập bằng</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div id="google-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
                </div>
              </form>
            )}

            {/* ===================== REGISTER FORM (Step 1) ===================== */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterStep1} className="auth-form" id="register-form">
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Họ và tên</label>
                  <label className="auth-input-wrap">
                    <User size={18} />
                    <input
                      className="auth-input"
                      required
                      placeholder="Nguyễn Văn A"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Email đăng ký</label>
                  <label className="auth-input-wrap">
                    <EnvelopeSimple size={18} />
                    <input
                      type="email"
                      className="auth-input"
                      required
                      placeholder="email@tncb.vn"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">
                    Số điện thoại
                  </label>
                  <label className="auth-input-wrap">
                    <PhoneIcon size={18} />
                    <input
                      className="auth-input"
                      required
                      placeholder="09XXXXXXXX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </label>
                   <span className="form-hint">Số điện thoại dùng để liên lạc. Mã OTP xác thực sẽ được gửi qua Email.</span>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Mật khẩu</label>
                  <label className="auth-input-wrap">
                    <Lock size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label" style={{ marginBottom: 'var(--space-1)' }}>
                    Tôi là:
                  </label>
                  <div className="role-selector-row">
                    <div
                      className={`role-select-box ${regRole === 'tenant' ? 'active' : ''}`}
                      onClick={() => setRegRole('tenant')}
                    >
                      <UserCircle size={20} />
                      <span>Khách thuê</span>
                    </div>
                    <div
                      className={`role-select-box ${regRole === 'landlord' ? 'active' : ''}`}
                      onClick={() => setRegRole('landlord')}
                    >
                      <Buildings size={20} />
                      <span>Chủ trọ cho thuê</span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <ShieldCheck size={18} weight="bold" />
                  Đăng Ký
                </button>
              </form>
            )}

            {/* ===================== OTP VERIFY (Step 2 of Register) ===================== */}
            {authMode === 'otp-verify' && (
              <form onSubmit={handleVerifyOTP} className="auth-form otp-verify-form" id="otp-verify-form">
                <div className="otp-header">
                  <div className="otp-icon-wrapper">
                    <ShieldCheck size={40} weight="duotone" />
                  </div>
                  <h3 className="otp-title">Xác thực tài khoản</h3>
                  <p className="otp-subtitle">
                    Nhập mã OTP 6 chữ số đã được gửi đến email <strong>{regEmail}</strong>
                  </p>
                </div>

                {/* Demo OTP badge */}
                {renderDemoOTPBadge()}

                {/* OTP Input */}
                {renderOTPInput()}

                {/* Countdown + Resend */}
                <div className="otp-resend-row">
                  {otpCountdown > 0 ? (
                    <span className="otp-countdown">
                      Gửi lại mã sau <strong>{otpCountdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="otp-resend-btn"
                      onClick={handleResendOTP}
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Xác nhận đăng ký
                </button>
              </form>
            )}

            {/* ===================== FORGOT PASSWORD (Step 1: Enter Email) ===================== */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgotStep1} className="auth-form" id="forgot-form">
                <div className="otp-header">
                  <div className="otp-icon-wrapper forgot-icon">
                    <Key size={40} weight="duotone" />
                  </div>
                  <h3 className="otp-title">Quên mật khẩu</h3>
                  <p className="otp-subtitle">
                    Nhập địa chỉ email đã đăng ký để nhận mã OTP đặt lại mật khẩu
                  </p>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label">Email đăng ký</label>
                  <label className="auth-input-wrap">
                    <EnvelopeSimple size={18} />
                    <input
                      type="email"
                      className="auth-input"
                      required
                      placeholder="email@tncb.vn"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <ShieldCheck size={18} weight="bold" />
                  Gửi mã OTP
                </button>
              </form>
            )}

            {/* ===================== FORGOT PASSWORD (Step 2: OTP + New Password) ===================== */}
            {authMode === 'forgot-otp' && (
              <form onSubmit={handleResetPassword} className="auth-form otp-verify-form" id="forgot-otp-form">
                <div className="otp-header">
                  <div className="otp-icon-wrapper forgot-icon">
                    <Key size={40} weight="duotone" />
                  </div>
                  <h3 className="otp-title">Đặt lại mật khẩu</h3>
                  <p className="otp-subtitle">
                    Xin chào <strong>{forgotUserName || 'bạn'}</strong>, nhập mã OTP gửi tới email và mật khẩu mới
                  </p>
                </div>

                {/* Demo OTP badge */}
                {renderDemoOTPBadge()}

                {/* OTP Input */}
                {renderOTPInput()}

                {/* Countdown + Resend */}
                <div className="otp-resend-row">
                  {otpCountdown > 0 ? (
                    <span className="otp-countdown">
                      Gửi lại mã sau <strong>{otpCountdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="otp-resend-btn"
                      onClick={async () => {
                        const res = await forgotPasswordStep1(forgotEmail);
                        if (res.success) {
                          setDemoOTP(res.otp);
                          setOtpDigits(['', '', '', '', '', '']);
                          setOtpCountdown(60);
                        }
                      }}
                    >
                      Gửi lại mã OTP
                    </button>
                  )}
                </div>

                {/* New Password Fields */}
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Mật khẩu mới</label>
                  <label className="auth-input-wrap">
                    <Lock size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <label className="auth-input-wrap">
                    <Lock size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Đặt lại mật khẩu
                </button>
              </form>
            )}

            {/* ===================== COMPLETE SSO PROFILE FORM ===================== */}
            {authMode === 'complete-profile' && (
              <form onSubmit={handleCompleteProfileSubmit} className="auth-form" id="complete-profile-form">
                <div className="otp-header">
                  {ssoUser?.avatar && (
                    <img
                      src={ssoUser.avatar}
                      alt={ssoUser.name}
                      className="user-trigger-avatar"
                      style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto var(--space-4)', display: 'block', border: '2px solid var(--color-accent)' }}
                    />
                  )}
                  <h3 className="otp-title">Hoàn tất đăng ký</h3>
                  <p className="otp-subtitle" style={{ marginBottom: 'var(--space-4)' }}>
                    Chào mừng <strong>{ssoUser?.name}</strong>! Vui lòng nhập số điện thoại và chọn vai trò để hoàn tất tài khoản.
                  </p>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">
                    Số điện thoại <span className="required-badge">Bắt buộc</span>
                  </label>
                  <label className="auth-input-wrap">
                    <PhoneIcon size={18} />
                    <input
                      className="auth-input"
                      required
                      placeholder="09XXXXXXXX"
                      value={ssoPhone}
                      onChange={(e) => setSsoPhone(e.target.value)}
                    />
                  </label>
                  <span className="form-hint">Dùng để liên hệ trao đổi tin trọ / Zalo</span>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>
                    Tôi là:
                  </label>
                  <div className="role-selector-row">
                    <div
                      className={`role-select-box ${ssoRole === 'tenant' ? 'active' : ''}`}
                      onClick={() => setSsoRole('tenant')}
                      style={{ cursor: 'pointer', flex: 1, padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    >
                      <UserCircle size={24} />
                      <span>Khách thuê</span>
                    </div>
                    <div
                      className={`role-select-box ${ssoRole === 'landlord' ? 'active' : ''}`}
                      onClick={() => setSsoRole('landlord')}
                      style={{ cursor: 'pointer', flex: 1, padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                    >
                      <Buildings size={24} />
                      <span>Chủ trọ cho thuê</span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Hoàn tất và Đăng nhập
                </button>
              </form>
            )}

            {/* ===================== MFA LOGIN VERIFICATION FORM ===================== */}
            {authMode === 'mfa-login-verify' && (
              <form onSubmit={handleVerifyMfaLogin} className="auth-form otp-verify-form" id="mfa-login-verify-form">
                <div className="otp-header">
                  <div className="otp-icon-wrapper" style={{ background: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}>
                    <ShieldCheck size={40} weight="duotone" />
                  </div>
                  <h3 className="otp-title">Xác thực 2 lớp (MFA)</h3>
                  <p className="otp-subtitle">
                    Tài khoản của bạn đã kích hoạt bảo mật 2 lớp. Vui lòng nhập mã 6 số từ ứng dụng Authenticator của bạn.
                  </p>
                </div>

                {/* OTP Input */}
                {renderOTPInput()}

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-5)' }}>
                  Xác nhận bảo mật
                </button>
              </form>
            )}

            {/* ===================== OTP LOGIN VERIFICATION FORM ===================== */}
            {authMode === 'otp-login-verify' && (
              <form onSubmit={handleVerifyOtpLogin} className="auth-form otp-verify-form" id="otp-login-verify-form">
                <div className="otp-header">
                  <div className="otp-icon-wrapper" style={{ background: 'rgba(var(--color-primary-rgb), 0.1)', color: 'var(--color-primary)' }}>
                    <EnvelopeSimple size={40} weight="duotone" />
                  </div>
                  <h3 className="otp-title">Xác thực OTP qua Email</h3>
                  <p className="otp-subtitle" style={{ marginBottom: 'var(--space-4)' }}>
                    Mã xác thực đã được gửi đến email đăng ký của bạn. Vui lòng kiểm tra hộp thư và nhập mã 6 số bên dưới.
                  </p>

                  {/* Sandboxed Demo OTP badge */}
                  {demoOTP && (
                    <div className="otp-demo-badge" id="otp-demo-display">
                      <span>Mã xác thực demo (Sandbox): </span>
                      <strong>{demoOTP}</strong>
                    </div>
                  )}
                </div>

                {/* OTP Input */}
                {renderOTPInput()}

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-5)' }}>
                  Xác nhận đăng nhập
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =================== PROFILE MODAL =================== */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <style>{`
        .header {
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          height: var(--header-height);
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--color-border);
        }

        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
          height: 100%;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        .header-logo-text {
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
          letter-spacing: -0.02em;
        }

        .header-logo-accent {
          color: var(--color-accent);
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .header-nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-subtle);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          color: var(--color-text-muted);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .header-nav-link:hover {
          color: var(--color-text-main);
          background: var(--bg-secondary);
        }

        .header-nav-link.active {
          color: var(--color-accent);
          background: var(--color-accent-subtle);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        /* Profile Panel Trigger */
        .user-profile-wrapper {
          position: relative;
        }

        .user-profile-trigger {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 4px var(--space-3) 4px 4px;
          border-radius: var(--radius-pill);
          background: var(--bg-secondary);
          border: 1px solid var(--color-border);
          transition: background var(--duration-fast) var(--ease-smooth);
        }

        .user-profile-trigger:hover {
          background: var(--bg-tertiary);
        }

        .user-trigger-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--color-border-strong);
        }

        .user-trigger-name {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          color: var(--color-text-main);
        }

        /* Profile Dropdown */
        .profile-dropdown {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0;
          width: 220px;
          border-radius: var(--radius-main);
          padding: var(--space-2);
          z-index: var(--z-dropdown);
          animation: scaleIn var(--duration-fast) var(--ease-tactile) both;
        }

        .profile-dropdown-header {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--color-divider);
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: var(--space-1);
        }

        .profile-dropdown-header strong {
          font-size: var(--text-sm);
          color: var(--color-text-main);
        }

        .profile-dropdown-role {
          font-size: var(--text-xs);
          color: var(--color-accent);
          font-weight: var(--weight-medium);
        }

        .profile-dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-subtle);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          width: 100%;
          text-align: left;
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .profile-dropdown-item:hover {
          background: var(--bg-secondary);
          color: var(--color-text-main);
        }

        .profile-dropdown-item.logout-btn:hover {
          color: var(--color-error);
          background: rgba(220, 38, 38, 0.08);
        }

        /* Mobile Auth section */
        .mobile-auth-section {
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-divider);
        }

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        /* Auth Modal Overlay */
        .auth-overlay {
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
          transition: all var(--duration-normal) var(--ease-tactile);
        }

        .auth-overlay.is-closing {
          animation: fadeOut var(--duration-normal) var(--ease-tactile) both;
        }

        .auth-modal {
          width: 100%;
          max-width: 440px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: var(--radius-lg);
          padding: var(--space-8) var(--space-6) var(--space-6);
          position: relative;
          box-shadow: var(--shadow-xl);
          animation: scaleIn var(--duration-spring) var(--ease-spring) both;
        }

        .auth-modal.is-closing {
          animation: scaleOut var(--duration-normal) var(--ease-spring) both;
        }

        .auth-close-btn {
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

        .auth-close-btn:hover {
          background: var(--bg-secondary);
          color: var(--color-text-main);
        }

        .auth-tabs {
          display: flex;
          border-bottom: 2px solid var(--color-divider);
          margin-bottom: var(--space-6);
          gap: var(--space-4);
        }

        .auth-tab {
          padding-bottom: var(--space-3);
          font-size: var(--text-base);
          font-weight: var(--weight-bold);
          color: var(--color-text-subtle);
          position: relative;
          transition: all var(--duration-fast) var(--ease-smooth);
          border: none;
          background: none;
        }

        .auth-tab.active {
          color: var(--color-accent);
        }

        .auth-tab.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-accent);
          border-radius: var(--radius-pill);
        }

        /* Back Button */
        .auth-back-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          font-weight: var(--weight-medium);
          color: var(--color-text-muted);
          margin-bottom: var(--space-5);
          padding: var(--space-1) 0;
          background: none;
          border: none;
          cursor: pointer;
          transition: color var(--duration-fast) var(--ease-smooth);
        }

        .auth-back-btn:hover {
          color: var(--color-accent);
        }

        .auth-input-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-subtle);
          transition: border-color var(--duration-fast) var(--ease-smooth);
          cursor: text;
        }

        .auth-input-wrap:focus-within {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-subtle);
        }

        .auth-input-wrap svg {
          color: var(--color-text-subtle);
          flex-shrink: 0;
        }

        .auth-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: var(--text-sm);
          color: var(--color-text-main);
          outline: none !important;
          box-shadow: none !important;
        }

        .auth-input:focus,
        .auth-input:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        .auth-input::placeholder {
          color: var(--color-text-subtle);
        }

        /* Forgot Password Link */
        .auth-forgot-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: var(--text-xs);
          color: var(--color-accent);
          font-weight: var(--weight-medium);
          background: none;
          border: none;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-smooth);
          padding: 2px 0;
        }

        .auth-forgot-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        /* Required Badge */
        .required-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: var(--weight-bold);
          color: var(--color-accent);
          background: var(--color-accent-subtle);
          padding: 1px 6px;
          border-radius: var(--radius-pill);
          margin-left: var(--space-2);
          letter-spacing: 0.02em;
        }

        /* Form Hint */
        .form-hint {
          font-size: 11px;
          color: var(--color-text-subtle);
          margin-top: 4px;
          padding-left: 2px;
        }

        /* Error/Success Banners */
        .auth-error-banner {
          background: rgba(220, 38, 38, 0.08);
          border: 1px solid rgba(220, 38, 38, 0.2);
          color: var(--color-error);
          padding: var(--space-3);
          border-radius: var(--radius-subtle);
          font-size: var(--text-xs);
          margin-bottom: var(--space-4);
          font-weight: var(--weight-medium);
        }

        .auth-success-banner {
          background: var(--color-accent-subtle);
          border: 1px solid var(--color-accent-muted);
          color: var(--color-accent);
          padding: var(--space-3);
          border-radius: var(--radius-subtle);
          font-size: var(--text-xs);
          margin-bottom: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: var(--weight-medium);
        }

        /* Role Picker Row */
        .role-selector-row {
          display: flex;
          gap: var(--space-3);
        }

        .role-select-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-2);
          border-radius: var(--radius-main);
          border: 1px solid var(--color-border);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-smooth);
          color: var(--color-text-muted);
        }

        .role-select-box:hover {
          background: var(--bg-tertiary);
          color: var(--color-text-main);
        }

        .role-select-box.active {
          background: var(--color-accent-subtle);
          border-color: var(--color-accent);
          color: var(--color-accent);
          font-weight: var(--weight-semibold);
        }

        /* ============================
           OTP Verification Styles
           ============================ */
        .otp-header {
          text-align: center;
          margin-bottom: var(--space-5);
        }

        .otp-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--color-accent-subtle);
          color: var(--color-accent);
          margin-bottom: var(--space-4);
          animation: otpIconPulse 2s ease-in-out infinite;
        }

        .otp-icon-wrapper.forgot-icon {
          background: rgba(251, 146, 60, 0.12);
          color: #f97316;
        }

        @keyframes otpIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .otp-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
          color: var(--color-text-main);
          margin-bottom: var(--space-2);
        }

        .otp-subtitle {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          line-height: 1.5;
        }

        /* OTP Input Group */
        .otp-input-container {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: var(--space-5);
        }

        .otp-digit-input {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: var(--text-xl);
          font-weight: var(--weight-bold);
          color: var(--color-text-main);
          background: var(--color-surface);
          border: 2px solid var(--color-border-strong);
          border-radius: var(--radius-main);
          outline: none !important;
          transition: all var(--duration-fast) var(--ease-tactile);
          font-family: var(--font-display);
        }

        .otp-digit-input:focus,
        .otp-digit-input:focus-visible {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-subtle);
          transform: scale(1.05);
          outline: none !important;
        }

        .otp-digit-input.filled {
          border-color: var(--color-accent);
          background: var(--color-accent-subtle);
        }

        /* Demo OTP Badge */
        .otp-demo-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.08));
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-pill);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: #b45309;
          margin-bottom: var(--space-4);
        }

        [data-theme="dark"] .otp-demo-badge {
          color: #fbbf24;
        }

        .otp-demo-badge strong {
          font-family: var(--font-display);
          font-variant-numeric: tabular-nums;
          font-size: var(--text-sm);
          letter-spacing: 3px;
        }

        /* Resend Row */
        .otp-resend-row {
          text-align: center;
          margin-bottom: var(--space-5);
        }

        .otp-countdown {
          font-size: var(--text-xs);
          color: var(--color-text-subtle);
        }

        .otp-countdown strong {
          color: var(--color-accent);
          font-family: var(--font-display);
          font-variant-numeric: tabular-nums;
        }

        .otp-resend-btn {
          font-size: var(--text-xs);
          font-weight: var(--weight-semibold);
          color: var(--color-accent);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-subtle);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .otp-resend-btn:hover {
          background: var(--color-accent-subtle);
          text-decoration: underline;
        }

        /* Theme toggle button styling */
        .theme-toggle-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-pill);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          background: var(--bg-secondary);
          transition: all var(--duration-fast) var(--ease-tactile);
          cursor: pointer;
        }

        .theme-toggle-btn:hover {
          background: var(--bg-tertiary);
          color: var(--color-text-main);
          transform: rotate(15deg) scale(1.05);
        }

        .theme-toggle-btn:active {
          transform: scale(0.95);
        }

        .mobile-menu-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-subtle);
          color: var(--color-text-main);
        }

        .mobile-menu {
          position: absolute;
          top: var(--header-height);
          left: 0;
          right: 0;
          background: var(--glass-bg-strong);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: 1px solid var(--glass-border);
          padding: var(--space-4) var(--content-padding);
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          margin-bottom: var(--space-4);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-subtle);
          font-size: var(--text-base);
          font-weight: var(--weight-medium);
          color: var(--color-text-muted);
        }

        .mobile-nav-link.active {
          color: var(--color-accent);
          background: var(--color-accent-subtle);
        }
      `}</style>
    </>
  );
}
