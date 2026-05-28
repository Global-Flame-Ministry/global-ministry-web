import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, ArrowUp } from 'lucide-react';
import { ministryApi } from '../api/ministryApi';
import logo from '../assets/logoo.jpg';
import type { MinistryResponseDto } from '../types';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const [ministries, setMinistries] = useState<MinistryResponseDto[]>([]);

  useEffect(() => {
    ministryApi.getAll({ pageSize: 20 })
      .then(res => {
        if (res.data.isSuccess && res.data.data) {
          setMinistries(res.data.data.items);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const quickLinks = [
    { label: 'About Us',    path: '/our-story' },
    { label: 'Sermons',     path: '/sermons' },
    { label: 'Events',      path: '/events' },
    { label: 'Give Online', path: '/give' },
  ];

  const supportLinks = [
    { label: 'Contact',        path: '/contact' },
    { label: 'Prayer Request', path: '/prayer-request' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
  ];

  return (
    <footer className="bg-[#09090b] text-white pt-20 pb-12 px-6 sm:px-8">
      <div className="max-w-[1280px] mx-auto">
        {/* ─── TOP: CTA + LINKS ─── */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-24 gap-12">
          <div className="max-w-md">
            <h2 className="font-serif text-4xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Be part of something eternal.
            </h2>
            <p className="text-white/60 mb-8">
              Join our community of world-changers and experience the reality of the kingdom in your everyday life.
            </p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#5b0064] transition-colors" href="https://www.facebook.com/GlobalFlameMinistry" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#5b0064] transition-colors" href="https://www.instagram.com/globalflamemin?igsh=NGVweWQybTY4YmNm" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#5b0064] transition-colors" href="https://youtube.com/@globalflame273?si=gj50JPNrITMBZS2P" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {/* Ministries */}
            <div>
              <h4 className="font-bold mb-6 text-[#ffd6fa] uppercase tracking-widest text-sm">Ministries</h4>
              <ul className="space-y-4 text-white/60">
                {ministries.map(m => (
                  <li key={m.id}>
                    <Link to={`/ministries/${m.slug}`} className="hover:text-white cursor-pointer transition-colors">
                      {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Encounter Times */}
            <div>
              <h4 className="font-bold mb-6 text-[#ffd6fa] uppercase tracking-widest text-sm">Encounter Times</h4>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <span className="text-white text-sm">Morning Glory</span>
                  <span className="text-white/40 text-xs uppercase tracking-wider">SATURDAY • 6:30 AM</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-white text-sm">Power Service</span>
                  <span className="text-white/40 text-xs uppercase tracking-wider">TUESDAY • 3:00 PM</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-white text-sm">Counselling Hours</span>
                  <span className="text-white/40 text-xs uppercase tracking-wider">THURSDAY • 10:00 AM</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-6 text-[#ffd6fa] uppercase tracking-widest text-sm">Quick Links</h4>
              <ul className="space-y-4 text-white/60">
                {quickLinks.map(link => (
                  <li key={link.label}>
                    <Link to={link.path} className="hover:text-white cursor-pointer transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-6 text-[#ffd6fa] uppercase tracking-widest text-sm">Support</h4>
              <ul className="space-y-4 text-white/60">
                {supportLinks.map(link => (
                  <li key={link.label}>
                    <Link to={link.path} className="hover:text-white cursor-pointer transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM: BRAND + COPYRIGHT ─── */}
        <div className="border-t border-white/5 pt-12 text-center">
          <div className="mb-8 flex items-center justify-center gap-3 md:gap-5">
                <img
                  src={logo}
                  alt="Global Flame Logo"
                  className="w-10 h-10 md:w-20 md:h-20 rounded-full object-cover animate-shimmer-opacity shrink-0"
                />
                <span
                  className="font-serif text-4xl sm:text-6xl md:text-8xl font-bold animate-shimmer select-none whitespace-nowrap"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Global Flame
                </span>
              </div>
              <p className="text-white/40 text-sm">
                &copy; {year} Global Flame Ministry. All rights reserved. Designed for Excellence.
              </p>
        </div>
      </div>

      {/* ─── BACK TO TOP ─── */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#5b0064] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
};

export default Footer;
