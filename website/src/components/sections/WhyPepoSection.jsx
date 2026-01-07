import React from 'react';
import { Eye, Hand, Zap, Users } from 'lucide-react';

const WhyPepoSection = () => {
  const values = [
    {
      icon: Eye,
      title: 'Transparent',
      description: 'Every draw is visible and verifiable. No hidden bias. No favoritism.',
    },
    {
      icon: Hand,
      title: 'Fair',
      description: 'Random selection ensures everyone has an equal chance. The algorithm doesn\'t play favorites.',
    },
    {
      icon: Zap,
      title: 'No Money',
      description: 'Items are given freely. No payment. No marketplace. Just genuine human generosity.',
    },
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Rewards givers with reputation and badges. Celebrates the joy of sharing, not profit.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-yellow-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Pepo?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A giving platform built on fairness, trust, and human connection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyPepoSection;
