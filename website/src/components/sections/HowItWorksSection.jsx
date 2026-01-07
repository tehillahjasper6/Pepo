import React from 'react';
import { Gift, Users, Sparkles, Trophy } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Gift,
      title: 'You List an Item',
      description: 'Share something you no longer need. Write a description, set your location, and choose pickup method.',
      color: 'from-yellow-400 to-yellow-100',
    },
    {
      icon: Users,
      title: 'Interested Users Join',
      description: 'People in your community tap "I\'m Interested". They\'re added to a fair draw pool.',
      color: 'from-green-400 to-blue-200',
    },
    {
      icon: Sparkles,
      title: 'We Pick a Winner',
      description: 'When you\'re ready, we randomly select one lucky person from all interested participants. Fair. Transparent. Unbiased.',
      color: 'from-blue-400 to-yellow-100',
    },
    {
      icon: Trophy,
      title: 'Arrange & Connect',
      description: 'Winner gets the pickup details. You get a Giver Badge and reputation points. Both gain trust.',
      color: 'from-green-400 to-blue-400',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How Pepo Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps from generosity to community impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-xl p-8 border border-yellow-200 hover:shadow-xl transition-all duration-300"
              >
                {/* Step number */}
                <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-gray-900 font-bold text-lg`}>
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} className="text-gray-900" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
