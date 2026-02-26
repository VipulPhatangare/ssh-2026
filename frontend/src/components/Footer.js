import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">MP</span>
              </div>
              <span className="font-bold text-white">MP E-Governance</span>
            </div>
            <p className="text-sm text-gray-400">
              Empowering citizens with AI-driven governance solutions for Madhya Pradesh.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-white mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail size={16} />
                <a href="mailto:support@mpgov.in" className="hover:text-primary-400 transition-colors">
                  support@mpgov.in
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone size={16} />
                <a href="tel:1800123456" className="hover:text-primary-400 transition-colors">
                  1800-123-456
                </a>
              </li>
              <li className="flex items-start space-x-2 text-gray-400">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>Indore, Madhya Pradesh, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} Sahay AI. Made with
            <Heart size={14} className="inline-block mx-1 text-red-500" />
            for citizens
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
              Facebook
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
              LinkedIn
            </a>
            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
