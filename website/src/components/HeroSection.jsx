import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height
      })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-b from-white via-blue-50 to-white overflow-hidden pt-20 pb-20 cursor-none"
    >
      {/* Animated background gradient based on mouse position */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(253, 185, 39, 0.1) 0%, transparent 50%)`
        }}
      />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pepo-honey/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pepo-nature/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-pepo-honey/20 text-pepo-trust font-semibold rounded-full text-sm hover:bg-pepo-honey/30 transition-all duration-300 cursor-pointer group">
                <span className="inline-block group-hover:translate-x-1 transition-transform">🌍 Connecting communities to impact</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                <span className="gradient-text block">Empower</span>
                <span className="text-gray-900">NGOs, </span>
                <span className="gradient-text">Transform</span>
                <span className="text-gray-900"> Communities</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Pepo is the comprehensive platform designed to help NGOs discover talent, manage campaigns, and create meaningful connections with communities worldwide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="https://app.pepo.com/signup" 
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pepo-honey to-pepo-nature text-white font-bold rounded-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Launch App <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </a>
              <Link 
                to="/how-it-works" 
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:border-pepo-nature hover:text-pepo-nature hover:bg-pepo-nature/5 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { number: '500+', label: 'NGO Partners' },
                { number: '50K+', label: 'Users Connected' },
                { number: '$5M+', label: 'Impact Created' }
              ].map((stat, index) => (
                <div key={index} className="group">
                  <p className="text-3xl font-bold gradient-text group-hover:scale-110 transition-transform">
                    {stat.number}
                  </p>
                  <p className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual - Community Illustration */}
          <div className="relative hidden lg:block h-[600px]">
            {/* Floating cards with mouse-following effect */}
            <div 
              className="absolute top-10 left-0 w-56 bg-white rounded-2xl shadow-xl p-6 border-l-4 border-pepo-honey hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              style={{
                transform: `translateX(${mousePosition.x * 20}px) translateY(${mousePosition.y * 20}px)`
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Zap className="text-pepo-honey" size={20} />
                <p className="font-semibold text-gray-900">Quick Matching</p>
              </div>
              <p className="text-sm text-gray-600">Find the right NGO in seconds</p>
            </div>

            {/* Central Community Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative w-96 h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img 
                    src="/images/illustrations/hero.png"
                    alt="Community" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Right Card */}
            <div 
              className="absolute bottom-10 right-0 w-56 bg-white rounded-2xl shadow-xl p-6 border-l-4 border-pepo-nature hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              style={{
                transform: `translateX(${-mousePosition.x * 20}px) translateY(${-mousePosition.y * 20}px)`
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="text-pepo-nature" size={20} />
                <p className="font-semibold text-gray-900">Verified NGOs</p>
              </div>
              <p className="text-sm text-gray-600">All NGOs are thoroughly verified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
