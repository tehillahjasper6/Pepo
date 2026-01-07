import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <section
      className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center relative overflow-hidden pt-20"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute w-96 h-96 bg-yellow-300 rounded-full blur-3xl"
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        ></div>
        <div
          className="absolute w-96 h-96 bg-green-300 rounded-full blur-3xl"
          style={{
            bottom: '10%',
            right: '10%',
            transform: `translate(${-mousePos.x * 30}px, ${-mousePos.y * 30}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              Share What You Have<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-500 to-blue-400">
                Change What's Possible
              </span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-xl">
              Pepo turns generosity into a fair, transparent community experience. Give items you no longer need. Help people access what they deserve. No money. No bias. Just genuine connection.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/give')}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group">
              Start Giving
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button 
              onClick={() => navigate('/browse')}
              className="px-8 py-4 border-2 border-green-600 text-green-600 font-bold rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300">
              Browse Items
            </button>
          </div>

          {/* Trust signals */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Heart className="text-red-500" size={20} />
              <span>Join 50,000+ givers making a difference</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-2xl">✓</span>
              <span>Fair, random selection. No bias.</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-2xl">✓</span>
              <span>Transparent. Trackable. Trustworthy.</span>
            </div>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="relative h-full flex items-center justify-center">
          <div
            className="relative w-full max-w-md animate-float"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          >
            <img
              src="/images/illustrations/hero.png"
              alt="Community sharing and giving"
              className="w-full h-auto drop-shadow-2xl rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
