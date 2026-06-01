import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import { CITIES, DISTRICTS, ROOM_TYPES, AMENITY_MAP } from '../data/mockProperties';
import {
  Funnel,
  X,
  MagnifyingGlass,
} from '@phosphor-icons/react';

const PRICE_RANGES = [
  { label: 'Tất cả giá', min: 0, max: Infinity },
  { label: 'Dưới 3 triệu', min: 0, max: 3000000 },
  { label: '3 - 5 triệu', min: 3000000, max: 5000000 },
  { label: '5 - 7 triệu', min: 5000000, max: 7000000 },
  { label: 'Trên 7 triệu', min: 7000000, max: Infinity },
];

export default function Search() {
  const { properties } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [priceRange, setPriceRange] = useState(0);
  const [roomType, setRoomType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (city && p.city !== city) return false;
      if (district && p.district !== district) return false;
      if (roomType && p.type !== roomType) return false;

      const range = PRICE_RANGES[priceRange];
      if (p.price < range.min || p.price > range.max) return false;

      if (searchText) {
        const text = searchText.toLowerCase();
        const searchable = `${p.title} ${p.address} ${p.district} ${p.city}`.toLowerCase();
        if (!searchable.includes(text)) return false;
      }

      return true;
    });
  }, [properties, city, district, priceRange, roomType, searchText]);

  const clearFilters = () => {
    setCity('');
    setDistrict('');
    setPriceRange(0);
    setRoomType('');
    setSearchText('');
    setSearchParams({});
  };

  const hasActiveFilters = city || district || priceRange > 0 || roomType || searchText;

  return (
    <div className="search-page" id="search-page">
      {/* Filter Bar */}
      <div className="search-filter-bar glass" id="search-filters">
        <div className="container">
          <div className="filter-header">
            <div className="filter-search-wrap">
              <MagnifyingGlass size={18} color="var(--color-text-subtle)" />
              <input
                type="text"
                className="filter-search-input"
                placeholder="Tìm kiếm theo tên, địa chỉ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                id="search-input"
              />
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => setShowFilters(!showFilters)}
              id="toggle-filters-btn"
            >
              <Funnel size={18} />
              Bộ lọc
            </button>
          </div>

          {showFilters && (
            <div className="filter-fields animate-fade-in">
              <select
                className="select"
                value={city}
                onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
                id="filter-city"
              >
                <option value="">Tất cả thành phố</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                className="select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                id="filter-district"
              >
                <option value="">Tất cả quận</option>
                {city && DISTRICTS[city]?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                className="select"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                id="filter-price"
              >
                {PRICE_RANGES.map((r, idx) => (
                  <option key={idx} value={idx}>{r.label}</option>
                ))}
              </select>

              <select
                className="select"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                id="filter-type"
              >
                <option value="">Tất cả loại phòng</option>
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {hasActiveFilters && (
                <button className="btn btn-ghost" onClick={clearFilters} id="clear-filters-btn">
                  <X size={16} />
                  Xóa lọc
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="search-results container" id="search-results">
        <div className="search-results-header">
          <p className="text-caption">
            Tìm thấy <strong>{filteredProperties.length}</strong> phòng trọ
            {city ? ` tại ${city}` : ''}
            {district ? `, ${district}` : ''}
          </p>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="search-grid">
            {filteredProperties.map((prop, idx) => (
              <PropertyCard key={prop.id} property={prop} index={idx} />
            ))}
          </div>
        ) : (
          <div className="search-empty animate-fade-in">
            <MagnifyingGlass size={48} color="var(--color-text-subtle)" />
            <h3>Không tìm thấy phòng trọ</h3>
            <p className="text-caption">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      <style>{`
        .search-page {
          min-height: calc(100dvh - var(--header-height));
        }

        .search-filter-bar {
          position: sticky;
          top: var(--header-height);
          z-index: var(--z-dropdown);
          padding: var(--space-4) 0;
          border-bottom: 1px solid var(--color-divider);
        }

        .filter-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .filter-search-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border-strong);
          border-radius: var(--radius-subtle);
        }

        .filter-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: var(--text-sm);
          color: var(--color-text-main);
          font-family: var(--font-display);
        }

        .filter-search-input::placeholder {
          color: var(--color-text-subtle);
        }

        .filter-fields {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-3);
          flex-wrap: wrap;
        }

        .filter-fields .select {
          flex: 1;
          min-width: 150px;
        }

        @media (max-width: 768px) {
          .filter-fields {
            flex-direction: column;
          }

          .filter-fields .select {
            min-width: 100%;
          }
        }

        .search-results {
          padding-top: var(--space-6);
          padding-bottom: var(--space-12);
        }

        .search-results-header {
          margin-bottom: var(--space-5);
        }

        .search-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-5);
        }

        @media (max-width: 1024px) {
          .search-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .search-grid {
            grid-template-columns: 1fr;
          }
        }

        .search-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-16) 0;
          text-align: center;
        }

        .search-empty h3 {
          font-size: var(--text-xl);
          color: var(--color-text-main);
        }
      `}</style>
    </div>
  );
}
