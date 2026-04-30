import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail, FiPhone, FiFacebook, FiInstagram, FiLinkedin,
  FiMenu, FiX, FiChevronDown,
} from 'react-icons/fi';
import logo from '../../assets/images/flames.jpg';

const ABOUT_DROPDOWN_LINKS = [
  { href: '/youth/about#mission', label: 'Our Mission' },
  { href: '/youth/about#history', label: 'Our History' },
  { href: '/youth/about#leadership', label: 'Our Leadership' },
];

const YouthHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="w-full sticky top-0 z-40" style={{ fontFamily: 'sans-serif' }}>

      {/* Top bar */}
      <div className="hidden md:flex bg-fuchsia-700 text-white text-sm py-2
                      px-6 justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-2">
            <FiMail />
            <a href="mailto:globalflameyouthcommunity@gmail.com">
              globalflameyouthcommunity@gmail.com
            </a>
          </span>
          <span className="flex items-center space-x-2">
            <FiPhone />
            <a href="tel:+2348136848041">(+234) 813 684 8041</a>
          </span>
        </div>
        <div className="flex space-x-4 text-lg">
          <a href="#" aria-label="Facebook" className="hover:text-blue-400"><FiFacebook /></a>
          <a href="#" aria-label="Instagram" className="hover:text-pink-400"><FiInstagram /></a>
          <a href="#" aria-label="LinkedIn" className="hover:text-blue-300"><FiLinkedin /></a>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center">

        {/* Logo */}
        <Link to="/youth" className="flex items-center space-x-1">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
          <h1 className="text-lg font-bold">
            <span className="text-black">GLOBAL FLAME</span>{' '}
            <span className="text-fuchsia-700">YOUTH COMMUNITY</span>
          </h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6 font-medium">
          <Link to="/youth" className="text-gray-700 hover:text-fuchsia-700">Home</Link>

          {/* About dropdown */}
          <div className="relative group">
            <button className="text-gray-700 hover:text-fuchsia-700 flex items-center">
              About Us
              <FiChevronDown className="ml-1 w-4 h-4 transition-transform
                                        group-hover:rotate-180" />
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-44
                            bg-white border border-gray-100 rounded-lg shadow-xl py-1
                            z-30 opacity-0 invisible group-hover:opacity-100
                            group-hover:visible transition-all duration-300
                            scale-95 group-hover:scale-100">
              {ABOUT_DROPDOWN_LINKS.map((link) => (
                <Link key={link.label} to={link.href}
                  className="block px-4 py-2 text-sm text-gray-700
                             hover:bg-purple-50 hover:text-purple-700 whitespace-nowrap">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/youth/services" className="text-gray-700 hover:text-fuchsia-700">Services</Link>
          <Link to="/youth/activities" className="text-gray-700 hover:text-fuchsia-700">Activities</Link>
          <Link to="/youth/team" className="text-gray-700 hover:text-fuchsia-700">Team</Link>
          <Link to="/youth/reviews" className="text-gray-700 hover:text-fuchsia-700">Reviews</Link>
          <Link to="/youth/blog" className="text-gray-700 hover:text-fuchsia-700">Blog</Link>
          <Link to="/youth/contact" className="text-gray-700 hover:text-fuchsia-700">Contact</Link>
        </nav>

        {/* CTA */}
        <Link to="/youth/about"
          className="hidden md:inline-block ml-6 bg-fuchsia-700 text-white
                     px-4 py-2 rounded hover:bg-purple-400 transition">
          Learn More
        </Link>

        {/* Hamburger */}
        <button className="md:hidden text-2xl text-fuchsia-700"
          onClick={() => setIsOpen(true)}>
          <FiMenu />
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-start">
          <div className="bg-white w-[75%] max-w-xs h-full shadow-lg
                          flex flex-col relative">
            <button className="absolute top-4 right-4 text-2xl text-fuchsia-700"
              onClick={() => setIsOpen(false)}>
              <FiX />
            </button>

            <nav className="flex flex-col space-y-4 font-medium p-6 mt-12
                            flex-1 overflow-y-auto">
              <Link to="/youth" className="text-gray-700 hover:text-fuchsia-700"
                onClick={() => setIsOpen(false)}>Home</Link>

              {/* Mobile About dropdown */}
              <div className="flex flex-col">
                <button
                  className="flex justify-between items-center text-gray-700
                             hover:text-fuchsia-600 w-full"
                  onClick={() => setIsDropdownOpen(p => !p)}>
                  About Us
                  <FiChevronDown className={`w-5 h-5 transition-transform
                    ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`flex flex-col pl-4 mt-2 transition-all duration-300
                  ${isDropdownOpen
                    ? 'max-h-40 opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  {ABOUT_DROPDOWN_LINKS.map((link) => (
                    <Link key={link.label} to={link.href}
                      className="text-gray-600 py-1 hover:text-fuchsia-600 text-sm"
                      onClick={() => setIsOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/youth/services" className="text-gray-700 hover:text-fuchsia-700"
                onClick={() => setIsOpen(false)}>Services</Link>
              <Link to="/youth/activities" className="text-gray-700 hover:text-fuchsia-700"
                onClick={() => setIsOpen(false)}>Activities</Link>
              <Link to="/youth/team" className="text-gray-700 hover:text-fuchsia-700"
                onClick={() => setIsOpen(false)}>Team</Link>
              <Link to="/youth/reviews" className="text-gray-700 hover:text-fuchsia-700"
                onClick={() => setIsOpen(false)}>Reviews</Link>
              <Link to="/youth/blog" className="text-gray-700 hover:text-fuchsia-700"
                onClick={() => setIsOpen(false)}>Blog</Link>
              <Link to="/youth/contact" className="text-gray-700 hover:text-fuchsia-700"
                onClick={() => setIsOpen(false)}>Contact</Link>

              <Link to="/youth/about"
                className="bg-fuchsia-600 text-white px-4 py-2 rounded-full
                           hover:bg-purple-600 transition text-center mt-4"
                onClick={() => setIsOpen(false)}>
                Learn More
              </Link>
            </nav>

            {/* Drawer footer */}
            <div className="bg-purple-600 text-white text-sm py-3 px-4">
              <div className="flex flex-col space-y-2">
                <span className="flex items-center space-x-2">
                  <FiMail />
                  <a href="mailto:globalflameyouthcommunity@gmail.com">
                    globalflameyouthcommunity@gmail.com
                  </a>
                </span>
                <span className="flex items-center space-x-2">
                  <FiPhone />
                  <a href="tel:+2348136848041">(+234) 813 684 8041</a>
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default YouthHeader;