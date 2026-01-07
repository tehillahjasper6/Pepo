import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import HowItWorksPage from './pages/HowItWorksPage'
import NGORegistrationPage from './pages/NGORegistrationPage'
import BrowsePage from './pages/BrowsePage'
import GivePage from './pages/GivePage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/ngo-registration" element={<NGORegistrationPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/give" element={<GivePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signin" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
