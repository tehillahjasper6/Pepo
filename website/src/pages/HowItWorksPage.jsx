import { CheckCircle } from 'lucide-react'

function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Create Your Profile",
      description: "Set up your NGO profile with your mission, impact metrics, and verification documents"
    },
    {
      num: "02",
      title: "Build Your Team",
      description: "Discover and invite volunteers, partners, and supporters aligned with your mission"
    },
    {
      num: "03",
      title: "Launch Campaigns",
      description: "Create engaging campaigns to rally support and drive community action"
    },
    {
      num: "04",
      title: "Track Impact",
      description: "Measure and showcase the real-world difference your work is making in communities"
    }
  ]

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            How <span className="gradient-text">Pepo</span> Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-pepo-honey to-pepo-nature rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{step.num}</span>
                </div>
              </div>
              <div className="flex-grow pt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features in How It Works */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 p-12 rounded-2xl mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Real-time collaboration tools",
              "Automated volunteer matching",
              "Campaign management suite",
              "Impact tracking dashboard",
              "Community engagement platform",
              "Secure data protection",
              "Mobile accessibility",
              "24/7 support team"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="text-pepo-nature flex-shrink-0" size={24} />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="https://app.pepo.com/signup" className="inline-block px-12 py-4 bg-gradient-to-r from-pepo-honey to-pepo-nature text-white font-bold text-lg rounded-lg hover:shadow-xl transition">
            Get Started Free
          </a>
        </div>
      </div>
    </div>
  )
}

export default HowItWorksPage
