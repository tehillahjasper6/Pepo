'use client';

import React from 'react';
import { PepoBee } from './PepoBee';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  small: 100,
  medium: 150,
  large: 200,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <PepoBee emotion="loading" size={sizeMap[size]} />
      {message && (
        <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return <div className="py-12">{content}</div>;
};




