import React from 'react';
import InfoTooltip from './InfoTooltip';

interface FormFieldProps {
  label: string;
  required?: boolean;
  tooltip?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  tooltip,
  error,
  children,
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
          
        </label>
        {tooltip && <InfoTooltip content={tooltip} />}
      </div>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;