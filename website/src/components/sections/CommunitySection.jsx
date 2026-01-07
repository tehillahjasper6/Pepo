import React, { useState } from 'react';

const CommunitySection = () => {
  const [activeTab, setActiveTab] = useState('givers');

  const communityStories = {
    givers: {
      title: 'For Givers',
      description: 'Share your generosity. Build your reputation. Make a real impact.',
      image: '/images/illustrations/givers.png',
      points: [
        'List items in minutes',
        'Fair random selection',
        'Earn Giver Badge',
        'Track your impact',
      ],
    },
    receivers: {
      title: 'For Receivers',
      description: 'Access items you need. Fair chances. No judgment.',
      image: '/images/illustrations/receivers.png',
      points: [
        'Browse available items',
        'Join fair draws',
        'No payment needed',
        'Build community connections',
      ],
    },
    ngos: {
      title: 'For NGOs',
      description: 'Distribute at scale. Maximize impact. Prove results.',
      image: '/images/illustrations/community.png',
      points: [
        'Bulk giveaways',
        'Verified accounts',
        'Impact reports',
        'Community trust',
      ],
    },
  };

  const currentTab = communityStories[activeTab];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            A Platform for Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're giving, receiving, or running an organization, Pepo is designed for you
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {['givers', 'receivers', 'ngos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 font-bold rounded-lg transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-3xl font-bold text-gray-900">
              {currentTab.title}
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              {currentTab.description}
            </p>
            <ul className="space-y-3">
              {currentTab.points.map((point, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-gray-600"
                >
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <img
              src={currentTab.image}
              alt={currentTab.title}
              className="w-full max-w-md h-auto drop-shadow-xl rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
