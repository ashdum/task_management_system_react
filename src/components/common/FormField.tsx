import React, { forwardRef } from 'react';

interface FormFieldProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  className: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  type,
  value,
  onChange,
  placeholder,
  className,
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
});