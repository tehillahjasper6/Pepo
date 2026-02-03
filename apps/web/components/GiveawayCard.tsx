import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Giveaway } from '@pepo/types';
import clsx from 'clsx';

interface GiveawayCardProps {
  giveaway: Giveaway;
}

export function GiveawayCard({ giveaway }: GiveawayCardProps) {
  const participantCount = giveaway.participantCount || 0;

  return (
    <Link href={`/giveaways/${giveaway.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="card card-hover cursor-pointer overflow-hidden p-0"
      >
        {/* Image */}
        <div className="relative h-48 w-full bg-gray-200">
          {giveaway.images && giveaway.images.length > 0 ? (
            <Image
              src={giveaway.images[0]}
              alt={giveaway.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-5xl">
              🎁
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={clsx(
              'badge',
              giveaway.status === 'OPEN' && 'badge-success',
              giveaway.status === 'CLOSED' && 'bg-gray-200 text-gray-600'
            )}>
              {giveaway.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-1">{giveaway.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{giveaway.description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <span className="mr-1">📍</span>
              <span>{giveaway.location}</span>
            </div>
            
            <div className="flex items-center text-primary-600 font-medium">
              <span className="mr-1">✋</span>
              <span>{participantCount} interested</span>
            </div>
          </div>

          {giveaway.eligibilityGender !== 'ALL' && (
            <div className="mt-2 text-xs text-gray-500">
              For: {giveaway.eligibilityGender.toLowerCase()}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}




