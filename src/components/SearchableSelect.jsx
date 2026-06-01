import { useState, useRef, useEffect } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export default function SearchableSelect({ value, onChange, options = [], placeholder = 'Chọn...', id }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Sync internal search state with external value when dropdown opens or value changes
  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset search to current value if they click away
        setSearch(value || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setSearch(option);
    setIsOpen(false);
  };

  return (
    <div className={`searchable-select-container ${isOpen ? 'is-open' : ''}`} ref={containerRef} id={id}>
      <div className="searchable-select-input-wrap">
        <input
          type="text"
          className="searchable-select-input input"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange(''); // clear selection
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <CaretDown size={16} className="searchable-select-arrow" onClick={() => setIsOpen(!isOpen)} />
      </div>

      {isOpen && (
        <ul className="searchable-select-dropdown glass-strong animate-scale-in">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <li
                key={idx}
                className={`searchable-select-option ${option === value ? 'active' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </li>
            ))
          ) : (
            <li className="searchable-select-no-results">Không tìm thấy kết quả</li>
          )}
        </ul>
      )}

      <style>{`
        .searchable-select-container {
          position: relative;
          width: 100%;
        }

        .searchable-select-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .searchable-select-input {
          width: 100%;
          padding-right: 40px !important;
        }

        .searchable-select-arrow {
          position: absolute;
          right: 12px;
          color: var(--color-text-subtle);
          cursor: pointer;
          transition: transform var(--duration-normal) var(--ease-spring), color var(--duration-fast);
        }

        .searchable-select-container.is-open .searchable-select-arrow {
          transform: rotate(180deg);
          color: var(--color-accent);
        }

        .searchable-select-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          max-height: 200px;
          overflow-y: auto;
          border-radius: var(--radius-subtle);
          border: 1px solid var(--glass-border);
          z-index: 10;
          box-shadow: var(--shadow-lg);
          padding: var(--space-1) 0;
        }

        .searchable-select-option {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
          color: var(--color-text-main);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-smooth);
        }

        .searchable-select-option:hover {
          background: var(--color-accent-subtle);
          color: var(--color-accent);
          padding-left: var(--space-5);
        }

        .searchable-select-option.active {
          background: var(--color-accent);
          color: #ffffff;
        }

        .searchable-select-no-results {
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
