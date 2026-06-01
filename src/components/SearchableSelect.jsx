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
    <div 
      className={`searchable-select-container ${isOpen ? 'is-open' : ''}`} 
      ref={containerRef} 
      id={id}
      style={{
        position: 'relative',
        width: '100%',
        display: 'block'
      }}
    >
      <div 
        className="searchable-select-input-wrap"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%'
        }}
      >
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
          style={{
            width: '100%',
            paddingRight: '40px'
          }}
        />
        <CaretDown 
          size={16} 
          className="searchable-select-arrow" 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute',
            right: '12px',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'transform var(--duration-normal) var(--ease-spring)'
          }}
        />
      </div>

      {isOpen && (
        <ul 
          className="searchable-select-dropdown glass-strong animate-scale-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 9999,
            padding: '4px 0',
            margin: 0,
            boxSizing: 'border-box'
          }}
        >
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

    </div>
  );
}
