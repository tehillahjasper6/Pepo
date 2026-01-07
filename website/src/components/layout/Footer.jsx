import React from 'react';
import { Heart, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold">Pepo</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Share what you have. Change what's possible. A fair, transparent platform for generosity.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Product</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-yellow-400 transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-yellow-400 transition-colors">About</Link></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* For Organizations */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">For Organizations</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/ngo" className="hover:text-yellow-400 transition-colors">NGO Registration</Link></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Charity Programs</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Bulk Giveaways</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Impact Reports</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Get in Touch</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2 hover:text-yellow-400 transition-colors cursor-pointer">
                <Mail size={16} />
                hello@pepo.com
              </li>
              <li className="flex items-center gap-2 hover:text-yellow-400 transition-colors cursor-pointer">
                <MapPin size={16} />
                Global Community
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8 mb-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <p>&copy; 2025 Pepo. All rights reserved. Generosity without bias.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-yellow-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
