import { useState } from 'react';
import {
  Phone,
  EnvelopeSimple,
  ChatCircle,
  X,
  Sun,
  Moon,
} from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

const CONTACT_INFO = {
  phone: '0346297668',
  phoneDisplay: '034 629 7668',
  email: 'tncb.findx@gmail.com',
};

export default function FloatingContact() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, toggleTheme } = useApp();

  return (
    <>
      <div className={`floating-contact ${isExpanded ? 'expanded' : ''}`} id="floating-contact">
        {/* Expanded buttons */}
        <div className={`floating-items ${isExpanded ? 'show' : ''}`}>
          {/* Theme Toggle button */}
          <button
            onClick={toggleTheme}
            className={`floating-item ${theme === 'light' ? 'floating-theme-light' : 'floating-theme-dark'}`}
            title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
            id="floating-theme-btn"
          >
            {theme === 'light' ? <Moon size={22} weight="bold" /> : <Sun size={22} weight="bold" />}
            <span className="floating-tooltip">
              {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
            </span>
          </button>

          {/* Email button */}
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="floating-item floating-email"
            title={`Email: ${CONTACT_INFO.email}`}
            id="floating-email-btn"
          >
            <EnvelopeSimple size={22} weight="bold" />
            <span className="floating-tooltip">
              {CONTACT_INFO.email}
            </span>
          </a>

          {/* Phone button */}
          <a
            href={`tel:${CONTACT_INFO.phone}`}
            className="floating-item floating-phone"
            title={`Gọi: ${CONTACT_INFO.phoneDisplay}`}
            id="floating-phone-btn"
          >
            <Phone size={22} weight="bold" />
            <span className="floating-tooltip">
              {CONTACT_INFO.phoneDisplay}
            </span>
          </a>
        </div>
        {/* Main toggle button */}
        <button
          className="floating-main-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Liên hệ nhanh FindX"
          id="floating-toggle-btn"
        >
          {isExpanded ? (
            <X size={24} weight="bold" />
          ) : (
            <ChatCircle size={24} weight="fill" />
          )}
        </button>
      </div>

      <style>{`
        .floating-contact {
          position: fixed;
          bottom: 28px;
          right: 24px;
          z-index: var(--z-fixed);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
        }

        @media (max-width: 768px) {
          .floating-contact {
            bottom: 80px;
            right: 16px;
          }
        }

        /* Main Toggle Button */
        .floating-main-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35), 0 0 0 0 rgba(16, 185, 129, 0.2);
          transition: all var(--duration-fast) var(--ease-tactile);
          animation: floatingPulse 3s ease-in-out infinite;
        }

        .floating-main-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(16, 185, 129, 0.45);
        }

        .floating-main-btn:active {
          transform: scale(0.95);
        }

        .floating-contact.expanded .floating-main-btn {
          background: var(--bg-tertiary);
          color: var(--color-text-main);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          animation: none;
          border: 1px solid var(--color-border);
        }

        @keyframes floatingPulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35), 0 0 0 0 rgba(16, 185, 129, 0.2);
          }
          50% {
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35), 0 0 0 12px rgba(16, 185, 129, 0);
          }
        }

        /* Expanded Items Container */
        .floating-items {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          opacity: 0;
          pointer-events: none;
          transform: translateY(16px) scale(0.8);
          transition: all var(--duration-spring) var(--ease-tactile);
        }

        .floating-items.show {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0) scale(1);
        }

        /* Individual floating items */
        .floating-item {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-tactile);
          box-shadow: 0 3px 14px rgba(0, 0, 0, 0.15);
        }

        .floating-item:hover {
          transform: scale(1.12);
        }

        .floating-item:active {
          transform: scale(0.95);
        }

        .floating-email {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          box-shadow: 0 3px 14px rgba(99, 102, 241, 0.35);
        }

        .floating-email:hover {
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.45);
        }

        .floating-phone {
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          box-shadow: 0 3px 14px rgba(59, 130, 246, 0.35);
        }

        .floating-phone:hover {
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.45);
        }

        /* Theme Toggle classes */
        .floating-theme-light {
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          box-shadow: 0 3px 14px rgba(30, 27, 75, 0.35);
          border: none;
        }

        .floating-theme-light:hover {
          box-shadow: 0 6px 24px rgba(30, 27, 75, 0.45);
        }

        .floating-theme-dark {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          box-shadow: 0 3px 14px rgba(245, 158, 11, 0.35);
          border: none;
        }

        .floating-theme-dark:hover {
          box-shadow: 0 6px 24px rgba(245, 158, 11, 0.45);
        }

        /* Tooltip */
        .floating-tooltip {
          position: absolute;
          right: calc(100% + 12px);
          white-space: nowrap;
          background: var(--glass-bg-strong);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          color: var(--color-text-main);
          font-size: var(--text-xs);
          font-weight: var(--weight-medium);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-subtle);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-md);
          opacity: 0;
          pointer-events: none;
          transform: translateX(8px);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .floating-tooltip::after {
          content: '';
          position: absolute;
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: var(--color-border);
        }

        .floating-item:hover .floating-tooltip {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </>
  );
}
