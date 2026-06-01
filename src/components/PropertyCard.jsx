import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Heart,
  MapPin,
  SealCheck,
  ArrowsOutSimple,
} from '@phosphor-icons/react';

export default function PropertyCard({ property, index = 0 }) {
  const { toggleSaveProperty, isPropertySaved, formatPriceShort, calculatePropertyRating } = useApp();
  const saved = isPropertySaved(property.id);

  const rating = calculatePropertyRating(property);

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

        {/* Badges */}
        <div className="property-card-badges">
          {property.verified && (
            <span className="verified-badge" id={`verified-${property.id}`}>
              <SealCheck size={12} weight="fill" />
              Xác thực
            </span>
          )}
          <span className={`post-type-badge ${property.postType === 'find_roommate' ? 'roommate' : 'rent'}`}>
            {property.postType === 'find_roommate' ? 'Khách thuê' : 'Cho thuê'}
          </span>
        </div>

        {/* Save Button */}
        <button
          className={`property-card-save ${saved ? 'saved' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleSaveProperty(property.id);
          }}
          aria-label={saved ? 'Bỏ lưu' : 'Lưu yêu thích'}
          id={`save-${property.id}`}
        >
          <Heart size={20} weight={saved ? 'fill' : 'regular'} />
        </button>

        {/* Price Tag */}
        <div className="property-card-price-tag">
          <span className="text-mono">{formatPriceShort(property.price)}</span>
        </div>
      </div>

      {/* Content */}
      <Link to={`/property/${property.id}`} className="property-card-content">
        <h3 className="property-card-title">{property.title}</h3>

        <div className="property-card-location">
          <MapPin size={14} weight="fill" color="var(--color-accent)" />
          <span>{property.district}, {property.city}</span>
        </div>

        {/* Trust Rating Stars */}
        <div className="property-card-rating">
          <div className="stars-row">{renderStars(rating)}</div>
          <span className="rating-label text-mono">{rating}/5 sao tin cậy</span>
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
          <span className="price">{formatPriceShort(property.price)}/th</span>
          {property.isRented && (
            <span className="badge badge-rented">Đã thuê</span>
          )}
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
          transition: all var(--duration-spring) var(--ease-tactile);
          box-shadow: var(--shadow-sm);
        }

        .property-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
          border-color: var(--color-accent);
        }

        .property-card-image-wrap {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
        }

        .property-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--duration-slow) var(--ease-tactile);
        }

        .property-card:hover .property-card-image {
          transform: scale(1.06);
        }

        .property-card-badges {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          align-items: flex-start;
          z-index: 10;
        }

        .post-type-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: var(--weight-bold);
          border-radius: var(--radius-subtle);
          line-height: 1;
          box-shadow: var(--shadow-xs);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .post-type-badge.rent {
          background: var(--color-accent);
          color: #ffffff;
        }

        .post-type-badge.roommate {
          background: #0284c7;
          color: #ffffff;
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: rgba(52, 211, 153, 0.18);
          color: #059669;
          font-size: 11px;
          font-weight: var(--weight-bold);
          border-radius: var(--radius-subtle);
          border: 1px solid rgba(52, 211, 153, 0.3);
          backdrop-filter: blur(4px);
        }

        /* Dark mode verified badge */
        :root[data-theme="dark"] .verified-badge {
          color: #34d399;
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.25);
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
          transform: scale(1.1);
          color: var(--color-text-main);
        }

        .property-card-save.saved {
          color: #ef4444;
        }

        .property-card-save:active {
          transform: scale(0.9);
        }

        .property-card-price-tag {
          position: absolute;
          bottom: var(--space-3);
          left: var(--space-3);
          background: #131927;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: var(--radius-subtle);
          font-size: var(--text-sm);
          font-family: var(--font-mono);
          font-weight: var(--weight-bold);
          color: #34d399;
          box-shadow: 0 4px 12px rgba(11, 15, 25, 0.3);
          z-index: 10;
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
        }

        .property-card-location {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
          color: var(--color-text-muted);
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
          color: var(--color-accent);
        }
      `}</style>
    </div>
  );
}
