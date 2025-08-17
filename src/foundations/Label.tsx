import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

const Label: React.FC<LabelProps> = ({ 
  children, 
  htmlFor, 
  className = '', 
  required = false 
}) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`block text-sm font-medium mb-1 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export default Label;