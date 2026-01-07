import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-yellow-900 to-green-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-96 h-96 bg-yellow-400 rounded-full blur-3xl top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-green-400 rounded-full blur-3xl bottom-0 right-0"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm font-medium text-white">Join the Movement</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
            Ready to Make a Difference?
          </h2>

          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto">
            Join thousands of givers and receivers building a fairer, more transparent community. Your generosity matters. Your fairness matters. You matter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={() => navigate('/give')}
              className="px-8 py-4 bg-white text-gray-900 font-bold rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group">
              Start Giving Today
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button 
              onClick={() => navigate('/browse')}
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all duration-300">
              Browse Items
            </button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-6 pt-8 text-white text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400">50K+</div>
              <div className="text-sm text-gray-300">Active Givers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">100K+</div>
              <div className="text-sm text-gray-300">Items Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">25K+</div>
              <div className="text-sm text-gray-300">Lives Impacted</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
