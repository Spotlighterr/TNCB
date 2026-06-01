import { useState } from 'react';
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

  const featuredProperties = properties
    .filter((p) => p.verified && !p.isRented)
    .slice(0, 4);

  const availableCount = properties.filter((p) => !p.isRented).length;
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
            {featuredProperties.map((prop, idx) => (
              <PropertyCard key={prop.id} property={prop} index={idx} />
            ))}
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
        /* Hero */
        .hero {
          min-height: calc(100dvh - var(--header-height));
          display: flex;
          align-items: center;
          background: var(--bg-primary);
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .hero-inner {
          position: relative;
          z-index: 1;
          padding: var(--space-16) 0;
        }

        .hero-content {
          max-width: 640px;
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: var(--weight-extrabold);
          letter-spacing: -0.03em;
          line-height: 1.08;
          margin: var(--space-4) 0 var(--space-5);
        }

        .hero-title-accent {
          color: var(--color-accent);
        }

        .hero-subtitle {
          font-size: var(--text-lg);
          color: var(--color-text-muted);
          margin-bottom: var(--space-8);
        }

        .hero-search {
          padding: var(--space-2);
          border-radius: var(--radius-main);
          max-width: 560px;
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

        /* Section Header */
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

        /* Featured Grid */
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

        /* Bento Stats Grid */
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
        }

        .bento-card.bento-accent {
          background: var(--color-accent);
          border-color: transparent;
          color: #ffffff;
        }

        .bento-card.bento-accent .bento-label {
          color: rgba(255, 255, 255, 0.8);
        }

        .bento-icon-wrap {
          margin-bottom: var(--space-2);
        }

        .bento-stat {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
        }

        .bento-label {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
