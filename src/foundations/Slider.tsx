import React from 'react';
import Label from './Label';
import Input from './Input';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showValue?: boolean;
  valueDisplay?: (value: number) => string;
  fullWidth?: boolean;
}

const Slider: React.FC<SliderProps> = ({ 
  label,
  showValue = false,
  valueDisplay,
  fullWidth = true,
  className = '',
  value,
  ...props 
}) => {
  const displayValue = valueDisplay ? valueDisplay(Number(value)) : value;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <div className="flex justify-between items-center">
          <Label className="mb-0">{label}</Label>
          {showValue && (
            <span className="text-xs text-gray-500">{displayValue}</span>
          )}
        </div>
      )}
      <Input
        type="range"
        className={`h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${className}`}
        value={value}
        fullWidth={fullWidth}
        {...props}
      />
      {!label && showValue && (
        <div className="text-xs text-gray-500 text-center mt-1">{displayValue}</div>
      )}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default Slider;