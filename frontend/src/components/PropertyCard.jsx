import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  SealCheck,
  ArrowsOutSimple,
  CalendarBlank,
} from '@phosphor-icons/react';

export default function PropertyCard({ property, index = 0 }) {
  const { formatPrice, calculatePropertyRating } = useApp();

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

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className="star-icon"
        style={{
          color: i < score ? '#eab308' : 'var(--color-text-subtle)',
          fontSize: '13px',
          marginRight: '1px',
        }}
      >
        ★
      </span>
    ));
  };

  return (
    <div
      className={`property-card card-hover animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      id={`property-card-${property.id}`}
    >
      {/* Image */}
      <div className="property-card-image-wrap">
        <Link to={`/property/${property.id}`}>
          <img
            src={property.images[0]}
            alt={property.title}
            className="property-card-image"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Content */}
      <Link to={`/property/${property.id}`} className="property-card-content">
        <h3 className="property-card-title">{property.title}</h3>

        <div className="property-card-location">
          <MapPin size={14} weight="fill" color="var(--color-accent)" />
          <span>{property.district}, {property.city}</span>
        </div>

        {property.createdAt && (
          <div className="property-card-date">
            <CalendarBlank size={13} weight="regular" color="var(--color-text-subtle)" />
            <span>{formatTimeAgo(property.createdAt)}</span>
          </div>
        )}

        {/* Trust Rating Stars */}
        <div className="property-card-rating">
          <div className="stars-row">{renderStars(rating)}</div>
          <span className="rating-label text-mono">{rating}/5 sao</span>
        </div>

        <div className="property-card-meta">
          <span className="property-card-meta-item">
            <ArrowsOutSimple size={14} />
            {property.area} m&sup2;
          </span>
          <span className="property-card-meta-item badge-status">
            {property.type}
          </span>
        </div>

        <div className="property-card-footer">
          <span className="price">{formatPrice(property.price)}</span>
          <div className="footer-badges-row" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            {property.verified && (
              <span className="verified-badge-inline" id={`verified-${property.id}`}>
                <SealCheck size={12} weight="fill" />
                Xác thực
              </span>
            )}
            {property.isRented && (
              <span className="badge badge-rented">Đã thuê</span>
            )}
          </div>
        </div>
      </Link>

      <style>{`
        .property-card {
          background: var(--color-surface);
          border-radius: var(--radius-main);
          border: 1px solid var(--color-border);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform var(--duration-spring) var(--ease-tactile),
                      box-shadow var(--duration-spring) var(--ease-tactile),
                      border-color var(--duration-normal) var(--ease-smooth);
          box-shadow: var(--shadow-sm);
          position: relative;
        }

        .property-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
          border-color: var(--color-accent-muted);
        }

        .property-card-image-wrap {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
        }

        /* Gradient overlay on hover */
        .property-card-image-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.15), transparent 40%);
          opacity: 0;
          transition: opacity var(--duration-normal) var(--ease-smooth);
          pointer-events: none;
          z-index: 1;
        }

        .property-card:hover .property-card-image-wrap::after {
          opacity: 1;
        }

        .property-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--duration-slow) var(--ease-out-expo);
        }

        .property-card:hover .property-card-image {
          transform: scale(1.08);
        }

        .verified-badge-inline {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          background: rgba(5, 150, 105, 0.08);
          color: var(--color-success);
          font-size: 11px;
          font-weight: var(--weight-bold);
          border-radius: var(--radius-subtle);
          border: 1px solid rgba(5, 150, 105, 0.15);
          line-height: 1;
          transition: all var(--duration-fast) var(--ease-tactile);
        }

        /* Dark mode verified badge */
        :root[data-theme="dark"] .verified-badge-inline {
          color: #34d399;
          background: rgba(52, 211, 153, 0.15);
          border-color: rgba(52, 211, 153, 0.25);
        }

        .property-card-save {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          color: var(--color-text-muted);
          transition: all var(--duration-fast) var(--ease-tactile);
          border: none;
          cursor: pointer;
          z-index: 10;
          box-shadow: var(--shadow-sm);
        }

        .property-card-save:hover {
          background: #ffffff;
          transform: scale(1.15);
          color: var(--color-text-main);
          box-shadow: var(--shadow-md);
        }

        .property-card-save.saved {
          color: #ef4444;
          background: rgba(255, 255, 255, 0.95);
          animation: heartPop var(--duration-spring) var(--ease-spring);
        }

        .property-card-save:active {
          transform: scale(0.85);
        }

        @keyframes heartPop {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }

        .property-card-content {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }

        .property-card-title {
          font-size: var(--text-sm);
          font-weight: var(--weight-bold);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: var(--color-text-main);
          min-height: 40px;
          transition: color var(--duration-fast) var(--ease-smooth);
        }

        .property-card:hover .property-card-title {
          color: var(--color-accent);
        }

        .property-card-location {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .property-card-date {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 11px;
          color: var(--color-text-subtle);
        }

        .property-card-rating {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: 2px;
        }

        .stars-row {
          display: flex;
          align-items: center;
        }

        .rating-label {
          font-size: 10px;
          color: var(--color-text-muted);
          font-weight: var(--weight-medium);
        }

        .property-card-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-top: auto;
          padding-top: var(--space-2);
        }

        .property-card-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: var(--text-xs);
          color: var(--color-text-muted);
        }

        .property-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-3);
          border-top: 1px solid var(--color-divider);
          margin-top: var(--space-2);
        }

        .property-card-footer .price {
          font-size: var(--text-base);
          font-family: var(--font-mono);
          font-weight: var(--weight-bold);
          color: var(--color-text-main);
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .property-card:hover .property-card-footer .price {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
