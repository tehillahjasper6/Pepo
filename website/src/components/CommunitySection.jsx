import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

function CommunitySection() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    {
      title: "Building Trust",
      description: "Join a community of NGOs that are transparent, verified, and committed to real impact. Share your story, build credibility, and connect with supporters who believe in your mission.",
      icon: "👥",
      features: ["Verified Profiles", "Impact Stories", "Community Reviews"]
    },
    {
      title: "Engaging Communities",
      description: "Create meaningful connections with volunteers, donors, and supporters. Our matching algorithm ensures the right people support your cause.",
      icon: "🤝",
      features: ["Smart Matching", "Community Events", "Real-time Updates"]
    },
    {
      title: "Measuring Impact",
      description: "Track and showcase your real-world difference with powerful analytics. Share your success stories and inspire others to join your cause.",
      icon: "📊",
      features: ["Analytics Dashboard", "Impact Metrics", "Reports"]
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-pepo-honey/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pepo-nature/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Join Our <span className="gradient-text">Global Community</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Be part of a movement to create lasting positive change in communities worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Tabs */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`p-6 rounded-2xl text-left transition-all duration-300 cursor-pointer group ${
                    activeTab === index
                      ? 'bg-gradient-to-r from-pepo-honey/20 to-pepo-nature/20 border-2 border-pepo-honey'
                      : 'bg-white border-2 border-gray-200 hover:border-pepo-honey/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{tab.icon}</span>
                    <div>
                      <h3 className={`text-lg font-bold transition-colors ${
                        activeTab === index 
                          ? 'text-pepo-nature' 
                          : 'text-gray-900 group-hover:text-pepo-nature'
                      }`}>
                        {tab.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{tab.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  {activeTab === index && (
                    <div className="mt-4 flex flex-wrap gap-2 animate-slide-up">
                      {tab.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-pepo-honey/20 text-pepo-trust text-xs font-semibold rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <a
              href="https://app.pepo.com/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pepo-honey to-pepo-nature text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300"
            >
              Join Now <ArrowRight size={20} />
            </a>
          </div>

          {/* Right - Illustration placeholder */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br from-blue-50 to-green-50">
              {/* Placeholder for community illustration */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-500 font-semibold">Community Illustration</p>
                  <p className="text-gray-400 text-sm">Diverse groups connecting</p>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-8 left-8 bg-white rounded-full px-4 py-2 shadow-lg animate-float">
                <span className="text-sm font-semibold text-gray-900">500+ NGOs</span>
              </div>
              <div className="absolute bottom-8 right-8 bg-white rounded-full px-4 py-2 shadow-lg animate-float" style={{animationDelay: '0.3s'}}>
                <span className="text-sm font-semibold text-gray-900">50K+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CommunitySection
