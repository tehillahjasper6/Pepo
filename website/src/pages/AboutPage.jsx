import { Users, Target, Award } from 'lucide-react'

function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About <span className="gradient-text">Pepo</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Building the future of community engagement and social impact
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16 bg-gradient-to-br from-blue-50 to-green-50 p-12 rounded-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            We believe that social impact is stronger when built on trust and community. Pepo is designed to connect NGOs with the supporters, volunteers, and communities they need to create meaningful change.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Through transparent verification, real-time collaboration, and measurable impact metrics, we're making it easier than ever to do good work and share your story with the world.
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Community First",
                description: "Everything we build is centered on creating real value for communities and the organizations serving them"
              },
              {
                icon: Target,
                title: "Impact Driven",
                description: "We measure success by the positive change created in people's lives and communities worldwide"
              },
              {
                icon: Award,
                title: "Trust & Transparency",
                description: "We build systems of verification and transparency because trust is the foundation of everything"
              }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pepo-honey to-pepo-nature rounded-lg flex items-center justify-center">
                    <value.icon className="text-white" size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="bg-gray-50 p-12 rounded-2xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Our team brings together expertise in social impact, technology, and community building. We're passionate about using technology to amplify the work of organizations making a difference.
          </p>
          <a href="#" className="inline-block px-8 py-3 bg-gradient-to-r from-pepo-honey to-pepo-nature text-white font-semibold rounded-lg hover:shadow-lg transition">
            Join Our Team
          </a>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
