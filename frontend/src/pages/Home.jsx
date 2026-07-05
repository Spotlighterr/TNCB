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
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { CITIES, DISTRICTS } from '../data/mockProperties';

export default function Home() {
  const { properties, heroSlides } = useApp();
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [
    {
      id: 'default-1',
      image: '/club_team_photo.png',
      tag: 'Cộng đồng FindX',
      title: 'Đội ngũ Core Team FindX',
      description: 'Nơi kết nối và mang đến những giải pháp phòng trọ tối ưu cho sinh viên FTU.',
      badgeText: 'CLB Hỗ trợ sinh viên',
      link: 'https://www.facebook.com/FTU.HousingBank',
    },
    {
      id: 'default-2',
      image: '/university_activities.png',
      tag: 'Hoạt động nổi bật',
      title: 'Hành trình cùng Tân sinh viên',
      description: 'Chương trình đồng hành hỗ trợ tìm kiếm nhà trọ an toàn, giá tốt đầu khóa học.',
      badgeText: 'Sự kiện 2026',
      link: 'https://www.facebook.com/FTU.HousingBank',
    },
    {
      id: 'default-3',
      image: '/student_room_hero.png',
      tag: 'Phòng trọ kiểu mẫu',
      title: 'Không gian sống thông minh',
      description: 'Gợi ý các căn hộ studio đẹp mắt, gần trường đại học tại Hà Nội & TP.HCM.',
      badgeText: 'Xác thực 100%',
      link: '/search',
    }
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

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

  const splitTitle = (title) => {
    if (!title) return { main: '', accent: '' };
    if (title.endsWith('FindX')) {
      return { main: title.substring(0, title.length - 5).trim(), accent: 'FindX' };
    }
    if (title.endsWith('Tân sinh viên')) {
      return { main: title.substring(0, title.length - 13).trim(), accent: 'Tân sinh viên' };
    }
    const words = title.split(' ');
    if (words.length <= 2) {
      return { main: words[0] || '', accent: words[1] || '' };
    }
    const main = words.slice(0, words.length - 2).join(' ');
    const accent = words.slice(words.length - 2).join(' ');
    return { main, accent };
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchDistrict) params.set('district', searchDistrict);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home-page" id="home-page">
      {/* ==================== APPLE-STYLE HERO STACK ==================== */}
      
      {/* Hero 1: Search Banner (Featured Hero) */}
      <section className="section-hero theme-light" id="hero-search-banner">
        <div className="tile-wrapper">
          <div className="tile-content animate-fade-in-up">
            <div className="tile-copy-wrapper">
              <span className="tile-eyebrow text-eyebrow">FTU Housing Bank</span>
              <div className="apple-logo-text" style={{ fontSize: 'clamp(2.5rem, 6.5vw, 4.5rem)' }}>
                <span className="logo-metallic">Tìm phòng trọ</span>
                <span className="logo-glowing">dễ dàng</span>
              </div>
              <p className="tile-subhead">
                Phòng thật, giá thật, vị trí thật tại Hà Nội & TP.HCM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== APPLE-STYLE PROMO GRID ==================== */}
      <section className="section-promo" id="promos-section">
        <div className="promo-container">
          
          {/* Promo Card 1: Bento Stats (iOS Widget Style) */}
          <div className="promo-tile theme-light-gray" id="promo-stats">
            <div className="promo-tile-content">
              <div className="promo-tile-copy">
                <h3 className="promo-headline">Hệ sinh thái số</h3>
                <p className="promo-subhead">Kết nối sinh viên với hàng ngàn phòng trọ chất lượng.</p>
              </div>

              {/* Search Bar - Nested inside Bento Stats card */}
              <form className="hero-search glass animate-scale-in" onSubmit={handleSearch} id="hero-search" style={{ width: '100%', maxWidth: '100%', margin: '0', background: '#ffffff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
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
              
              <div className="bento-grid">
                <div className="bento-card bento-accent animate-fade-in-up stagger-1">
                  <div className="bento-icon-wrap">
                    <Buildings size={28} weight="duotone" />
                  </div>
                  <div className="bento-stat text-mono">{availableCount}+</div>
                  <div className="bento-label">Phòng đang trống</div>
                </div>

                <div className="bento-card animate-fade-in-up stagger-2">
                  <div className="bento-icon-wrap">
                    <MapPin size={28} weight="duotone" color="var(--color-accent)" />
                  </div>
                  <div className="bento-stat text-mono">{districtCount}</div>
                  <div className="bento-label">Quận hỗ trợ</div>
                </div>

                <div className="bento-card bento-accent animate-fade-in-up stagger-3">
                  <div className="bento-icon-wrap">
                    <GraduationCap size={28} weight="duotone" />
                  </div>
                  <div className="bento-stat text-mono">10+</div>
                  <div className="bento-label">Trường lân cận</div>
                </div>

                <div className="bento-card animate-fade-in-up stagger-4">
                  <div className="bento-icon-wrap">
                    <Star size={28} weight="fill" color="var(--color-warning)" />
                  </div>
                  <div className="bento-stat text-mono">4.8/5</div>
                  <div className="bento-label">Đánh giá</div>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Card 2: Featured Listings Grid */}
          <div className="promo-tile theme-white" id="promo-listings">
            <div className="promo-tile-content">
              <div className="promo-tile-copy-header">
                <div>
                  <h3 className="promo-headline">Phòng trọ nổi bật</h3>
                  <p className="promo-subhead">Đã được đội ngũ FindX Review xác thực.</p>
                </div>
                <button
                  className="btn-link tile-cta-link"
                  onClick={() => navigate('/search')}
                  id="view-all-btn"
                >
                  Xem tất cả <ArrowRight size={14} />
                </button>
              </div>

              <div className="featured-grid">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="skeleton-card card animate-fade-in" style={{ minHeight: '260px' }}>
                      <div className="skeleton-image skeleton" style={{ height: '140px' }} />
                      <div className="skeleton-content">
                        <div className="skeleton-line skeleton-title skeleton" style={{ width: '80%' }} />
                        <div className="skeleton-line skeleton-text-short skeleton" style={{ width: '40%' }} />
                      </div>
                    </div>
                  ))
                ) : (
                  featuredProperties.slice(0, 2).map((prop, idx) => (
                    <PropertyCard key={prop.id} property={prop} index={idx} />
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== APPLE-STYLE HERO SLIDER ==================== */}
      <section className="section-hero theme-dark hero-carousel-section" id="hero-carousel">
        <div className="tile-wrapper">
          {slides.length > 1 && (
            <>
              {/* Left Arrow */}
              <button type="button" className="carousel-arrow arrow-left" onClick={prevSlide} aria-label="Previous Slide">
                <CaretLeft size={28} weight="bold" />
              </button>
              
              {/* Right Arrow */}
              <button type="button" className="carousel-arrow arrow-right" onClick={nextSlide} aria-label="Next Slide">
                <CaretRight size={28} weight="bold" />
              </button>
            </>
          )}

          {slides.length > 0 && (
            <div className="tile-content animate-fade-in-up">
              {slides.map((slide, index) => {
                if (index !== activeSlide) return null;
                const { main, accent } = splitTitle(slide.title);
                return (
                  <div key={slide.id || index} className="carousel-slide-active-content animate-fade-in-up">
                    <div className="tile-copy-wrapper" style={{ marginInline: 'auto' }}>
                      <span className="tile-eyebrow text-eyebrow">{slide.tag}</span>
                      <div className="apple-logo-text">
                        <span className="logo-metallic">{main}</span>
                        <span className="logo-glowing">{accent}</span>
                      </div>
                      <p className="tile-subhead" style={{ maxWidth: '680px', marginInline: 'auto' }}>
                        {slide.description}
                      </p>
                      <p className="tile-subhead-sm" style={{ color: '#86868b', fontSize: '14px', marginTop: '-10px', marginBottom: '20px' }}>
                        {slide.badgeText}
                      </p>
                      <div className="tile-ctas" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a 
                          href={slide.link} 
                          target={slide.link.startsWith('http') ? '_blank' : '_self'} 
                          rel="noopener noreferrer" 
                          className="btn-pill-primary"
                        >
                          Tìm hiểu thêm
                        </a>
                        {slide.tag.includes('Cộng đồng') && (
                          <a href="https://www.facebook.com/FTU.HousingBank" target="_blank" rel="noopener noreferrer" className="btn-pill-secondary">
                            Tham gia cộng đồng
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="tile-image-wrapper">
                      <img src={slide.image} alt={slide.title} className="tile-image" />
                    </div>
                  </div>
                );
              })}

              {/* Dot Indicators */}
              <div className="carousel-dots-wrapper">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`carousel-dot-indicator ${index === activeSlide ? 'active' : ''}`}
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        /* ============================================
           APPLE-STYLE HERO STACK & TILE STYLING
           ============================================ */
        .section-hero {
          position: relative;
          width: 100%;
          min-height: 680px;
          height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-bottom: 8px solid var(--bg-primary);
        }

        @media (min-width: 992px) {
          .section-hero {
            min-height: 80vh;
          }
        }

        .tile-wrapper {
          position: relative;
          width: 100%;
          max-width: 1400px;
          height: 100%;
          margin: 0 auto;
          padding: var(--space-16) var(--content-padding);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 1;
        }

        /* Full click overlay */
        .tile-link {
          position: absolute;
          inset: 0;
          z-index: 5;
          cursor: pointer;
        }

        .tile-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-8);
          z-index: 2;
        }

        .tile-copy-wrapper {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tile-eyebrow {
          margin-bottom: var(--space-3);
        }

        .tile-headline {
          font-size: clamp(2rem, 5.5vw, 3.8rem);
          font-weight: var(--weight-bold);
          line-height: 1.1;
          letter-spacing: -0.025em;
          color: var(--color-text-main);
          margin-bottom: var(--space-4);
        }

        .tile-subhead {
          font-size: clamp(1.1rem, 2vw, 1.45rem);
          font-weight: var(--weight-regular);
          color: var(--color-text-muted);
          line-height: 1.4;
          margin-bottom: var(--space-5);
          max-width: 600px;
        }

        .tile-ctas {
          display: flex;
          gap: var(--space-6);
          justify-content: center;
          z-index: 6; /* Clickable above tile-link */
          position: relative;
        }

        .tile-cta-link {
          font-size: var(--text-base);
          font-weight: var(--weight-semibold);
          color: var(--color-accent);
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          transition: transform var(--duration-fast) var(--ease-tactile), color var(--duration-fast) var(--ease-smooth);
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
        }

        .tile-cta-link:hover {
          color: var(--color-accent-light);
          transform: translateX(3px);
          text-decoration: underline;
        }

        .tile-cta-link svg {
          transition: transform var(--duration-fast) var(--ease-tactile);
        }

        .tile-cta-link:hover svg {
          transform: translateX(2px);
        }

        /* Image Display */
        .tile-image-wrapper {
          width: 100%;
          max-width: 800px;
          height: clamp(240px, 45vw, 400px); /* Fixed height container */
          margin: var(--space-4) auto 0;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          background: #111111;
        }

        .tile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--duration-slow) var(--ease-tactile);
        }

        .section-hero:hover .tile-image {
          transform: scale(1.015);
        }

        /* Theme Variants */
        .theme-light {
          background: #ffffff; /* Solid white background */
        }

        .theme-dark {
          background: #000000;
          color: #ffffff;
          border-bottom-color: #111;
        }

        .theme-dark .tile-headline {
          color: #ffffff;
        }

        .theme-dark .tile-subhead {
          color: #86868b;
          min-height: 56px; /* Holds 2 lines of text stable */
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-5);
        }

        .theme-dark .tile-image {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .theme-dark::before {
          content: '';
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(50% 50% at 50% 50%, rgba(173, 23, 28, 0.15) 0%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        /* Apple Logo & Metallic/Glow Text Effect */
        .apple-logo-text {
          font-size: clamp(2.4rem, 6vw, 4rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.15;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-3);
          text-align: center;
        }

        .logo-metallic {
          background: linear-gradient(180deg, #ffffff 30%, #86868b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          padding-block: 0.05em;
        }

        .logo-glowing {
          position: relative;
          color: #ffffff;
          margin-left: 0;
          margin-top: 4px;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8),
                       0 0 20px rgba(255, 215, 0, 0.6),
                       0 0 35px rgba(255, 105, 180, 0.5);
          background: linear-gradient(135deg, #ffffff 40%, #ffdf79 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          padding-block: 0.05em;
        }

        .theme-light .apple-logo-text .logo-metallic {
          background: linear-gradient(180deg, #1d1d1f 30%, #434345 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .theme-light .apple-logo-text .logo-glowing {
          background: linear-gradient(135deg, #ad171c 0%, #ff5a5f 50%, #ff7b00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: none;
        }

        .theme-light .apple-logo-text .logo-glowing::after {
          display: none;
        }

        @media (max-width: 580px) {
          .apple-logo-text {
            font-size: clamp(1.8rem, 8vw, 2.2rem);
            line-height: 1.1;
          }
          .logo-glowing {
            margin-top: 2px;
          }
        }

        .logo-glowing::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 215, 0, 0.4) 30%, rgba(0, 113, 227, 0.35) 60%, transparent 100%);
          filter: blur(20px);
          z-index: -1;
          pointer-events: none;
          animation: pulseGlow 4s ease-in-out infinite alternate;
        }

        @keyframes pulseGlow {
          0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.75; }
          100% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
        }

        /* Pill Buttons matching the Siri AI prompt image */
        .btn-pill-primary {
          background: #0071e3;
          color: #ffffff !important;
          border: none;
          padding: 12px 26px;
          border-radius: 980px;
          font-size: 17px;
          font-weight: var(--weight-regular);
          transition: all var(--duration-fast) var(--ease-tactile);
          cursor: pointer;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-pill-primary:hover {
          background: #147ff3;
          transform: scale(1.02);
        }

        .btn-pill-secondary {
          background: transparent;
          color: #2997ff !important;
          border: 1px solid #0071e3;
          padding: 12px 26px;
          border-radius: 980px;
          font-size: 17px;
          font-weight: var(--weight-regular);
          transition: all var(--duration-fast) var(--ease-tactile);
          cursor: pointer;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-pill-secondary:hover {
          background: rgba(41, 151, 255, 0.08);
          border-color: #2997ff;
          transform: scale(1.02);
        }

        /* Hero Carousel Slider specific styles */
        .hero-carousel-section {
          position: relative;
          height: calc(100vh - var(--header-height));
          min-height: 580px;
          max-height: 800px;
          overflow: hidden;
          border-bottom: 8px solid var(--bg-primary);
        }

        .hero-carousel-section .tile-wrapper {
          height: 100%;
          padding: var(--space-6) var(--content-padding) 0;
          justify-content: center;
        }

        .hero-carousel-section .tile-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0;
        }

        .carousel-slide-active-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
        }

        .hero-carousel-section .tile-copy-wrapper {
          flex-shrink: 0;
          padding-top: 0;
        }

        .hero-carousel-section .tile-image-wrapper {
          margin-top: 0;
          height: clamp(160px, 32vh, 320px);
          aspect-ratio: 1.6 / 1;
          width: auto;
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          overflow: hidden;
          background: #111111;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-carousel-section .tile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 768px) {
          .hero-carousel-section {
            height: calc(85vh - var(--header-height));
            min-height: 520px;
          }
          .hero-carousel-section .tile-wrapper {
            padding-top: var(--space-6);
          }
          .hero-carousel-section .tile-image-wrapper {
            height: clamp(140px, 25vh, 200px);
            aspect-ratio: 1.6 / 1;
            width: auto;
            border-radius: var(--radius-lg);
            margin-bottom: var(--space-12);
          }
        }

        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-smooth), color var(--duration-fast) var(--ease-smooth), opacity var(--duration-fast) var(--ease-smooth);
          z-index: 10;
          opacity: 0.5;
        }

        .carousel-arrow:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          opacity: 1;
        }

        .arrow-left {
          left: var(--space-4);
        }

        .arrow-right {
          right: var(--space-4);
        }

        @media (max-width: 768px) {
          .carousel-arrow {
            width: 40px;
            height: 40px;
            top: auto;
            bottom: var(--space-4);
            transform: none;
          }
          .arrow-left {
            left: 20%;
          }
          .arrow-right {
            right: 20%;
          }
        }

        /* Dot Indicators */
        .carousel-dots-wrapper {
          position: absolute;
          bottom: var(--space-4);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: var(--space-3);
          justify-content: center;
          z-index: 10;
          margin-top: 0;
        }

        .carousel-dot-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-smooth), transform var(--duration-fast) var(--ease-tactile);
        }

        .carousel-dot-indicator:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .carousel-dot-indicator.active {
          background: #ffffff;
          transform: scale(1.2);
        }

        /* Hero 1 search bar overrides */
        #hero-search-banner {
          min-height: 280px;
          border-bottom: none;
        }
        @media (min-width: 992px) {
          #hero-search-banner {
            min-height: 35vh;
          }
        }
        #hero-search-banner .tile-content {
          gap: var(--space-6);
        }

        .hero-search {
          padding: var(--space-2);
          border-radius: var(--radius-main);
          width: 100%;
          max-width: 580px;
          z-index: 6; /* Clickable */
          position: relative;
          margin-top: var(--space-2);
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

        @media (max-width: 580px) {
          .hero-search-fields {
            flex-direction: column;
            width: 100%;
            gap: var(--space-2);
          }
          .hero-search-divider {
            display: none;
          }
          .hero-search-field {
            width: 100%;
            background: rgba(15, 23, 42, 0.03);
          }
          .hero-search-btn {
            width: 100%;
          }
        }

        /* ============================================
           APPLE PROMO GRID (2 columns)
           ============================================ */
        .section-promo {
          width: 100%;
          padding: var(--space-8) var(--content-padding);
          background: var(--bg-primary);
        }

        .promo-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }

        @media (min-width: 992px) {
          .promo-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .promo-tile {
          border-radius: var(--radius-lg);
          padding: var(--space-10) var(--space-8);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--color-border);
          min-height: 480px;
          position: relative;
        }

        .theme-light-gray {
          background: #f5f5f7;
        }

        .promo-tile-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: var(--space-8);
        }

        .promo-tile-copy {
          max-width: 480px;
        }

        .promo-tile-copy-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          width: 100%;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--space-3);
        }

        .promo-headline {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
          color: var(--color-text-main);
          letter-spacing: -0.015em;
          margin-bottom: var(--space-1);
        }

        .promo-subhead {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        /* Bento Grid overrides in Promo */
        .promo-tile .bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-5);
          margin-top: auto;
        }

        .promo-tile .bento-card {
          padding: var(--space-6) var(--space-5);
          background: #ffffff;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          min-height: 145px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform var(--duration-fast) var(--ease-tactile), box-shadow var(--duration-fast) var(--ease-smooth);
        }

        .promo-tile .bento-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .promo-tile .bento-card.bento-accent {
          background: var(--color-accent);
          color: #ffffff;
        }

        .promo-tile .bento-icon-wrap {
          margin-bottom: var(--space-2);
          display: inline-flex;
        }

        .promo-tile .bento-stat {
          font-size: 2.2rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: var(--space-1);
        }

        .promo-tile .bento-label {
          font-size: 1.05rem;
          font-weight: 500;
          opacity: 0.9;
        }

        /* Featured Grid overrides in Promo */
        .promo-tile .featured-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          margin-top: var(--space-2);
        }

        @media (min-width: 580px) {
          .promo-tile .featured-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

