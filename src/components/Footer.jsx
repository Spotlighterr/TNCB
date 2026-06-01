import { Buildings, Phone, EnvelopeSimple } from '@phosphor-icons/react';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <Buildings size={24} weight="duotone" color="var(--color-accent)" />
              <span className="footer-logo-text">
                TNCB <span style={{ color: 'var(--color-accent)' }}>Rent</span>
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
              <li><a href="/search">Tìm phòng trọ</a></li>
              <li><a href="/search?city=Hà Nội">Phòng trọ Hà Nội</a></li>
              <li><a href="/search?city=TP. Hồ Chí Minh">Phòng trọ TP.HCM</a></li>
              <li><a href="/dashboard">Đăng tin cho thuê</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Liên hệ</h4>
            <ul className="footer-links">
              <li className="footer-contact-item">
                <Phone size={16} weight="regular" />
                <span>0869 333 366</span>
              </li>
              <li className="footer-contact-item">
                <EnvelopeSimple size={16} weight="regular" />
                <span>support@tncbrent.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 TNCB Rent (FTU Housing Bank). All rights reserved.</p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--color-divider);
          margin-top: var(--space-20);
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
          transition: color var(--duration-fast) var(--ease-smooth);
        }

        .footer-links a:hover {
          color: var(--color-accent);
        }

        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
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
      `}</style>
    </footer>
  );
}
