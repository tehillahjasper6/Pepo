'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PepoBee } from '@/components/PepoBee';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Cartoon Images and Mouse Movement */}
      <header className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-8 relative">
              <PepoBee emotion="idle" size={150} />
              <MouseImageParallax />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Give Freely. Live Lightly.
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/90">
              A community platform for sharing and giving, built on fairness, trust, and dignity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="btn btn-primary bg-white text-primary-600 text-lg hover:scale-105">
                Join the Community
              </Link>
              <Link href="/browse" className="btn btn-secondary border-white text-white hover:bg-white/10 text-lg">
                Browse Giveaways
              </Link>
            </div>
          </motion.div>
        </div>
      </header>
// Mouse responsive cartoon images
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

function MouseImageParallax() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate offset for parallax effect
  const offset = (factor: number) => ({
    x: (mouse.x - window.innerWidth / 2) * factor,
    y: (mouse.y - window.innerHeight / 2) * factor,
  });

  return (
    <>
      <motion.div
        style={{ position: 'absolute', left: '10%', top: '40%', zIndex: 2 }}
        animate={offset(0.03)}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <Image
          src="/images/illustrations/givers.png"
          alt="Giver cartoon"
          width={220}
          height={320}
          priority
        />
      </motion.div>
      <motion.div
        style={{ position: 'absolute', right: '10%', top: '45%', zIndex: 2 }}
        animate={offset(-0.03)}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <Image
          src="/images/illustrations/receivers.png"
          alt="Receiver cartoon"
          width={220}
          height={320}
          priority
        />
      </motion.div>
      <motion.div
        style={{ position: 'absolute', left: '50%', top: '70%', zIndex: 1, transform: 'translateX(-50%)' }}
        animate={offset(0.01)}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <Image
          src="/images/illustrations/community.png"
          alt="Community cartoon"
          width={180}
          height={180}
          priority
        />
      </motion.div>
    </>
  );
}

      
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card text-center"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

function ValueCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

