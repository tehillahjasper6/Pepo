import Navigation from '../components/layout/Navigation'
import HeroSection from '../components/sections/HeroSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import WhyPepoSection from '../components/sections/WhyPepoSection'
import CommunitySection from '../components/sections/CommunitySection'
import StatsSection from '../components/sections/StatsSection'
import CTASection from '../components/sections/CTASection'
import Footer from '../components/layout/Footer'
import BeeHexBackground from '../components/BeeHexBackground'

function HomePage() {
  return (
    <div className="font-sans bg-yellow-50 relative overflow-hidden">
      <BeeHexBackground />
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <WhyPepoSection />
      <CommunitySection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default HomePage
