'use client';

import { useEffect } from 'react';
import { PepoBee } from './PepoBee';

interface LoadingDrawModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function LoadingDraw({ isOpen, onClose }: LoadingDrawModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 md:p-12 max-w-md w-full mx-4 shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center">
          <PepoBee emotion="loading" size={200} />
          <p className="mt-6 text-xl font-semibold text-gray-900 animate-pulse">
            Drawing a winner...
          </p>
          <p className="mt-3 text-sm text-gray-600 text-center">
            Using cryptographically secure randomness
          </p>
          <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-primary-500 h-2 rounded-full animate-progress" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WinnerCelebrationModalProps {
  isOpen: boolean;
  winnerName: string;
  onClose: () => void;
  giveawayTitle?: string;
}

export function WinnerCelebration({ 
  isOpen, 
  winnerName, 
  onClose,
  giveawayTitle 
}: WinnerCelebrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 md:p-12 max-w-lg w-full mx-4 shadow-2xl animate-scaleIn border-4 border-primary-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <PepoBee emotion="celebrate" size={250} />
          <div className="mt-6 space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-600">
              🎉 Congratulations! 🎉
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">
              {winnerName}
            </p>
            {giveawayTitle && (
              <p className="text-lg text-gray-700 mt-2">
                You&#39;ve won: <span className="font-semibold">{giveawayTitle}</span>
              </p>
            )}
            <p className="text-xl text-gray-600 mt-4">
              You&#39;ve been selected!
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-8 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
          >
            Awesome! 🐝
          </button>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function ErrorState({ 
  isOpen, 
  message, 
  onClose,
  onRetry 
}: ErrorStateModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 md:p-12 max-w-md w-full mx-4 shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <PepoBee emotion="alert" size={200} />
          <h2 className="text-2xl font-bold mt-6 text-gray-900">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mt-4">{message}</p>
          <div className="mt-6 flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2 rounded-full transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-full transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

