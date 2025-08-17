import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error';
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  className = '', 
  variant = 'default',
  fullWidth = true,
  ...props 
}) => {
  const baseClasses = 'p-2 border rounded transition-colors';
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <input
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    />
  );
};

export default Input;