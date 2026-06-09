import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label }) => {
  return (
    <label style={styles.container}>
      {label && <span style={styles.label}>{label}</span>}
      <div style={styles.switch}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={styles.input}
        />
        <div style={{
          ...styles.slider,
          backgroundColor: checked ? 'rgba(99, 102, 241, 0.8)' : 'rgba(255, 255, 255, 0.08)',
          borderColor: checked ? 'rgba(99, 102, 241, 0.9)' : 'rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{
            ...styles.knob,
            transform: checked ? 'translateX(18px)' : 'translateX(0px)',
            backgroundColor: checked ? '#ffffff' : '#94a3b8',
          }} />
        </div>
      </div>
    </label>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#94a3b8',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '40px',
    height: '22px',
  },
  input: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '34px',
    border: '1px solid',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 2px',
  },
  knob: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
};
