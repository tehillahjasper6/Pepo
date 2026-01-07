import { useEffect, useState, useRef } from 'react'
import { Quote, Users, Award, TrendingUp } from 'lucide-react'

function StatsSection() {
  const [stats, setStats] = useState([
    { icon: Users, label: 'Active NGOs', value: 0, target: 500, suffix: '+' },
    { icon: Award, label: 'Communities Served', value: 0, target: 50, suffix: 'K+' },
    { icon: TrendingUp, label: 'Impact Generated', value: 0, target: 5, suffix: 'M+' },
    { icon: Quote, label: 'Success Stories', value: 0, target: 1200, suffix: '+' }
  ])

  const statsRef = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(true)
        }
      },
      { threshold: 0.1 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [inView])

  // Animate numbers
  useEffect(() => {
    if (!inView) return

    const animations = stats.map(stat => {
      const duration = 2000
      const start = Date.now()

      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - start) / duration, 1)
        const current = Math.floor(progress * stat.target)

        setStats(prev => 
          prev.map(s => s.label === stat.label ? { ...s, value: current } : s)
        )

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      animate()
    })
  }, [inView])

  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden" ref={statsRef}>
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pepo-honey/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pepo-nature/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Making Real Impact
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of organizations and communities creating lasting change
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 cursor-pointer hover-lift"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pepo-honey/20 to-pepo-nature/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-pepo-honey to-pepo-nature rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="text-white" size={24} />
                </div>

                <div className="mb-3">
                  <p className="text-5xl font-bold text-white mb-1">
                    {inView ? stat.value : 0}{stat.suffix}
                  </p>
                </div>

                <p className="text-gray-300 font-semibold group-hover:text-white transition-colors">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            What NGOs Say About Pepo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Pepo transformed how we connect with volunteers. We've tripled our community engagement.",
                author: "Sarah Johnson",
                role: "Executive Director, Hope Foundation"
              },
              {
                quote: "The impact analytics dashboard gives us insights we never had before. It's a game-changer.",
                author: "Michael Chen",
                role: "Program Manager, Global Impact"
              },
              {
                quote: "Finally, a platform that understands NGOs. The verification system built trust instantly.",
                author: "Amara Okafor",
                role: "Founder, Community Care Initiative"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover-lift"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <Quote className="text-pepo-honey mb-4 group-hover:scale-110 transition-transform" size={28} />
                <p className="text-white mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-bold text-white">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsSection
