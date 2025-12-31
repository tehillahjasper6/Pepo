'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PepoBee, PepoIcon } from '@/components/PepoBee';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 text-white">
        {/* Removed duplicate navbar: Navigation should be handled globally in layout.tsx */}
          <div className="flex items-center space-x-2">
            <PepoIcon size={40} />
            <span className="text-2xl font-bold">PEPO</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/signup" className="btn bg-white text-primary-500 hover:bg-gray-100">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-8">
              <PepoBee emotion="idle" size={150} />
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

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How PEPO Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🎁"
            title="Post a Giveaway"
            description="Share items you no longer need with your community. Upload photos, add details, and set eligibility rules."
          />
          <FeatureCard
            icon="✋"
            title="Express Interest"
            description="See something you need? Tap 'I'm Interested' to join the draw. It's free, fair, and simple."
          />
          <FeatureCard
            icon="🎲"
            title="Random & Fair"
            description="Givers close the draw anytime. Our system randomly selects winners using secure, auditable randomness."
          />
        </div>
      </section>

      {/* NGO Section */}
      <section className="bg-secondary-500/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-6">🤝</div>
            <h2 className="text-4xl font-bold mb-6">NGO & Charity Mode</h2>
            <p className="text-lg text-gray-700 mb-8">
              Organizations can create campaigns, manage bulk giveaways, schedule distributions, 
              and track impact—all with verified badges and transparency tools.
            </p>
            <Link href="/ngo" className="btn btn-primary">
              Learn More About NGO Mode
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Our Values</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ValueCard
            icon="🤲"
            title="Generosity"
            description="Give without expectation. Receive with gratitude."
          />
          <ValueCard
            icon="⚖️"
            title="Fairness"
            description="Random selection ensures everyone has an equal chance."
          />
          <ValueCard
            icon="🕊️"
            title="Dignity"
            description="No favoritism, no pressure, no social ranking."
          />
          <ValueCard
            icon="🔒"
            title="Privacy"
            description="Your data is secure. Share only what you choose."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start giving or receiving?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of community members sharing and caring through PEPO.
          </p>
          <Link href="/signup" className="btn bg-white text-primary-600 text-lg hover:scale-105">
            Create Free Account
          </Link>
        </div>
      </section>
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

