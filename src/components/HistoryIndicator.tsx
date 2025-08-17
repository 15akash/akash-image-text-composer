import React from 'react';

interface HistoryIndicatorProps {
  currentIndex: number;
  totalSteps: number;
  maxSteps?: number;
}

const HistoryIndicator: React.FC<HistoryIndicatorProps> = ({
  currentIndex,
  totalSteps,
  maxSteps = 20
}) => {
  // Create an array representing the history steps
  const steps = Array.from({ length: Math.min(totalSteps, maxSteps) }, (_, index) => {
    const stepIndex = totalSteps > maxSteps ? index + (totalSteps - maxSteps) : index;
    const isCurrent = stepIndex === currentIndex;
    const isPast = stepIndex < currentIndex;
    
    return {
      index: stepIndex,
      isCurrent,
      isPast,
      isFuture: !isCurrent && !isPast
    };
  });

  return (
    <div className="flex items-center space-x-1 p-2 bg-gray-50 rounded">
      <span className="text-xs text-gray-500 mr-2">History:</span>
      <div className="flex space-x-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors ${
              step.isCurrent
                ? 'bg-blue-500'
                : step.isPast
                ? 'bg-gray-400'
                : 'bg-gray-200'
            }`}
            title={`Step ${step.index + 1}${step.isCurrent ? ' (current)' : ''}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-2">
        {currentIndex + 1}/{totalSteps}
      </span>
    </div>
  );
};

export default HistoryIndicator;