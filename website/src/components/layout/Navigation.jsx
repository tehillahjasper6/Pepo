import React, { useState, useEffect } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-yellow-500 transition-colors">
              Pepo
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-yellow-500 transition-colors font-medium">
              Home
            </Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-yellow-500 transition-colors font-medium">
              How It Works
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-yellow-500 transition-colors font-medium">
              About
            </Link>
            <Link to="/ngo" className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all">
              For NGOs
            </Link>
            <Link to="/login" className="px-6 py-2 border-2 border-green-600 text-green-600 font-bold rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center justify-center">
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md pb-6 space-y-3">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-600 hover:bg-yellow-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              className="block px-4 py-2 text-gray-600 hover:bg-yellow-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/about"
              className="block px-4 py-2 text-gray-600 hover:bg-yellow-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/ngo"
              className="block px-4 py-2 text-gray-600 hover:bg-yellow-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              For NGOs
            </Link>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full mx-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg text-center block"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
