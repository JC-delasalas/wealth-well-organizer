
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <img 
          src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png" 
          alt="Loading..." 
          className={`${sizeClasses[size]} object-contain animate-pulse`}
        />
        <div className={`absolute inset-0 ${sizeClasses[size]} border-2 border-primary/30 border-t-primary rounded-full animate-spin`} />
      </div>
    </div>
  );
};
