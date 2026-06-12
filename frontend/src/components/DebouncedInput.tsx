import React, { useState, useEffect } from 'react';

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
}

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  className = '',
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = useState(initialValue);

  // Sync internal state with external value changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounce effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange, initialValue]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={className}
    />
  );
}
