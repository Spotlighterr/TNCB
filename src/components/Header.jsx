import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
} from '@phosphor-icons/react';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', icon: House },
  { to: '/search', label: 'Tìm phòng', icon: MagnifyingGlass },
  { to: '/dashboard', label: 'Quản lý', icon: ChartBar },
];

export default function Header() {
  const { currentUser, login, register, logout, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [profileOpen, setProfileOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('tenant');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const res = login(email, password);
    if (res.success) {
      setAuthSuccess('Đăng nhập thành công!');
      setTimeout(() => {
        setIsAuthOpen(false);
        setAuthSuccess('');
        setEmail('');
        setPassword('');
        navigate('/dashboard');
      }, 1000);
    } else {
      setAuthError(res.message);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regName || !regEmail || !regPhone || !regPassword) {
      setAuthError('Vui lòng điền đầy đủ các thông tin.');
      return;
    }
    const res = register(regName, regEmail, regPhone, regPassword, regRole);
    if (res.success) {
      setAuthSuccess('Đăng ký tài khoản thành công!');
      setTimeout(() => {
        setIsAuthOpen(false);
        setAuthSuccess('');
        setRegName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        navigate('/dashboard');
      }, 1000);
    } else {
      setAuthError(res.message);
    }
  };

  return (
    <>
      <header className="header glass" id="main-header">
      <div className="header-inner container">
        {/* Logo */}
        <Link to="/" className="header-logo" id="logo-link">
          <Buildings size={28} weight="duotone" color="var(--color-accent)" />
          <span className="header-logo-text">
            TNCB <span className="header-logo-accent">Rent</span>
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
          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Chuyển đổi giao diện"
            title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
            id="theme-toggle-btn"
          >
            {theme === 'light' ? <Moon size={18} weight="bold" /> : <Sun size={18} weight="bold" />}
          </button>
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
              <span>Đăng nhập</span>
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

    {/* Auth Modal Overlay */}
    {isAuthOpen && (
        <div className="auth-overlay animate-fade-in" onClick={() => setIsAuthOpen(false)}>
          <div
            className="auth-modal glass-strong animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            id="auth-modal"
          >
            <button className="auth-close-btn" onClick={() => setIsAuthOpen(false)}>
              <X size={20} />
            </button>

            {/* Modal Title Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
              >
                Đăng nhập
              </button>
              <button
                className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
              >
                Đăng ký
              </button>
            </div>

            {authError && <div className="auth-error-banner">{authError}</div>}
            {authSuccess && (
              <div className="auth-success-banner">
                <CheckCircle size={18} weight="fill" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Login Form */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="auth-form" id="login-form">
                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Email tài khoản</label>
                  <div className="auth-input-wrap">
                    <EnvelopeSimple size={18} />
                    <input
                      type="email"
                      className="auth-input"
                      required
                      placeholder="email@tncb.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label">Mật khẩu</label>
                  <div className="auth-input-wrap">
                    <Lock size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      required
                      placeholder="Mật khẩu của bạn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Xác nhận đăng nhập
                </button>

              </form>
            )}

            {/* Register Form */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="auth-form" id="register-form">
                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Họ và tên</label>
                  <div className="auth-input-wrap">
                    <User size={18} />
                    <input
                      className="auth-input"
                      required
                      placeholder="Nguyễn Văn A"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Email đăng ký</label>
                  <div className="auth-input-wrap">
                    <EnvelopeSimple size={18} />
                    <input
                      type="email"
                      className="auth-input"
                      required
                      placeholder="email@tncb.vn"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Số điện thoại liên hệ</label>
                  <div className="auth-input-wrap">
                    <PhoneIcon size={18} />
                    <input
                      className="auth-input"
                      required
                      placeholder="09XXXXXXXX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="form-label">Mật khẩu</label>
                  <div className="auth-input-wrap">
                    <Lock size={18} />
                    <input
                      type="password"
                      className="auth-input"
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
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
                  Đăng ký tài khoản
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
        }

        .auth-modal {
          width: 100%;
          max-width: 440px;
          border-radius: var(--radius-lg);
          padding: var(--space-8) var(--space-6) var(--space-6);
          position: relative;
          box-shadow: var(--shadow-xl);
          animation: scaleIn var(--duration-spring) var(--ease-tactile) both;
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

        .auth-input-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-subtle);
          transition: border-color var(--duration-fast) var(--ease-smooth);
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
        }

        .auth-input::placeholder {
          color: var(--color-text-subtle);
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
