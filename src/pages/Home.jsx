import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import {
  MagnifyingGlass,
  Buildings,
  GraduationCap,
  MapPin,
  Star,
  ArrowRight,
  SealCheck,
} from '@phosphor-icons/react';
import { CITIES, DISTRICTS } from '../data/mockProperties';

export default function Home() {
  const { properties } = useApp();
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const featuredProperties = properties
    .filter((p) => p.verified && !p.isRented && !p.isUnlisted && p.status !== 'pending')
    .slice(0, 4);

  const availableCount = properties.filter((p) => !p.isRented && !p.isUnlisted && p.status !== 'pending').length;
  const districtCount = [...new Set(properties.map((p) => p.district))].length;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchDistrict) params.set('district', searchDistrict);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home-page" id="home-page">
      {/* ==================== HERO SECTION ==================== */}
      <section className="hero" id="hero-section">
        <div className="hero-inner container">
          <div className="hero-content animate-fade-in-up">
            <p className="text-eyebrow">FTU Housing Bank</p>
            <h1 className="hero-title">
              Tìm phòng trọ{' '}
              <span className="hero-title-accent">dễ dàng</span>
              <br />
              cho sinh viên
            </h1>
            <p className="hero-subtitle">
              Phòng thật, giá thật, vị trí thật tại Hà Nội & TP.HCM
            </p>

            {/* Search Bar */}
            <form className="hero-search glass" onSubmit={handleSearch} id="hero-search">
              <div className="hero-search-fields">
                <div className="hero-search-field">
                  <MapPin size={18} color="var(--color-accent)" />
                  <select
                    className="hero-search-select"
                    value={searchCity}
                    onChange={(e) => {
                      setSearchCity(e.target.value);
                      setSearchDistrict('');
                    }}
                  >
                    <option value="">Thành phố</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="hero-search-divider" />
                <div className="hero-search-field">
                  <Buildings size={18} color="var(--color-text-subtle)" />
                  <select
                    className="hero-search-select"
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                  >
                    <option value="">Quận / Huyện</option>
                    {searchCity && DISTRICTS[searchCity]?.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-lg hero-search-btn" id="hero-search-btn">
                  <MagnifyingGlass size={20} weight="bold" />
                  <span className="hide-mobile">Tìm phòng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED SECTION ==================== */}
      <section className="section" id="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="text-headline">Phòng trọ nổi bật</h2>
              <p className="text-caption" style={{ marginTop: 'var(--space-2)' }}>
                Đã xác thực bởi đội ngũ FindX
              </p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/search')}
              id="view-all-btn"
            >
              Xem tất cả
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="featured-grid">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-card card animate-fade-in" style={{ minHeight: '340px' }}>
                  <div className="skeleton-image skeleton" style={{ height: '180px' }} />
                  <div className="skeleton-content">
                    <div className="skeleton-line skeleton-title skeleton" style={{ width: '80%' }} />
                    <div className="skeleton-line skeleton-text-short skeleton" style={{ width: '40%' }} />
                    <div className="skeleton-line skeleton-text-medium skeleton" style={{ width: '60%', margin: '8px 0' }} />
                    <div className="skeleton-footer skeleton" style={{ height: '36px', marginTop: 'auto' }} />
                  </div>
                </div>
              ))
            ) : (
              featuredProperties.map((prop, idx) => (
                <PropertyCard key={prop.id} property={prop} index={idx} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ==================== BENTO STATS SECTION ==================== */}
      <section className="section-sm" id="stats-section">
        <div className="container">
          <div className="bento-grid">
            {/* Stat 1 - Accent bg */}
            <div className="bento-card bento-accent animate-fade-in-up stagger-1">
              <div className="bento-icon-wrap">
                <Buildings size={32} weight="duotone" />
              </div>
              <div className="bento-stat text-mono">{availableCount}+</div>
              <div className="bento-label">Phòng đang trống</div>
            </div>

            {/* Stat 2 */}
            <div className="bento-card animate-fade-in-up stagger-2">
              <div className="bento-icon-wrap">
                <MapPin size={32} weight="duotone" color="var(--color-accent)" />
              </div>
              <div className="bento-stat text-mono">{districtCount}</div>
              <div className="bento-label">Quận hỗ trợ</div>
            </div>

            {/* Stat 3 - Accent bg */}
            <div className="bento-card bento-accent animate-fade-in-up stagger-3">
              <div className="bento-icon-wrap">
                <GraduationCap size={32} weight="duotone" />
              </div>
              <div className="bento-stat text-mono">10+</div>
              <div className="bento-label">Trường ĐH lân cận</div>
            </div>

            {/* Stat 4 */}
            <div className="bento-card animate-fade-in-up stagger-4">
              <div className="bento-icon-wrap">
                <Star size={32} weight="fill" color="var(--color-warning)" />
              </div>
              <div className="bento-stat text-mono">4.8/5</div>
              <div className="bento-label">Đánh giá tích cực</div>
            </div>

            {/* Stat 5 */}
            <div className="bento-card animate-fade-in-up stagger-5">
              <div className="bento-icon-wrap">
                <SealCheck size={32} weight="duotone" color="var(--color-accent)" />
              </div>
              <div className="bento-stat text-mono">100%</div>
              <div className="bento-label">Xác thực thực tế</div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ============================================
           HERO SECTION — Cinematic Entry
           ============================================ */
        .hero {
          min-height: calc(100dvh - var(--header-height));
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          position: relative;
          overflow: hidden;
        }

        /* Ambient gradient orb — top right */
        .hero::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -15%;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: heroOrb1 8s var(--ease-in-out-sine) infinite;
        }

        /* Second orb — bottom left */
        .hero::after {
          content: '';
          position: absolute;
          bottom: -20%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.07) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: heroOrb2 10s var(--ease-in-out-sine) infinite 2s;
        }

        @keyframes heroOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          33% { transform: translate(-30px, 20px) scale(1.05); opacity: 1; }
          66% { transform: translate(20px, -15px) scale(0.95); opacity: 0.8; }
        }

        @keyframes heroOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(25px, -20px) scale(1.1); opacity: 0.8; }
        }

        .hero-inner {
          position: relative;
          z-index: 1;
          padding: var(--space-16) 0;
        }

        .hero-content {
          max-width: 640px;
        }

        /* Eyebrow — slide in from left */
        .hero-content .text-eyebrow {
          animation: slideInRight var(--duration-reveal) var(--ease-out-expo) 0.1s both;
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: -0.03em;
          line-height: 1.08;
          margin: var(--space-4) 0 var(--space-5);
          animation: revealUp var(--duration-hero) var(--ease-out-expo) 0.2s both;
        }

        .hero-title-accent {
          color: var(--color-accent);
          position: relative;
          background: linear-gradient(135deg, var(--color-accent), var(--color-accent-light), var(--color-accent));
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: accentShimmer 4s var(--ease-smooth) infinite;
        }

        @keyframes accentShimmer {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes revealUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        .hero-subtitle {
          font-size: var(--text-lg);
          color: var(--color-text-muted);
          margin-bottom: var(--space-8);
          animation: revealUp var(--duration-hero) var(--ease-out-expo) 0.35s both;
        }

        /* Search Bar — slide up with glow */
        .hero-search {
          padding: var(--space-2);
          border-radius: var(--radius-main);
          max-width: 560px;
          animation: revealUp var(--duration-hero) var(--ease-out-expo) 0.5s both;
          transition: box-shadow var(--duration-normal) var(--ease-smooth),
                      border-color var(--duration-normal) var(--ease-smooth),
                      transform var(--duration-normal) var(--ease-tactile);
        }

        .hero-search:focus-within {
          box-shadow: var(--glass-shadow), var(--shadow-glow-accent);
          border-color: var(--color-accent-muted);
          transform: translateY(-2px);
        }

        .hero-search-fields {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .hero-search-field {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          flex: 1;
          min-width: 0;
          transition: background var(--duration-fast) var(--ease-smooth);
          border-radius: var(--radius-subtle);
        }

        .hero-search-field:focus-within {
          background: var(--color-accent-subtle);
        }

        .hero-search-select {
          border: none;
          background: transparent;
          font-size: var(--text-sm);
          color: var(--color-text-main);
          font-family: var(--font-display);
          cursor: pointer;
          flex: 1;
          min-width: 0;
        }

        .hero-search-select:focus {
          outline: none;
        }

        .hero-search-divider {
          width: 1px;
          height: 28px;
          background: var(--color-border-strong);
          flex-shrink: 0;
          transition: opacity var(--duration-fast) var(--ease-smooth);
        }

        .hero-search:focus-within .hero-search-divider {
          opacity: 0.5;
        }

        .hero-search-btn {
          flex-shrink: 0;
          border-radius: var(--radius-subtle) !important;
        }

        @media (max-width: 440px) {
          .hero-search-fields {
            flex-wrap: wrap;
          }
          .hero-search-divider {
            display: none;
          }
          .hero-search-field {
            flex-basis: 100%;
          }
          .hero-search-btn {
            width: 100%;
          }
        }

        /* ============================================
           FEATURED SECTION
           ============================================ */
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: var(--space-8);
          gap: var(--space-4);
        }

        @media (max-width: 440px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .featured-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-5);
        }

        @media (max-width: 1024px) {
          .featured-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 440px) {
          .featured-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ============================================
           BENTO STATS — Interactive cards
           ============================================ */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--space-4);
        }

        @media (max-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 440px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .bento-card {
          padding: var(--space-6);
          border-radius: var(--radius-main);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          transition: all var(--duration-spring) var(--ease-tactile);
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, var(--color-accent-subtle), transparent 70%);
          opacity: 0;
          transition: opacity var(--duration-normal) var(--ease-smooth);
          pointer-events: none;
        }

        .bento-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-accent-muted);
        }

        .bento-card:hover::before {
          opacity: 1;
        }

        .bento-card.bento-accent {
          background: var(--color-accent);
          border-color: transparent;
          color: #ffffff;
        }

        .bento-card.bento-accent::before {
          background: radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.15), transparent 70%);
        }

        .bento-card.bento-accent:hover {
          box-shadow: 0 12px 40px rgba(14, 165, 233, 0.3);
        }

        .bento-card.bento-accent .bento-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .bento-icon-wrap {
          margin-bottom: var(--space-2);
          transition: transform var(--duration-spring) var(--ease-bounce);
        }

        .bento-card:hover .bento-icon-wrap {
          transform: scale(1.15) rotate(-5deg);
        }

        .bento-stat {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          transition: transform var(--duration-spring) var(--ease-bounce);
        }

        .bento-card:hover .bento-stat {
          transform: scale(1.05);
        }

        .bento-label {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
