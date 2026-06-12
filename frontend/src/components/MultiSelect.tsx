import React, { useState, useRef, useEffect } from 'react';

export interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabels = options
    .filter((opt) => selectedValues.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div ref={containerRef} style={styles.container}>
      <button type="button" onClick={handleToggle} style={styles.triggerButton}>
        <span style={styles.labelText}>
          {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
        </span>
        <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            style={styles.searchInput}
          />
          <div style={styles.optionsList}>
            {filteredOptions.length === 0 ? (
              <div style={styles.noOptions}>No results found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <label key={opt.value} style={styles.optionItem} className="select-option">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSelect(opt.value)}
                      style={styles.checkbox}
                    />
                    <span style={styles.optionLabel}>{opt.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    minWidth: '200px',
    maxWidth: '300px',
    flex: 1,
  },
  triggerButton: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: '#f8fafc',
    fontSize: '0.95rem',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  labelText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginRight: '0.5rem',
  },
  arrow: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.5rem',
    background: '#151926',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 100,
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  searchInput: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.5rem',
    color: '#f8fafc',
    fontSize: '0.9rem',
    outline: 'none',
  },
  optionsList: {
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  optionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background 0.15s ease',
  },
  checkbox: {
    accentColor: '#6366f1',
    cursor: 'pointer',
  },
  optionLabel: {
    color: '#e2e8f0',
    fontSize: '0.9rem',
  },
  noOptions: {
    padding: '0.5rem',
    color: '#64748b',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
};
