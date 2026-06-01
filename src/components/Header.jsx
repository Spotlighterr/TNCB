import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  House,
  MagnifyingGlass,
  ChartBar,
  List,
  X,
  UserCircle,
  Buildings,
} from '@phosphor-icons/react';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', icon: House },
  { to: '/search', label: 'Tìm phòng', icon: MagnifyingGlass },
  { to: '/dashboard', label: 'Quản lý', icon: ChartBar },
];

export default function Header() {
  const { userRole, setUserRole } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
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
          {/* Role Switcher */}
          <div className="role-switcher hide-mobile" id="role-switcher">
            <button
              className={`role-btn ${userRole === 'tenant' ? 'active' : ''}`}
              onClick={() => setUserRole('tenant')}
              id="role-tenant-btn"
            >
              <UserCircle size={16} weight="fill" />
              Khách thuê
            </button>
            <button
              className={`role-btn ${userRole === 'landlord' ? 'active' : ''}`}
              onClick={() => setUserRole('landlord')}
              id="role-landlord-btn"
            >
              <Buildings size={16} weight="fill" />
              Chủ trọ
            </button>
          </div>

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

      {/* Mobile Menu */}
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
          <div className="mobile-role-switcher">
            <button
              className={`role-btn ${userRole === 'tenant' ? 'active' : ''}`}
              onClick={() => { setUserRole('tenant'); setMobileMenuOpen(false); }}
            >
              <UserCircle size={16} weight="fill" />
              Khách thuê
            </button>
            <button
              className={`role-btn ${userRole === 'landlord' ? 'active' : ''}`}
              onClick={() => { setUserRole('landlord'); setMobileMenuOpen(false); }}
            >
              <Buildings size={16} weight="fill" />
              Chủ trọ
            </button>
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

        .role-switcher {
          display: flex;
          background: var(--bg-secondary);
          border-radius: var(--radius-subtle);
          padding: 3px;
          gap: 2px;
        }

        .role-btn {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          border-radius: 6px;
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          color: var(--color-text-muted);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .role-btn:hover {
          color: var(--color-text-main);
        }

        .role-btn.active {
          background: var(--color-surface);
          color: var(--color-accent);
          box-shadow: var(--shadow-xs);
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

        .mobile-role-switcher {
          display: flex;
          gap: var(--space-2);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-divider);
        }

        .mobile-role-switcher .role-btn {
          flex: 1;
          justify-content: center;
          padding: var(--space-3);
          background: var(--bg-secondary);
          border-radius: var(--radius-subtle);
        }

        .mobile-role-switcher .role-btn.active {
          background: var(--color-accent-subtle);
          color: var(--color-accent);
        }
      `}</style>
    </header>
  );
}
