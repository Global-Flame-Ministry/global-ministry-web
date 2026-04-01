import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook, Instagram, Youtube, Mail, MapPin,
  Phone, Heart, ArrowRight
} from 'lucide-react';
import { CHURCH_NAME } from '../constants';
import logo from '../assets/flames.jpg';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#09090b] text-slate-400">

      {/* ── TOP CTA BAND ─────────────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-2">
                Join Us
              </p>
              <h2 className="text-2xl md:text-3xl font-serif text-white">
                Be part of something <span className="italic text-fuchsia-400">eternal.</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/register"
                className="px-6 py-3 bg-fuchsia-600 text-white text-[10px] font-black
                  uppercase tracking-widest hover:bg-fuchsia-500 transition-colors rounded-sm"
              >
                Join the Community
              </Link>
              <Link
                to="/give"
                className="px-6 py-3 border border-white/10 text-white text-[10px] font-black
                  uppercase tracking-widest hover:border-fuchsia-500 hover:text-fuchsia-400
                  transition-colors rounded-sm flex items-center gap-2"
              >
                <Heart className="w-3 h-3 fill-fuchsia-500 text-fuchsia-500" /> Give
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER GRID ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="GFM" className="h-10 w-10 rounded-full object-cover
                ring-2 ring-fuchsia-500/30" />
              <div>
                <span className="font-serif text-base font-bold text-white block leading-none">
                  Global Flame
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-fuchsia-500">
                  Ministries
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              Raising a people who will manifest the Kingdom. A global movement ignited
              by the Holy Spirit since 1999.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: <Facebook className="w-4 h-4" />,  href: 'https://www.facebook.com/GlobalFlameMinistry', label: 'Facebook' },
                { icon: <Instagram className="w-4 h-4" />, href: 'https://www.instagram.com/globalflamemin?igsh=NGVweWQybTY4YmNm', label: 'Instagram' },
                { icon: <Youtube className="w-4 h-4" />,   href: 'https://youtube.com/@globalflame273?si=gj50JPNrITMBZS2P', label: 'YouTube' },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-fuchsia-600 flex items-center
                    justify-center text-slate-400 hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Contact info */}
            <div className="space-y-3 pt-2">
              {[
                {
                  icon: <MapPin className="w-4 h-4 shrink-0 text-fuchsia-500" />,
                  text: 'Zarmaganda, Diye, Off Rayfield Road, Jos, Plateau State, Nigeria'
                },
                {
                  icon: <Phone className="w-4 h-4 shrink-0 text-fuchsia-500" />,
                  text: '(+234) 815 333 0011'
                },
                {
                  icon: <Mail className="w-4 h-4 shrink-0 text-fuchsia-500" />,
                  text: 'globalflameministries@gmail.com'
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-slate-500">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ministries */}
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-5">
              Ministries
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'All Ministries',      path: '/ministries' },
                { label: 'Daughters of Honour', path: '/ministries/daughters-of-honour' },
                { label: 'Global Choir',        path: '/ministries/global-choir' },
                { label: 'Home of Love',        path: '/ministries/home-of-love' },
                { label: 'Youth Community',     path: '/youth' },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-fuchsia-400 transition-colors
                      flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100
                      -translate-x-2 group-hover:translate-x-0 transition-all duration-200
                      text-fuchsia-500 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover — /about replaced with /our-story */}
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-5">
              Discover
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Our Story',     path: '/our-story' },
                { label: 'Sermons',       path: '/sermons' },
                { label: 'Events',        path: '/events' },
                { label: 'Books',         path: '/books' },
                { label: 'News',          path: '/announcements' },
                { label: 'Contact',       path: '/contact' },
                { label: 'Give / Donate', path: '/give' },
              ].map(link => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-500 hover:text-fuchsia-400 transition-colors
                      flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100
                      -translate-x-2 group-hover:translate-x-0 transition-all duration-200
                      text-fuchsia-500 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-5">
              Stay Inspired
            </h4>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Get daily encouragement and ministry updates sent to your inbox.
            </p>
            <form className="space-y-2" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3
                  rounded-lg text-sm placeholder-slate-600 focus:outline-none
                  focus:border-fuchsia-500/50 focus:bg-white/8 transition-all"
              />
              <button
                type="submit"
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-3
                  rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Subscribe
              </button>
            </form>

            {/* Service times — Saturday corrected */}
            <div className="mt-8 border-t border-white/5 pt-6">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 mb-4">
                Service Times
              </p>
              <div className="space-y-2">
                {[
                  { day: 'Tuesday',  service: 'Power Service' },
                  { day: 'Saturday', service: 'Morning Glory' },
                ].map(s => (
                  <div key={s.day} className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400">{s.day}</span>
                    <span className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-wider">
                      {s.service}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ───────────────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © {year} {CHURCH_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>Made with</span>
              <Heart className="w-3 h-3 fill-fuchsia-500 text-fuchsia-500 mx-0.5" />
              <span>for the Kingdom</span>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: 'Privacy', path: '/our-story' },
                { label: 'Terms',   path: '/our-story' },
                { label: 'Contact', path: '/contact' },
              ].map(link => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="text-xs text-slate-600 hover:text-fuchsia-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;