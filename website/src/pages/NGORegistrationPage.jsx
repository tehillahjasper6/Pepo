import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

function NGORegistrationPage() {
  const [formData, setFormData] = useState({
    ngoName: '',
    email: '',
    phone: '',
    country: '',
    mission: '',
    teamSize: '',
    website: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({
      ngoName: '',
      email: '',
      phone: '',
      country: '',
      mission: '',
      teamSize: '',
      website: ''
    })
    alert('Thank you for registering! We will contact you soon.')
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Register Your <span className="gradient-text">NGO</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of organizations making a real difference in their communities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Left - Benefits */}
          <div className="lg:col-span-1 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Join Pepo?</h2>
              <p className="text-gray-600 mb-8">Get exclusive access to powerful tools designed for NGOs</p>
            </div>

            {[
              {
                icon: Mail,
                title: "Community Access",
                description: "Connect with thousands of engaged volunteers and supporters"
              },
              {
                icon: Phone,
                title: "24/7 Support",
                description: "Dedicated support team ready to help you succeed"
              },
              {
                icon: MapPin,
                title: "Global Network",
                description: "Partner with organizations worldwide to amplify impact"
              }
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-12 h-12 bg-pepo-honey/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="text-pepo-nature" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right - Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-12 rounded-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      name="ngoName"
                      value={formData.ngoName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pepo-honey focus:border-transparent"
                      placeholder="Your NGO name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pepo-honey focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pepo-honey focus:border-transparent"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pepo-honey focus:border-transparent"
                      placeholder="Your country"
                    />
                  </div>
                </div>

                {/* Mission */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mission Statement
                  </label>
                  <textarea
                    name="mission"
                    value={formData.mission}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pepo-honey focus:border-transparent"
                    placeholder="Tell us about your mission and impact"
                  ></textarea>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Team Size
                    </label>
                    <select
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pepo-honey focus:border-transparent"
                    >
                      <option value="">Select size</option>
                      <option value="1-5">1-5 people</option>
                      <option value="5-20">5-20 people</option>
                      <option value="20-50">20-50 people</option>
                      <option value="50+">50+ people</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pepo-honey focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-pepo-honey to-pepo-nature text-white font-bold rounded-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Register Your NGO
                </button>

                <p className="text-center text-sm text-gray-600">
                  By registering, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NGORegistrationPage
