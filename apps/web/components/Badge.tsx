import React, { useState } from 'react';

export default function Badge({ badge }: { badge: { badge: { color?: string; icon?: string; description: string; name: string }; [key: string]: unknown } }) {
  const [showTooltip, setShowTooltip] = useState(false);
  if (!badge || !badge.badge) return null;
  const b = badge.badge;

  return (
    <div 
      className="inline-flex items-center px-3 py-1.5 rounded-full border shadow-sm bg-white/70 hover:bg-white/90 transition-colors cursor-help relative"
      style={{ borderColor: b.color || '#E5E7EB', borderWidth: '1.5px' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      title={b.description}
    >
      <span className="mr-2 text-base" aria-hidden>
        {b.icon ? emojiForIcon(b.icon) : '🔖'}
      </span>
      <span className="text-xs font-semibold text-gray-700">{b.name}</span>
      
      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {b.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

function emojiForIcon(icon: string) {
  const map: Record<string, string> = {
    'gift-open': '🎁',
    'shield-check': '✅',
    'repeat': '🔁',
    'users': '👥',
    'heart': '❤️',
    'badge': '🏷️',
    'document-text': '📄',
    'handshake': '🤝',
    'sun': '☀️',
    'sparkles': '✨',
  };
  return map[icon] || '🔖';
}
