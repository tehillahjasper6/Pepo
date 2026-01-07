import { Link } from 'react-router-dom'
import { Heart, Users, MessageSquare, Linkedin, Twitter, Github } from 'lucide-react'

function Footer() {
  const footerLinks = {
    Product: ['Features', 'Security', 'Pricing', 'Roadmap'],
    Company: ['About', 'Blog', 'Contact', 'Careers'],
    Legal: ['Privacy', 'Terms', 'Cookie Policy', 'Compliance'],
    Resources: ['Docs', 'API Ref', 'Support', 'Community']
  }

  const socialLinks = [
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' }
  ]

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-pepo-honey/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-pepo-nature/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-1 animate-slide-up">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-pepo-honey to-pepo-nature rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl">Pepo</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Share what you have. Change what's possible. A fair, transparent platform for generosity.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  title={social.label}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-pepo-honey/20 transition-all duration-300 hover:scale-110"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <div
              key={category}
              className="animate-slide-up"
              style={{ animationDelay: `${(idx + 1) * 0.05}s` }}
            >
              <h3 className="font-bold text-white mb-4 relative pb-2">
                {category}
                <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-pepo-honey to-pepo-nature"></span>
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm hover:translate-x-1 inline-block"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-gray-400 text-sm">
            © 2025 Pepo. All rights reserved. Building trust, one community at a time.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-pepo-honey transition-colors duration-200 group">
              <Heart className="group-hover:scale-110 transition-transform" size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-pepo-nature transition-colors duration-200 group">
              <Users className="group-hover:scale-110 transition-transform" size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-pepo-nature transition-colors duration-200 group">
              <MessageSquare className="group-hover:scale-110 transition-transform" size={20} />
            </a>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-500 text-xs text-center mb-4">Trusted by leading organizations</p>
          <div className="flex justify-center gap-6 flex-wrap">
            {['ISO 27001', 'SOC 2', 'GDPR', 'NGO Verified'].map((badge, idx) => (
              <div
                key={idx}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-gray-400 hover:border-white/20 hover:text-gray-300 transition-all duration-300"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
