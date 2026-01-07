import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react'

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-pepo-honey/10 to-pepo-nature/10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pepo-honey/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pepo-nature/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-pepo-honey/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 lg:p-16">
            {/* Left - Content */}
            <div className="flex flex-col justify-center space-y-6 animate-slide-up">
              <div>
                <p className="inline-block px-4 py-2 bg-pepo-honey/20 text-pepo-trust font-semibold rounded-full text-sm mb-4">
                  Ready to Transform?
                </p>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Join the <span className="gradient-text">Pepo Community</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Start building stronger connections with your community today. Get access to powerful tools, verified networks, and real-time impact tracking.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                {[
                  '✨ Full feature access immediately',
                  '🔒 Verified NGO status',
                  '📊 Real-time analytics dashboard',
                  '🌍 Global community support'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-700 hover:text-pepo-nature transition-colors">
                    <span className="text-xl">{item.split(' ')[0]}</span>
                    <span>{item.substring(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <a
                  href="https://app.pepo.com/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pepo-honey to-pepo-nature text-white font-bold rounded-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  Get Started Now <ArrowRight size={20} />
                </a>
              </div>
            </div>

            {/* Right - Contact Info */}
            <div className="flex flex-col justify-center space-y-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h3>

              {[
                {
                  icon: Mail,
                  label: 'Email',
                  value: 'hello@pepo.com',
                  link: 'mailto:hello@pepo.com'
                },
                {
                  icon: Phone,
                  label: 'Phone',
                  value: '+1 (555) 123-4567',
                  link: 'tel:+15551234567'
                },
                {
                  icon: MapPin,
                  label: 'Office',
                  value: 'San Francisco, CA',
                  link: '#'
                }
              ].map((contact, idx) => (
                <a
                  key={idx}
                  href={contact.link}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-pepo-honey/10 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pepo-honey to-pepo-nature rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <contact.icon className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{contact.label}</p>
                    <p className="font-semibold text-gray-900 group-hover:text-pepo-nature transition-colors">
                      {contact.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
