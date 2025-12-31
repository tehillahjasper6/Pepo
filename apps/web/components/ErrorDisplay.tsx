'use client';

import React from 'react';
import { PepoBee } from './PepoBee';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <PepoBee emotion="alert" size={200} />
      <h2 className="text-2xl font-bold text-gray-900 mt-8">{title}</h2>
      <p className="text-gray-600 mt-4 text-center max-w-md">{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary mt-6">
          Try Again
        </button>
      )}
    </div>
  );
};



