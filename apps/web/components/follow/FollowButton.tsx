import React, { useState } from 'react';
import { useFollowNGO, useMuteNGO } from '@/hooks/useFollows';
import { Loader2, Heart, HeartOff, MoreVertical, EyeOff } from 'lucide-react';

interface FollowButtonProps {
  ngoId: string;
  ngoName?: string;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * FollowButton Component
 * Reusable button to follow/unfollow NGOs with optimistic updates
 * Features: Loading states, error handling, mute option
 */
export function FollowButton({
  ngoId,
  ngoName,
  className = '',
  variant = 'primary',
  size = 'md',
  showLabel = true,
}: FollowButtonProps) {
  const { isFollowing, isMuted, isLoading, error, toggle } = useFollowNGO(ngoId);
  const { mute } = useMuteNGO(ngoId);
  const [showMenu, setShowMenu] = useState(false);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: isFollowing
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-blue-500 hover:bg-blue-600 text-white',
    outline: isFollowing
      ? 'border-2 border-red-500 text-red-500 hover:bg-red-50'
      : 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
    ghost: isFollowing
      ? 'text-red-500 hover:bg-red-50'
      : 'text-blue-500 hover:bg-blue-50',
  };

  return (
    <div className="relative">
      <button
        onClick={() => toggle()}
        disabled={isLoading}
        className={`
          flex items-center gap-2 rounded-lg font-semibold transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        title={isMuted ? 'Muted NGO (hidden from recommendations)' : ''}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          <Heart className="h-4 w-4 fill-current" />
        ) : (
          <HeartOff className="h-4 w-4" />
        )}

        {showLabel && (
          <span className="hidden sm:inline">
            {isFollowing ? 'Following' : 'Follow'}
          </span>
        )}

        {isMuted && <EyeOff className="h-3 w-3 ml-1" />}
      </button>

      {/* Mute/Unmute Menu */}
      {isFollowing && showMenu && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              mute();
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
          >
            {isMuted ? '👁️ Unmute' : '🚫 Mute this NGO'}
          </button>
        </div>
      )}

      {/* More Options Menu */}
      {isFollowing && (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      )}

      {error && (
        <div className="text-red-500 text-xs mt-1">
          {error instanceof Error ? error.message : 'Error updating follow status'}
        </div>
      )}
    </div>
  );
}
