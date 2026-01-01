'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PepoBee } from '@/components/PepoBee';
import { LoadingDraw, WinnerCelebration, ErrorState } from '@/components/LoadingDraw';
import { useGiveaways } from '@/hooks/useGiveaways';
import { useAuth } from '@/hooks/useAuth';
import { usePepo } from '@/hooks/usePepo';
import { toast } from '@/components/Toast';
import { apiClient } from '@/lib/apiClient';
import Badge from '@/components/Badge';

export default function GiveawayDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { 
    currentGiveaway, 
    fetchGiveaway, 
    expressInterest, 
    withdrawInterest,
    conductDraw,
    isLoading 
  } = useGiveaways();
  const { user } = useAuth();
  const { showGiving, celebrateWin, showAlert } = usePepo();
  
  const [showDraw, setShowDraw] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [hasExpressed, setHasExpressed] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [showInterestAnimation, setShowInterestAnimation] = useState(false);

  // Fetch giveaway on mount
  useEffect(() => {
    fetchGiveaway(params.id);
  }, [params.id]);

  // Check if user has expressed interest
  useEffect(() => {
    if (currentGiveaway && user) {
      // TODO: Check if user is in participants list
      // For now, default to false
      setHasExpressed(false);
    }
  }, [currentGiveaway, user]);

  const handleExpressInterest = async () => {
    try {
      setShowInterestAnimation(true);
      await expressInterest(params.id);
      setHasExpressed(true);
      showGiving();
      toast.success('✋ You\'re in the draw! Good luck!');
      setTimeout(() => setShowInterestAnimation(false), 2500);
    } catch (error: unknown) {
      setShowInterestAnimation(false);
      showAlert();
      const errorMsg = error instanceof Error ? error.message : 'Failed to express interest';
      toast.error(errorMsg);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawInterest(params.id);
      setHasExpressed(false);
      toast.info('Interest withdrawn');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to withdraw interest';
      toast.error(errorMsg);
    }
  };

  const handleDraw = async () => {
    if (!currentGiveaway) return;
    
    setShowDraw(true);
    setDrawError(null);
    
    try {
      const result = await conductDraw(params.id);
      
      // Show loading for at least 2 seconds for better UX
      setTimeout(() => {
        setShowDraw(false);
        const winnerName = result.winner?.name || 'Winner';
        setWinner(winnerName);
        celebrateWin();
        toast.success('🎉 Winner selected!');
      }, 2000);
    } catch (error: unknown) {
      setShowDraw(false);
      const errorMsg = error instanceof Error ? error.message : 'Failed to conduct draw';
      setDrawError(errorMsg);
      showAlert();
      toast.error(errorMsg);
    }
  };

  // Loading state
  if (isLoading || !currentGiveaway) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <div className="text-center">
          <PepoBee emotion="loading" size={200} />
          <p className="mt-4 text-gray-600">Loading giveaway...</p>
        </div>
      </div>
    );
  }

  const giveaway = currentGiveaway;
  const isCreator = user?.id === giveaway.creator?.id;

  return (
    <div className="min-h-screen bg-background-default">
      {/* Winner Celebration Modal */}
      {winner && (
        <WinnerCelebration 
          isOpen={!!winner}
          winnerName={winner}
          giveawayTitle={currentGiveaway?.title}
          onClose={() => setWinner(null)}
        />
      )}

      {/* Loading Draw Modal */}
      <LoadingDraw 
        isOpen={showDraw}
        onClose={() => !showDraw || undefined}
      />

      {/* Draw Error Modal */}
      {drawError && (
        <ErrorState
          isOpen={!!drawError}
          message={drawError}
          onClose={() => setDrawError(null)}
          onRetry={handleDraw}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <span className="mr-2">←</span>
          Back to Browse
        </button>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {giveaway.images && giveaway.images.length > 0 ? (
              <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
                <img 
                  src={giveaway.images[0]} 
                  alt={giveaway.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">
                  {giveaway.category === 'Furniture' ? '🪑' : 
                   giveaway.category === 'Clothing' ? '👕' :
                   giveaway.category === 'Electronics' ? '💻' :
                   giveaway.category === 'Toys' ? '🧸' :
                   giveaway.category === 'Books' ? '📚' : '📦'}
                </span>
              </div>
            )}
            {giveaway.images && giveaway.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {giveaway.images.slice(1, 5).map((img: string, idx: number) => (
                  <img 
                    key={idx}
                    src={img}
                    alt={`${giveaway.title} ${idx + 2}`}
                    className="aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {giveaway.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <span className="mr-1">📍</span>
                  {giveaway.location}
                </span>
                <span className="flex items-center">
                  <span className="mr-1">🏷️</span>
                  {giveaway.category}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="card bg-primary-50 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="text-2xl font-bold text-primary-600">
                    {giveaway.status}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Interested</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {giveaway.participantCount || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {giveaway.description}
              </p>
            </div>

            {/* Giver Info */}
            <div className="card mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <div className="font-semibold">{giveaway.creator?.name || 'Anonymous'}</div>
                  <div className="text-sm text-gray-600">{giveaway.creator?.city || giveaway.location}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {/* Creator badges (client-side) */}
                <CreatorBadges creatorId={giveaway.creator?.id} />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!hasExpressed ? (
                <button
                  onClick={handleExpressInterest}
                  className="btn btn-primary w-full relative overflow-hidden"
                  disabled={showInterestAnimation}
                >
                  {showInterestAnimation ? (
                    <span className="flex items-center justify-center">
                      <PepoBee emotion="give" size={24} />
                      <span className="ml-2">Entering draw...</span>
                    </span>
                  ) : (
                    '✋ Express Interest'
                  )}
                </button>
              ) : (
                <>
                  <div className="card bg-secondary-50 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <PepoBee emotion="idle" size={60} />
                    </div>
                    <p className="font-semibold text-secondary-700">
                      You&#39;re in the draw!
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Good luck! You&#39;ll be notified if selected.
                    </p>
                  </div>
                  <button
                    onClick={handleWithdraw}
                    className="btn btn-secondary w-full"
                  >
                    Withdraw Interest
                  </button>
                </>
              )}

              {/* Creator-only actions */}
              {isCreator && giveaway.status === 'OPEN' && (
                <button
                  onClick={handleDraw}
                  className="btn bg-secondary-500 text-white hover:bg-secondary-600 w-full"
                >
                  🎲 Draw Winner Now
                </button>
              )}
            </div>

            {/* Trust Message */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start space-x-2">
                <span className="text-xl">🛡️</span>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Fair & Random Selection</p>
                  <p>
                    Winners are chosen using cryptographically secure random selection. 
                    All draws are logged and auditable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold mb-4">How PEPO Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <HowItWorksStep
              number="1"
              icon="✋"
              title="Express Interest"
              description="Click the button to enter the draw for this item"
            />
            <HowItWorksStep
              number="2"
              icon="🎲"
              title="Random Selection"
              description="Winner is chosen fairly at random when the giver is ready"
            />
            <HowItWorksStep
              number="3"
              icon="📦"
              title="Coordinate Pickup"
              description="Connect with the giver to arrange pickup details"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
function CreatorBadges({ creatorId }: { creatorId: string }) {
  const [badges, setBadges] = useState<Array<{ id: string; [key: string]: unknown }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!creatorId) return;
      try {
        const res = await apiClient.get(`/badges/user/${creatorId}`);
        if (mounted) setBadges(res || []);
      } catch (e) {
        // Silently fail if badges can't be loaded
      }
    })();
    return () => { mounted = false; };
  }, [creatorId]);

  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {badges.map((b) => (
        <Badge key={b.id} badge={b} />
      ))}
    </div>
  );
}

function HowItWorksStep({ number, icon, title, description }: any) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
        {number}
      </div>
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

