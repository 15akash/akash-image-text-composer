import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[] | string[];
  variant?: 'default' | 'error';
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  options,
  className = '', 
  variant = 'default',
  fullWidth = true,
  ...props 
}) => {
  const baseClasses = 'p-2 border rounded transition-colors bg-white';
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <select
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {options.map((option, index) => {
        const isStringArray = typeof option === 'string';
        const value = isStringArray ? option : option.value;
        const label = isStringArray ? option : option.label;
        
        return (
          <option key={index} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

export default Select;