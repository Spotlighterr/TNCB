import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PropertyCard from '../components/PropertyCard';
import { CITIES, DISTRICTS, WARDS, ROOM_TYPES, AMENITY_MAP } from '../data/mockProperties';
import SearchableSelect from '../components/SearchableSelect';
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
  const { properties, formatPrice } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [ward, setWard] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [roomType, setRoomType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [city, district, ward, roomType, searchText]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Ẩn các bài đăng đã thuê (Full), bài viết đã gỡ (isUnlisted) hoặc đang chờ duyệt (pending)
      if (p.isRented || p.isUnlisted || p.status === 'pending') return false;

      if (city && p.city !== city) return false;
      if (district && p.district !== district) return false;
      if (ward && p.ward !== ward) return false;
      if (roomType && p.type !== roomType) return false;

      // Price filter check
      if (maxPrice && p.price > Number(maxPrice)) return false;

      if (searchText) {
        const text = searchText.toLowerCase();
        const searchable = `${p.title} ${p.address} ${p.district} ${p.city} ${p.ward || ''}`.toLowerCase();
        if (!searchable.includes(text)) return false;
      }

      return true;
    });
  }, [properties, city, district, ward, maxPrice, roomType, searchText]);

  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (sortBy === 'az') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else if (sortBy === 'za') {
      list.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [filteredProperties, sortBy]);

  const clearFilters = () => {
    setCity('');
    setDistrict('');
    setWard('');
    setMaxPrice('');
    setRoomType('');
    setSearchText('');
    setSortBy('');
    setSearchParams({});
  };

  const hasActiveFilters = city || district || ward || maxPrice !== '' || roomType || searchText || sortBy;

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
              {/* Thành phố */}
              <div style={{ flex: '1', minWidth: '150px', position: 'relative' }}>
                <span className="form-label" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-subtle)', marginBottom: '4px' }}>Thành phố</span>
                <SearchableSelect
                  placeholder="Tất cả thành phố"
                  value={city}
                  options={CITIES}
                  onChange={(val) => { setCity(val); setDistrict(''); setWard(''); }}
                  id="filter-city-select"
                />
              </div>

              {/* Quận / Huyện */}
              <div style={{ flex: '1', minWidth: '150px', position: 'relative' }}>
                <span className="form-label" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-subtle)', marginBottom: '4px' }}>Quận / Huyện</span>
                <SearchableSelect
                  placeholder="Tất cả quận"
                  value={district}
                  options={city ? DISTRICTS[city] : []}
                  onChange={(val) => { setDistrict(val); setWard(''); }}
                  id="filter-district-select"
                />
              </div>

              {/* Phường / Xã */}
              <div style={{ flex: '1', minWidth: '150px', position: 'relative' }}>
                <span className="form-label" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-subtle)', marginBottom: '4px' }}>Phường / Xã</span>
                <SearchableSelect
                  placeholder="Tất cả phường"
                  value={ward}
                  options={district ? WARDS[district] : []}
                  onChange={(val) => setWard(val)}
                  id="filter-ward-select"
                />
              </div>

              {/* Loại phòng */}
              <div style={{ flex: '1', minWidth: '150px', position: 'relative' }}>
                <span className="form-label" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-subtle)', marginBottom: '4px' }}>Loại phòng</span>
                <SearchableSelect
                  placeholder="Tất cả loại phòng"
                  value={roomType}
                  options={ROOM_TYPES}
                  onChange={(val) => setRoomType(val)}
                  id="filter-type-select"
                />
              </div>

              {/* Lọc giá - Nhập khoảng giá */}
              <div className="price-input-wrap" style={{ flex: '1.2', minWidth: '180px' }}>
                <span className="form-label" style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-subtle)', marginBottom: '4px' }}>Giá tối đa (VNĐ)</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Tất cả giá"
                    value={maxPrice ? Number(maxPrice).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // strip non-digits
                      setMaxPrice(val ? Number(val) : '');
                    }}
                    id="filter-price-input"
                    style={{ paddingRight: '36px' }}
                  />
                  {maxPrice && (
                    <button
                      onClick={() => setMaxPrice('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                {maxPrice && (
                  <span className="price-helper" style={{ display: 'block', fontSize: '11px', color: 'var(--color-accent)', marginTop: '4px', fontWeight: '500' }}>
                    ≤ {formatPrice(Number(maxPrice))}
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={clearFilters} id="clear-filters-btn" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <X size={16} />
                    Xóa lọc
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="search-results container" id="search-results">
        <div className="search-results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <p className="text-caption" style={{ margin: 0 }}>
            Tìm thấy <strong>{sortedProperties.length}</strong> phòng trọ
            {city ? ` tại ${city}` : ''}
            {district ? `, ${district}` : ''}
            {ward ? `, ${ward}` : ''}
          </p>

          <div className="sort-by-wrap" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-caption" style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
            <select
              className="select"
              style={{ width: '180px', padding: '6px 12px', paddingRight: 'var(--space-8)', borderRadius: 'var(--radius-subtle)', backgroundPosition: 'right 8px center', height: '36px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              id="sort-by-select"
            >
              <option value="">Mặc định</option>
              <option value="az">Tên A ➜ Z</option>
              <option value="za">Tên Z ➜ A</option>
              <option value="price-asc">Giá thấp ➜ cao</option>
              <option value="price-desc">Giá cao ➜ thấp</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="search-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card card" style={{ minHeight: '340px' }}>
                <div className="skeleton-image skeleton" style={{ height: '180px' }} />
                <div className="skeleton-content">
                  <div className="skeleton-line skeleton-title skeleton" style={{ width: '80%' }} />
                  <div className="skeleton-line skeleton-text-short skeleton" style={{ width: '40%' }} />
                  <div className="skeleton-line skeleton-text-medium skeleton" style={{ width: '60%', margin: '8px 0' }} />
                  <div className="skeleton-footer skeleton" style={{ height: '36px', marginTop: 'auto' }} />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProperties.length > 0 ? (
          <div className="search-grid">
            {sortedProperties.map((prop, idx) => (
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

        @media (max-width: 440px) {
          .search-grid {
            grid-template-columns: 1fr;
          }

          .filter-header {
            flex-wrap: wrap;
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
