import { Heart, Users, TrendingUp, Zap, Shield, Globe } from 'lucide-react'
import { useState } from 'react'

function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const features = [
    {
      icon: Heart,
      title: "Trust Building",
      description: "Establish credibility with transparent impact tracking and verified credentials",
      color: "from-red-500/20 to-pink-500/20",
      borderColor: "border-red-500/30"
    },
    {
      icon: Users,
      title: "Community Matching",
      description: "Connect with volunteers and supporters perfectly aligned with your mission",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      icon: TrendingUp,
      title: "Impact Analytics",
      description: "Measure and showcase the real-world difference your work is making",
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30"
    },
    {
      icon: Zap,
      title: "Smart Campaigns",
      description: "Launch targeted campaigns that engage your audience and drive action",
      color: "from-yellow-500/20 to-orange-500/20",
      borderColor: "border-yellow-500/30"
    },
    {
      icon: Shield,
      title: "Secure & Verified",
      description: "Industry-leading security with NGO verification and compliance",
      color: "from-purple-500/20 to-indigo-500/20",
      borderColor: "border-purple-500/30"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with communities and partners across the world",
      color: "from-teal-500/20 to-cyan-500/20",
      borderColor: "border-teal-500/30"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-pepo-honey/5 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <p className="inline-block px-4 py-2 bg-pepo-honey/20 text-pepo-trust font-semibold rounded-full text-sm mb-4">
            ✨ Powerful Capabilities
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Real Impact Through<br/>
            <span className="gradient-text-animated">Advanced Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to build trust, engage communities, and measure your impact
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative bg-white p-8 rounded-2xl shadow-md border transition-all duration-500 cursor-pointer hover-lift
                ${hoveredIndex === index 
                  ? 'shadow-2xl border-pepo-honey/50 scale-105' 
                  : 'border-gray-200 hover:border-pepo-honey/30'
                }
              `}
            >
              {/* Glow background */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-pepo-honey to-pepo-nature rounded-lg flex items-center justify-center mb-4 group-hover:scale-125 transition-transform duration-300">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pepo-nature transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center text-pepo-nature font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Learn more →
                </div>
              </div>

              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-gradient-to-r from-pepo-honey to-pepo-nature opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center animate-slide-up" style={{animationDelay: '0.6s'}}>
          <a 
            href="https://app.pepo.com/signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pepo-honey to-pepo-nature text-white font-bold rounded-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            Explore All Features →
          </a>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
