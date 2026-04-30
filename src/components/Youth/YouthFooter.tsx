import { Link } from 'react-router-dom';
import {
  Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart
} from 'lucide-react';

const YouthFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/4 h-full bg-purple-900 opacity-10
                      transform skew-y-3 -translate-x-1/4 hidden md:block" />

      <div className="max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-2 gap-y-12 gap-x-8 md:grid-cols-4 lg:gap-x-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">
              GFM <span className="text-fuchsia-500">Youth</span>
            </h3>
            <p className="text-sm leading-relaxed mb-5 border-l-4 border-fuchsia-500 pl-3">
              Raising a generation of purpose-driven leaders manifesting
              the fullness of Christ's Reality.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com/gfmyouth" target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 rounded-full text-gray-400
                           hover:text-fuchsia-500 hover:border-fuchsia-500 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/gfmyouth" target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 rounded-full text-gray-400
                           hover:text-fuchsia-500 hover:border-fuchsia-500 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/gfmyouth" target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 rounded-full text-gray-400
                           hover:text-fuchsia-500 hover:border-fuchsia-500 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5
                           border-b-2 border-fuchsia-600/50 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/youth" className="hover:text-fuchsia-400 transition-colors">Home</Link></li>
              <li><Link to="/youth/about" className="hover:text-fuchsia-400 transition-colors">About Us</Link></li>
              <li><Link to="/youth/activities" className="hover:text-fuchsia-400 transition-colors">Activities</Link></li>
              <li><Link to="/youth/team" className="hover:text-fuchsia-400 transition-colors">Our Team</Link></li>
              <li><Link to="/youth/blog" className="hover:text-fuchsia-400 transition-colors">Blog</Link></li>
              <li><Link to="/youth/contact" className="hover:text-fuchsia-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5
                           border-b-2 border-fuchsia-600/50 pb-2">
              Legal & Info
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/youth/about" className="hover:text-fuchsia-400 transition-colors">Our Story</Link></li>
              <li><Link to="/privacy" className="hover:text-fuchsia-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-fuchsia-400 transition-colors">Terms of Use</Link></li>
              <li><Link to="/faq" className="hover:text-fuchsia-400 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-5
                           border-b-2 border-fuchsia-600/50 pb-2">
              Get in Touch
            </h4>
            <address className="not-italic space-y-3 text-sm">
              <div className="flex items-start">
                <Mail className="w-4 h-4 mr-2 mt-1 text-fuchsia-500 shrink-0" />
                <a href="mailto:globalflameyouthcommunity@gmail.com"
                  className="hover:text-fuchsia-400 transition-colors">
                  globalflameyouthcommunity@gmail.com
                </a>
              </div>
              <div className="flex items-start">
                <Phone className="w-4 h-4 mr-2 mt-1 text-fuchsia-500 shrink-0" />
                <a href="tel:+2348136848041" className="hover:text-fuchsia-400 transition-colors">
                  (+234) 813 684 8041
                </a>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 text-fuchsia-500 shrink-0" />
                <p className="text-gray-400">
                  Zarmaganda, Off Rayfield Road, Jos, Plateau State
                </p>
              </div>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} GFM Youth Community. All rights reserved.{' '}
            <span className="inline-flex items-center text-xs text-gray-600 ml-2">
              Built with <Heart className="w-3 h-3 mx-1 text-red-500" /> for the Future.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default YouthFooter;