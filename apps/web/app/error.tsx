'use client';

import { useEffect } from 'react';
import { PepoBee } from '@/components/PepoBee';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background-default flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PepoBee emotion="alert" size={200} />
        <h1 className="text-2xl font-bold text-gray-900 mt-8">Something went wrong!</h1>
        <p className="text-gray-600 mt-4">
          We encountered an unexpected error. Please try again.
        </p>
        {error.message && (
          <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 p-2 rounded">
            {error.message}
          </p>
        )}
        <div className="mt-8 space-x-4">
          <button onClick={reset} className="btn btn-primary">
            Try Again
          </button>
          <a href="/" className="btn btn-secondary">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}



