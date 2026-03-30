import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Heart, ChevronDown, ShieldCheck,
  UserCircle, Play, Calendar, BookOpen, Bell,
  Users, MapPin, HandHeart, Globe, Home,
  Flame, ArrowRight, Phone
} from 'lucide-react';
import logo from '../assets/flames.jpg';
import { useAuth } from '../context/AuthContext';

// ─── NAV DATA ──────────────────────────────────────────────────────────────────

const ABOUT_LINKS = [
  { label: 'Our Story',     path: '/our-story',     desc: 'How Global Flame began',   icon: <Flame className="w-4 h-4" /> },
  { label: 'Our Mission',   path: '/our-mission',   desc: 'What drives us forward',   icon: <Globe className="w-4 h-4" /> },
  { label: 'Senior Pastor', path: '/senior-pastor', desc: 'Apostle Danjuma Musa',     icon: <UserCircle className="w-4 h-4" /> },
  { label: 'Co-Pastor',     path: '/co-pastor',     desc: 'Apostle Faith Musa',       icon: <UserCircle className="w-4 h-4" /> },
  { label: 'Core Beliefs',  path: '/core-beliefs',  desc: 'What we stand on',         icon: <ShieldCheck className="w-4 h-4" /> },
];

const EXPLORE_MINISTRIES = [
  { label: 'All Ministries',      path: '/ministries',                     desc: 'Overview of all arms' },
  { label: 'Daughters of Honour', path: '/ministries/daughters-of-honour', desc: 'Women empowerment' },
  { label: 'Global Choir',        path: '/ministries/global-choir',        desc: 'Worship & music' },
  { label: 'Home of Love',        path: '/ministries/home-of-love',        desc: 'Family & care' },
  { label: 'Youth Community',     path: '/youth',                          desc: 'House of Opra' },
];

const EXPLORE_CHURCH_LIFE = [
  { label: 'Events',          path: '/events',          icon: <Calendar className="w-4 h-4" /> },
  { label: 'Contact',         path: '/contact',         icon: <Phone className="w-4 h-4" /> },
  { label: 'Prayer Request',  path: '/prayer-request',  icon: <HandHeart className="w-4 h-4" /> },
];

const EXPLORE_QUICKLINKS = [
  { label: 'Find Us',           path: '/contact',    icon: <MapPin className="w-4 h-4" /> },
  { label: 'First Timer Guide', path: '/our-story',  icon: <Home className="w-4 h-4" /> },
  { label: 'Volunteer',         path: '/contact',    icon: <Users className="w-4 h-4" /> },
  { label: 'Community',         path: '/ministries', icon: <Globe className="w-4 h-4" /> },
];

const MEDIA_LINKS = [
  { label: 'Sermons', path: '/sermons',       icon: <Play className="w-4 h-4" />,     desc: 'Messages & teachings' },
  { label: 'Books',   path: '/books',         icon: <BookOpen className="w-4 h-4" />, desc: 'Literature & resources' },
  { label: 'News',    path: '/announcements', icon: <Bell className="w-4 h-4" />,     desc: 'Updates & announcements' },
];

// ─── DROPDOWN COMPONENT ────────────────────────────────────────────────────────

interface DropdownProps {
  label: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ label, children, isActive }) => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleMouseEnter = () => { clearTimeout(timeoutRef.current); setOpen(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 150); };
  const handleClick = () => setOpen(false);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <button
        className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest
          transition-colors whitespace-nowrap py-2 px-1
          ${isActive || open ? 'text-fuchsia-600' : 'text-slate-800 hover:text-fuchsia-600'}`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute top-full left-0 pt-3 transition-all duration-200 z-50
          ${open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      >
        {children}
      </div>
    </div>
  );
};

// ─── MAIN NAVBAR ──────────────────────────────────────────────────────────────

const Navbar: React.FC = () => {
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [megaOpen, setMegaOpen]           = useState(false);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSection(null);
    setMegaOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleGiveClick = () => {
    if (!isAuthenticated) navigate('/login', { state: { from: '/give' } });
    else navigate('/give');
  };

  const handleMegaEnter = () => { clearTimeout(megaTimeoutRef.current); setMegaOpen(true); };
  const handleMegaLeave = () => { megaTimeoutRef.current = setTimeout(() => setMegaOpen(false), 150); };
  const handleMegaLinkClick = () => setMegaOpen(false);

  const isAboutActive   = ['/our-story', '/our-mission', '/senior-pastor', '/co-pastor', '/core-beliefs'].includes(location.pathname);
  const isMediaActive   = ['/sermons', '/books', '/announcements'].includes(location.pathname);
  const isExploreActive = ['/ministries', '/events', '/contact', '/youth', '/prayer-request'].some(p =>
    location.pathname.startsWith(p));

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-2'
          : 'bg-white py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">

            {/* ── LOGO ───────────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <img
                src={logo}
                alt="GFM"
                className={`rounded-full object-cover transition-all duration-300 ring-2 ring-fuchsia-100
                  ${scrolled ? 'h-9 w-9' : 'h-11 w-11'}`}
              />
              <div className="hidden lg:block">
                <span className="font-serif text-base font-bold text-slate-900 tracking-tight block leading-none">
                  Global Flame
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-fuchsia-500 block mt-0.5">
                  Ministries
                </span>
              </div>
            </Link>

            {/* ── DESKTOP NAV ────────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-8">

              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-[11px] font-black uppercase tracking-widest transition-colors py-2 px-1
                  ${isActive ? 'text-fuchsia-600' : 'text-slate-800 hover:text-fuchsia-600'}`}
              >
                Home
              </NavLink>

              <Dropdown label="About" isActive={isAboutActive}>
                <div className="bg-white border border-slate-100 shadow-xl rounded-xl w-64 overflow-hidden">
                  <div className="p-2">
                    {ABOUT_LINKS.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-fuchsia-50 group transition-colors"
                      >
                        <span className="mt-0.5 text-fuchsia-400 group-hover:text-fuchsia-600 transition-colors shrink-0">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Dropdown>

              {/* Explore mega menu trigger */}
              <div
                className="relative"
                onMouseEnter={handleMegaEnter}
                onMouseLeave={handleMegaLeave}
              >
                <button
                  className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest
                    transition-colors whitespace-nowrap py-2 px-1
                    ${isExploreActive || megaOpen
                      ? 'text-fuchsia-600'
                      : 'text-slate-800 hover:text-fuchsia-600'}`}
                >
                  Explore
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <Dropdown label="Media" isActive={isMediaActive}>
                <div className="bg-white border border-slate-100 shadow-xl rounded-xl w-56 overflow-hidden">
                  <div className="p-2">
                    {MEDIA_LINKS.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-fuchsia-50 group transition-colors"
                      >
                        <span className="text-fuchsia-400 group-hover:text-fuchsia-600 transition-colors">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-slate-400">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Dropdown>

              <button
                onClick={handleGiveClick}
                className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest
                  text-fuchsia-600 hover:text-white hover:bg-fuchsia-600 transition-all
                  border border-fuchsia-200 hover:border-fuchsia-600 px-4 py-2 rounded-full
                  whitespace-nowrap"
              >
                <Heart className="w-3 h-3 fill-current" />
                Give
              </button>
            </div>

            {/* ── AUTH (desktop) ──────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-200 pl-5 ml-2">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase
                        tracking-widest text-fuchsia-600 hover:text-fuchsia-800 transition-colors"
                    >
                      <ShieldCheck size={13} /> Dashboard
                    </Link>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Hi, {user?.firstName}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-slate-900 text-white px-3 py-1.5 text-[10px] font-black
                      uppercase tracking-widest hover:bg-red-600 transition-all rounded-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-[10px] font-black uppercase tracking-widest text-slate-700
                      hover:text-fuchsia-600 transition-colors px-3 py-1.5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-slate-900 text-white px-4 py-1.5 text-[10px] font-black
                      uppercase tracking-widest hover:bg-fuchsia-600 transition-all rounded-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* ── MOBILE HAMBURGER ───────────────────────────────────── */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ── MEGA MENU ────────────────────────────────────────────────── */}
        <div
          className={`absolute top-full left-0 w-full z-50 transition-all duration-300
            ${megaOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-3 pointer-events-none'}`}
          onMouseEnter={handleMegaEnter}
          onMouseLeave={handleMegaLeave}
          onClick={handleMegaLinkClick}
        >
          <div className="bg-white border-t border-b border-slate-100 shadow-2xl">
            <div className="max-w-7xl mx-auto px-8 py-10">
              <div className="grid grid-cols-3 gap-12">

                {/* Column 1 — Ministries */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-5">
                    Ministries
                  </p>
                  <ul className="space-y-1">
                    {EXPLORE_MINISTRIES.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.path}
                          className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-fuchsia-50 transition-colors"
                        >
                          <ArrowRight className="w-3 h-3 text-fuchsia-300 group-hover:text-fuchsia-500 mt-1 shrink-0 transition-colors" />
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-fuchsia-700 transition-colors">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2 — Church Life (Prayer Request lives here) */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-5">
                    Church Life
                  </p>
                  <ul className="space-y-1">
                    {EXPLORE_CHURCH_LIFE.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.path}
                          className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-fuchsia-50 transition-colors"
                        >
                          <span className="text-fuchsia-300 group-hover:text-fuchsia-500 transition-colors">
                            {item.icon}
                          </span>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-fuchsia-700 transition-colors">
                            {item.label}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* CTA card */}
                  <div className="mt-6 border border-fuchsia-100 bg-fuchsia-50 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-fuchsia-400 mb-1.5">
                      Join Us
                    </p>
                    <p className="font-serif text-slate-800 text-base leading-snug mb-3">
                      Experience the{' '}
                      <span className="italic text-fuchsia-600">Divine Presence</span>
                    </p>
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-1.5 text-[10px] font-black
                        uppercase tracking-widest text-fuchsia-600 hover:text-fuchsia-800
                        transition-colors group"
                    >
                      See Events
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Column 3 — Quick Links + Service Times */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-5">
                    Quick Links
                  </p>
                  <ul className="space-y-1">
                    {EXPLORE_QUICKLINKS.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.path}
                          className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-fuchsia-50 transition-colors"
                        >
                          <span className="text-fuchsia-300 group-hover:text-fuchsia-500 transition-colors">
                            {item.icon}
                          </span>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-fuchsia-700 transition-colors">
                            {item.label}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 border border-slate-100 rounded-xl p-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">
                      Service Times
                    </p>
                    <div className="space-y-2">
                      {[
                        { day: 'Tuesday',  time: 'Power Service' },
                        { day: 'Saturday', time: 'Morning Glory' },
                      ].map(s => (
                        <div key={s.day} className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">{s.day}</span>
                          <span className="text-[10px] text-fuchsia-500 font-semibold">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ──────────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-[60] transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>

        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300
            ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />

        <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl
          flex flex-col transition-transform duration-500
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src={logo} alt="GFM" className="h-9 w-9 rounded-full object-cover" />
              <div>
                <span className="font-serif text-sm font-bold text-slate-900 block leading-none">
                  Global Flame
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-fuchsia-500">
                  Ministries
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Auth strip */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-fuchsia-600"
                    >
                      <ShieldCheck size={12} /> Dashboard
                    </Link>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Hi, {user?.firstName}
                  </span>
                </div>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 text-[10px] font-black uppercase
                    tracking-widest text-slate-700 border border-slate-200 rounded-lg
                    hover:border-fuchsia-300 hover:text-fuchsia-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2.5 text-[10px] font-black uppercase
                    tracking-widest text-white bg-slate-900 rounded-lg hover:bg-fuchsia-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Give CTA */}
          <button
            onClick={() => { setMobileOpen(false); handleGiveClick(); }}
            className="flex items-center justify-center gap-2 mx-6 mt-4 py-3 bg-fuchsia-600
              text-white rounded-xl text-[10px] font-black uppercase tracking-widest
              hover:bg-fuchsia-700 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 fill-white" /> Give / Donate
          </button>

          {/* Nav sections */}
          <div className="flex-1 overflow-y-auto py-4 px-3">

            {[
              { label: 'Home',    path: '/' },
              { label: 'Contact', path: '/contact' },
              { label: 'Events',  path: '/events' },
            ].map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-3.5 rounded-xl
                  hover:bg-slate-50 transition-colors group"
              >
                <span className="text-xs font-black uppercase tracking-widest text-slate-700
                  group-hover:text-fuchsia-600 transition-colors">
                  {link.label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-fuchsia-400 transition-colors" />
              </Link>
            ))}

            {/* Prayer Request — standalone row */}
            <Link
              to="/prayer-request"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between w-full px-3 py-3.5 rounded-xl
                hover:bg-fuchsia-50 transition-colors group"
            >
              <span className="text-xs font-black uppercase tracking-widest text-slate-700
                group-hover:text-fuchsia-600 transition-colors flex items-center gap-2">
                <HandHeart className="w-4 h-4 text-fuchsia-400" />
                Prayer Request
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-fuchsia-400 transition-colors" />
            </Link>

            {/* Collapsible accordion sections */}
            {[
              {
                id: 'about',
                label: 'About',
                links: ABOUT_LINKS.map(l => ({ label: l.label, path: l.path })),
              },
              {
                id: 'explore',
                label: 'Explore',
                links: [
                  ...EXPLORE_MINISTRIES,
                  ...EXPLORE_CHURCH_LIFE.map(l => ({ label: l.label, path: l.path })),
                  ...EXPLORE_QUICKLINKS,
                ],
              },
              {
                id: 'media',
                label: 'Media',
                links: MEDIA_LINKS.map(l => ({ label: l.label, path: l.path })),
              },
            ].map(section => (
              <div key={section.id}>
                <button
                  onClick={() => setMobileSection(mobileSection === section.id ? null : section.id)}
                  className="flex items-center justify-between w-full px-3 py-3.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                    {section.label}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300
                      ${mobileSection === section.id ? 'rotate-180' : ''}`}
                  />
                </button>

                <div className={`overflow-hidden transition-all duration-300
                  ${mobileSection === section.id ? 'max-h-[600px]' : 'max-h-0'}`}>
                  <div className="pl-4 pb-2 space-y-0.5">
                    {section.links.map(link => (
                      <Link
                        key={`${section.id}-${link.label}`}
                        to={link.path}
                        onClick={() => { setMobileOpen(false); setMobileSection(null); }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-fuchsia-50 group transition-colors"
                      >
                        <div className="w-1 h-1 rounded-full bg-fuchsia-300 group-hover:bg-fuchsia-500 transition-colors shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-fuchsia-600 transition-colors">
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;