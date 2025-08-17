import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children,
  className = '', 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  ...props 
}) => {
  return (
    <button
      className={clsx(
        // Base classes
        'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer',
        
        // Variant classes
        {
          'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500': variant === 'primary',
          'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500': variant === 'secondary',
          'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500': variant === 'success',
          'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500': variant === 'danger',
          'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-gray-500': variant === 'outline',
          'bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 focus:ring-gray-300': variant === 'icon',
        },
        
        // Size classes
        {
          'p-1': variant === 'icon' && size === 'sm',
          'p-2': variant === 'icon' && size === 'md',
          'p-3': variant === 'icon' && size === 'lg',
          'px-3 py-1 text-sm': variant !== 'icon' && size === 'sm',
          'px-4 py-2': variant !== 'icon' && size === 'md',
          'px-6 py-3 text-lg': variant !== 'icon' && size === 'lg',
        },
        
        // Width class
        {
          'w-full': fullWidth,
        },
        
        // Disabled/loading state
        {
          'opacity-50 cursor-not-allowed': disabled || loading,
        },
        
        // Custom className
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;