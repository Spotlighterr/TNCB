import { Link, useLocation } from 'react-router-dom';
import {
  Buildings,
  Phone,
  EnvelopeSimple,
  House,
  MagnifyingGlass,
  ChartBar,
  Heart,
  FacebookLogo,
} from '@phosphor-icons/react';

export default function Footer() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <Buildings size={24} weight="duotone" color="var(--color-accent)" />
              <span className="footer-logo-text">
                Find<span style={{ color: 'var(--color-accent)' }}>X</span>
              </span>
            </div>
            <p className="footer-desc">
              Nền tảng thuê trọ thông minh dành cho sinh viên tại Hà Nội và TP. Hồ Chí Minh.
              Phòng thật, giá thật, vị trí thật.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Khám phá</h4>
            <ul className="footer-links">
              <li><Link to="/search">Tìm phòng trọ</Link></li>
              <li><Link to="/search?city=Hà Nội">Phòng trọ Hà Nội</Link></li>
              <li><Link to="/search?city=TP. Hồ Chí Minh">Phòng trọ TP.HCM</Link></li>
              <li><Link to="/dashboard">Đăng tin cho thuê</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Liên hệ</h4>
            <ul className="footer-links">
              <li className="footer-contact-item">
                <Phone size={16} weight="regular" />
                <span>034 629 7668</span>
              </li>
              <li className="footer-contact-item">
                <EnvelopeSimple size={16} weight="regular" />
                <span>tncb.findx@gmail.com</span>
              </li>
              <li className="footer-contact-item">
                <FacebookLogo size={16} weight="regular" />
                <a href="https://www.facebook.com/timnhacungban.findx" target="_blank" rel="noreferrer">FindX - Tìm Nhà Cùng Bạn</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <p>&copy; 2026 All rights reserved - FindX (FTU Housing Bank).</p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-subtle)', opacity: 0.7 }}>Development by Huy Vũ (Spotlighter)</p>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Taste Skill Compliant) */}
      <nav className="mobile-bottom-nav hide-desktop glass-strong" id="mobile-bottom-nav">
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
          <House size={20} weight={isActive('/') ? 'fill' : 'regular'} />
          <span>Trang chủ</span>
        </Link>
        <Link to="/search" className={`mobile-nav-item ${isActive('/search') ? 'active' : ''}`}>
          <MagnifyingGlass size={20} weight={isActive('/search') ? 'fill' : 'regular'} />
          <span>Tìm trọ</span>
        </Link>
        <Link to="/dashboard" className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <ChartBar size={20} weight={isActive('/dashboard') ? 'fill' : 'regular'} />
          <span>Quản lý</span>
        </Link>
      </nav>

      <style>{`
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--color-divider);
          margin-top: var(--space-20);
          padding-bottom: 0;
        }

        .footer-inner {
          padding-top: var(--space-12);
          padding-bottom: var(--space-8);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: var(--space-10);
          margin-bottom: var(--space-10);
        }

        @media (max-width: 768px) {
          .footer {
            margin-top: var(--space-12);
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: var(--space-8);
          }
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .footer-logo-text {
          font-size: var(--text-lg);
          font-weight: var(--weight-bold);
        }

        .footer-desc {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          line-height: 1.7;
          max-width: 320px;
        }

        .footer-col-title {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
          margin-bottom: var(--space-4);
          color: var(--color-text-main);
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .footer-links a {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          transition: color var(--duration-fast) var(--ease-smooth),
                      transform var(--duration-fast) var(--ease-tactile);
          display: inline-block;
        }

        .footer-links a:hover {
          color: var(--color-accent);
          transform: translateX(3px);
        }

        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          transition: color var(--duration-fast) var(--ease-smooth);
        }

        .footer-contact-item:hover {
          color: var(--color-text-main);
        }

        .footer-bottom {
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-divider);
        }

        .footer-bottom p {
          font-size: var(--text-xs);
          color: var(--color-text-subtle);
          text-align: center;
        }

        /* Mobile Bottom Nav styles */
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: var(--z-fixed);
          border-top: 1px solid var(--glass-border);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          box-shadow: 0 -4px 20px rgba(11, 15, 25, 0.06);
          min-height: var(--mobile-bottom-nav-height);
          padding-top: 6px;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          box-sizing: border-box;
          padding-left: max(var(--space-4), env(safe-area-inset-left, 0px));
          padding-right: max(var(--space-4), env(safe-area-inset-right, 0px));
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: var(--color-text-muted);
          transition: all var(--duration-normal) var(--ease-spring);
          flex: 1;
          position: relative;
          padding: var(--space-2) 0;
        }

        .mobile-nav-item span {
          font-size: 10px;
          font-weight: var(--weight-medium);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .mobile-nav-item.active {
          color: var(--color-accent);
        }

        /* Active indicator dot */
        .mobile-nav-item.active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: var(--color-accent);
          border-radius: 50%;
          animation: scaleInBounceCenter var(--duration-spring) var(--ease-spring) both;
        }

        @keyframes scaleInBounceCenter {
          0% { opacity: 0; transform: translateX(-50%) scale(0); }
          60% { transform: translateX(-50%) scale(1.3); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }

        .mobile-nav-item:active {
          transform: scale(0.88);
        }
      `}</style>
    </footer>
  );
}
