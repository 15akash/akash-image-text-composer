import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error';
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea: React.FC<TextareaProps> = ({ 
  className = '', 
  variant = 'default',
  fullWidth = true,
  resize = 'vertical',
  ...props 
}) => {
  const baseClasses = 'p-2 border rounded transition-colors';
  const variantClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  const resizeClass = `resize-${resize}`;
  
  return (
    <textarea
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${resizeClass} ${className}`}
      {...props}
    />
  );
};

export default Textarea;