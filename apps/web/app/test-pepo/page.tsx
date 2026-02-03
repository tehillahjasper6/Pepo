'use client';

import { useState } from 'react';
import { PepoBee, type PepoEmotion } from '@/components/PepoBee';
import { LoadingDraw, WinnerCelebration, ErrorState } from '@/components/LoadingDraw';

export default function TestPepoPage() {
  const [emotion, setEmotion] = useState<PepoEmotion>('idle');
  const [showComponent, setShowComponent] = useState<'bee' | 'loading' | 'winner' | 'error'>('bee');

  return (
    <div className="min-h-screen bg-background-default p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">🐝 PEPO Brand Asset Test</h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Emotions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setEmotion('idle'); setShowComponent('bee'); }}
              className="btn btn-primary"
            >
              Idle
            </button>
            <button
              onClick={() => { setEmotion('celebrate'); setShowComponent('bee'); }}
              className="btn btn-primary"
            >
              Celebrate
            </button>
            <button
              onClick={() => { setEmotion('give'); setShowComponent('bee'); }}
              className="btn btn-primary"
            >
              Give
            </button>
            <button
              onClick={() => { setEmotion('loading'); setShowComponent('bee'); }}
              className="btn btn-primary"
            >
              Loading
            </button>
            <button
              onClick={() => { setEmotion('alert'); setShowComponent('bee'); }}
              className="btn btn-primary"
            >
              Alert
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-4 mt-6">Test Components</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowComponent('loading')}
              className="btn btn-secondary"
            >
              Loading Draw
            </button>
            <button
              onClick={() => setShowComponent('winner')}
              className="btn btn-secondary"
            >
              Winner Screen
            </button>
            <button
              onClick={() => setShowComponent('error')}
              className="btn btn-secondary"
            >
              Error State
            </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="bg-white rounded-lg shadow-card p-8">
          {showComponent === 'bee' && (
            <div className="flex flex-col items-center">
              <PepoBee emotion={emotion} size={300} />
              <p className="mt-4 text-xl font-semibold text-gray-700">
                Current: {emotion}
              </p>
            </div>
          )}

          {showComponent === 'loading' && (
            <LoadingDraw />
          )}

          {showComponent === 'winner' && (
            <WinnerCelebration winnerName="John Doe" />
          )}

          {showComponent === 'error' && (
            <ErrorState message="Unable to complete the draw. Please try again." />
          )}
        </div>

        {/* Brand Assets Info */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold mb-3">Available Emotions</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• <strong>Idle:</strong> Default resting state (3s loop)</li>
              <li>• <strong>Celebrate:</strong> Winner announcement (2.5s)</li>
              <li>• <strong>Give:</strong> Giveaway posted (2s)</li>
              <li>• <strong>Loading:</strong> Processing draw (2s loop)</li>
              <li>• <strong>Alert:</strong> Errors & warnings (2s)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold mb-3">Brand Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-primary-500"></div>
                <span className="text-sm">Honey Gold (#F4B400)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-secondary-500"></div>
                <span className="text-sm">Leaf Green (#6BBF8E)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-background-default border"></div>
                <span className="text-sm">Pollen Cream (#FFF9EE)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




