import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ImageCarousel from '../components/ImageCarousel';
import PropertyMap from '../components/PropertyMap';
import { AMENITY_MAP } from '../data/mockProperties';
import {
  MapPin,
  ArrowsOutSimple,
  SealCheck,
  Phone,
  ChatCircleText,
  ArrowLeft,
  Lightning,
  Drop,
  Wrench,
  Fan,
  Sun,
  Snowflake,
  TShirt,
  Fingerprint,
  Clock,
  WifiHigh,
  Car,
  CookingPot,
  ShieldCheck,
  CalendarBlank,
} from '@phosphor-icons/react';

const ICON_MAP = {
  Fan, Sun, Snowflake, TShirt, Fingerprint, Clock, WifiHigh, Car, CookingPot, ShieldCheck,
};

export default function PropertyDetail() {
  const { id } = useParams();
  const { getPropertyById, addViewToHistory, formatPrice, calculatePropertyRating } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  const property = getPropertyById(id);

  useEffect(() => {
    if (property?.id) {
      addViewToHistory(property.id);
    }
  }, [property?.id, addViewToHistory]);

  if (isLoading) {
    return (
      <div className="detail-page container" style={{ padding: 'var(--space-6) 0 var(--space-16)' }}>
        <div className="skeleton" style={{ width: '80px', height: '36px', marginBottom: 'var(--space-4)' }} />
        <div className="detail-layout animate-fade-in">
          <div className="detail-main">
            {/* Carousel Skeleton */}
            <div className="skeleton" style={{ width: '100%', height: '380px', borderRadius: 'var(--radius-main)' }} />
            
            {/* Header Skeleton */}
            <div className="detail-header" style={{ padding: 'var(--space-4) 0' }}>
              <div className="skeleton" style={{ width: '120px', height: '24px', borderRadius: 'var(--radius-xs)' }} />
              <div className="skeleton" style={{ width: '80%', height: '36px', margin: '12px 0 8px' }} />
              <div className="skeleton" style={{ width: '40%', height: '20px' }} />
              <div className="skeleton" style={{ width: '100%', height: '60px', marginTop: '16px', borderRadius: 'var(--radius-main)' }} />
            </div>

            {/* Description Skeleton */}
            <div className="detail-section">
              <div className="skeleton" style={{ width: '100px', height: '24px' }} />
              <div className="skeleton" style={{ width: '100%', height: '80px' }} />
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="contact-card card-elevated" style={{ padding: 'var(--space-6)' }}>
              <div className="contact-owner" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '120px', height: '18px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ width: '60px', height: '12px' }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: '56px', margin: '20px 0 12px' }} />
              <div className="skeleton" style={{ width: '100%', height: '44px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '100%', height: '44px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <h2>Không tìm thấy phòng trọ</h2>
        <Link to="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
          Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  const rating = calculatePropertyRating(property);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `${diffWeeks} tuần trước`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} tháng trước`;
    return `${Math.floor(diffMonths / 12)} năm trước`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < score ? '#eab308' : 'var(--color-text-subtle)',
          fontSize: '18px',
          marginRight: '2px',
        }}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="detail-page" id="detail-page">
      <div className="container">
        {/* Back Link */}
        <Link to="/search" className="detail-back btn btn-ghost">
          <ArrowLeft size={18} />
          Quay lại
        </Link>

        <div className="detail-layout">
          {/* Left Column - Main Content */}
          <div className="detail-main">
            {/* Carousel */}
            <ImageCarousel images={property.images} title={property.title} />

            {/* Title & Info */}
            <div className="detail-header">
              <div className="detail-header-top">
                {property.verified && (
                  <span className="verified-badge">
                    <SealCheck size={14} weight="fill" />
                    Nhà thật, Giá thật, Vị trí thật
                  </span>
                )}
                <span className={`badge ${property.postType === 'find_roommate' ? 'badge-roommate' : 'badge-status'}`}>
                  {property.postType === 'find_roommate' ? 'Khách thuê' : 'Cho thuê'}
                </span>
                <span className="badge badge-status">{property.type}</span>
              </div>

              <h1 className="detail-title">{property.title}</h1>

              <div className="detail-location">
                <MapPin size={16} weight="fill" color="var(--color-accent)" />
                <span>{property.address}</span>
              </div>

              {property.createdAt && (
                <div className="detail-posted-date">
                  <CalendarBlank size={15} weight="regular" />
                  <span>Đăng {formatTimeAgo(property.createdAt)}</span>
                  <span className="detail-posted-date-exact">({formatDate(property.createdAt)})</span>
                </div>
              )}

              {/* Completeness Rating score */}
              <div className="detail-rating-box glass">
                <div className="detail-rating-stars">{renderStars(rating)}</div>
                <div className="detail-rating-info">
                  <span className="detail-rating-score text-mono">{rating}/5 sao</span>
                  <p className="detail-rating-desc">
                    Điểm số dựa trên mức độ hoàn thiện thông tin: có giá thuê rõ ràng, chi tiết tiền điện nước, hình ảnh thực tế sinh động, có nhiều tiện ích phong phú, và nhãn xác minh thực tế.
                  </p>
                </div>
              </div>

              <div className="detail-quick-stats">
                <div className="detail-stat">
                  <ArrowsOutSimple size={18} />
                  <span className="text-mono">{property.area} m&sup2;</span>
                </div>
                <div className="detail-stat">
                  <MapPin size={18} />
                  <span>{property.district}, {property.city}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="detail-section">
                <h3 className="detail-section-title">Mô tả</h3>
                <p className="detail-description">{property.description}</p>
              </div>
            )}

            {/* Price & Costs */}
            <div className="detail-section">
              <h3 className="detail-section-title">Chi phí hàng tháng</h3>
              <div className="cost-grid">
                <div className="cost-card cost-main">
                  <span className="cost-label">Tiền phòng</span>
                  <span className="cost-value price price-large">{formatPrice(property.price)}</span>
                </div>
                <div className="cost-card animate-fade-in-up stagger-1">
                  <Lightning size={20} color="var(--color-warning)" />
                  <span className="cost-label">Điện</span>
                  <span className="cost-value price">{property.electricity.toLocaleString()} VND/kwh</span>
                </div>
                <div className="cost-card animate-fade-in-up stagger-2">
                  <Drop size={20} color="var(--color-info)" />
                  <span className="cost-label">Nước</span>
                  <span className="cost-value price">{property.water.toLocaleString()} VND/người</span>
                </div>
                <div className="cost-card animate-fade-in-up stagger-3">
                  <Wrench size={20} color="var(--color-text-muted)" />
                  <span className="cost-label">Dịch vụ</span>
                  <span className="cost-value price">{property.service.toLocaleString()} VND/phòng</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="detail-section">
              <h3 className="detail-section-title">Tiện ích</h3>
              <div className="amenities-grid">
                {property.amenities.map((amenityKey) => {
                  const info = AMENITY_MAP[amenityKey];
                  if (!info) return null;
                  const IconComp = ICON_MAP[info.icon];
                  return (
                    <div key={amenityKey} className="amenity-tag">
                      {IconComp && <IconComp size={18} />}
                      <span>{info.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map */}
            <div className="detail-section">
              <h3 className="detail-section-title">Vị trí trên bản đồ</h3>
              <PropertyMap
                lat={property.coords[0]}
                lng={property.coords[1]}
                address={property.address}
                title={property.title}
              />
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="detail-sidebar">
            <div className="contact-card card-elevated" id="contact-card">
              {/* Owner Info */}
              <div className="contact-owner">
                <img
                  src={property.owner.avatar}
                  alt={property.owner.name}
                  className="contact-avatar"
                />
                <div>
                  <h4 className="contact-name">{property.owner.name}</h4>
                  <p className="text-caption">
                    {property.postType === 'find_roommate' ? 'Khách thuê' : 'Chủ trọ'}
                  </p>
                </div>
              </div>



              {/* Actions */}
              <div className="contact-actions">
                <a
                  href={`tel:${property.owner.phone}`}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  id="call-btn"
                >
                  <Phone size={20} />
                  Gọi {property.owner.phone}
                </a>
                <a
                  href={`https://zalo.me/${property.owner.zalo || property.owner.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg"
                  style={{ width: '100%' }}
                  id="zalo-btn"
                >
                  <ChatCircleText size={20} />
                  Nhắn Zalo
                </a>
              </div>

              {/* Schedule Form */}
              <div className="contact-form">
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                  Hẹn lịch xem phòng
                </h4>
                <input className="input" placeholder="Họ và tên" style={{ marginBottom: 'var(--space-2)' }} />
                <input className="input" placeholder="Số điện thoại" style={{ marginBottom: 'var(--space-2)' }} />
                <textarea
                  className="input"
                  placeholder="Ghi chú (thời gian muốn xem...)"
                  rows={3}
                  style={{ marginBottom: 'var(--space-3)', resize: 'vertical' }}
                />
                <button className="btn btn-primary" style={{ width: '100%' }} id="schedule-btn">
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .detail-page {
          padding: var(--space-6) 0 var(--space-16);
        }

        .detail-back {
          margin-bottom: var(--space-4);
        }

        .detail-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: var(--space-8);
          align-items: flex-start;
        }

        @media (max-width: 1024px) {
          .detail-layout {
            grid-template-columns: 1fr;
          }
        }

        .detail-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .detail-header {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .detail-header-top {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          align-items: center;
        }

        .badge-roommate {
          background: rgba(2, 132, 199, 0.12);
          color: #0284c7;
        }

        .detail-title {
          font-size: var(--text-2xl);
          font-weight: var(--weight-bold);
        }

        .detail-location {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        .detail-posted-date {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        .detail-posted-date-exact {
          font-size: var(--text-xs);
          color: var(--color-text-subtle);
        }

        /* Detail Rating Box */
        .detail-rating-box {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-4);
          border-radius: var(--radius-main);
          background: var(--bg-secondary);
        }

        @media (max-width: 600px) {
          .detail-rating-box {
            flex-direction: column;
            gap: var(--space-2);
          }
        }

        .detail-rating-stars {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .detail-rating-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-rating-score {
          font-size: var(--text-sm);
          font-weight: var(--weight-bold);
          color: var(--color-text-main);
        }

        .detail-rating-desc {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          line-height: 1.6;
        }

        .detail-quick-stats {
          display: flex;
          gap: var(--space-6);
          margin-top: var(--space-2);
        }

        .detail-stat {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--color-text-muted);
        }

        .detail-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .detail-section-title {
          font-size: var(--text-lg);
          font-weight: var(--weight-semibold);
        }

        .detail-description {
          font-size: var(--text-base);
          color: var(--color-text-muted);
          line-height: 1.8;
        }

        /* Cost Grid */
        .cost-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
        }

        @media (max-width: 440px) {
          .cost-grid {
            grid-template-columns: 1fr;
          }
        }

        .cost-card {
          padding: var(--space-4);
          background: var(--bg-secondary);
          border-radius: var(--radius-subtle);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .cost-card.cost-main {
          grid-column: span 2;
          background: var(--color-accent-subtle);
        }

        @media (max-width: 440px) {
          .cost-card.cost-main {
            grid-column: span 1;
          }
        }

        .cost-label {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          font-weight: var(--weight-medium);
        }

        .cost-value {
          font-size: var(--text-sm);
          font-weight: var(--weight-semibold);
        }

        /* Amenities */
        .amenities-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .amenity-tag {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--bg-secondary);
          border-radius: var(--radius-pill);
          font-size: var(--text-sm);
          color: var(--color-text-main);
        }

        /* Sidebar */
        .detail-sidebar {
          position: sticky;
          top: calc(var(--header-height) + var(--space-4));
        }

        @media (max-width: 768px) {
          .detail-quick-stats {
            flex-wrap: wrap;
            gap: var(--space-3);
          }

          .detail-title {
            font-size: var(--text-xl);
          }
        }

        .contact-card {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .contact-owner {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .contact-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .contact-name {
          font-size: var(--text-base);
          font-weight: var(--weight-semibold);
        }



        .contact-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .contact-form {
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-divider);
        }
      `}</style>
    </div>
  );
}
