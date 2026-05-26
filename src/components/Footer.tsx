import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook, Instagram, Youtube, Mail, MapPin,
  Phone, Heart, ArrowRight
} from 'lucide-react';
import { CHURCH_NAME } from '../constants';
import { ministryApi } from '../api/ministryApi';
import type { MinistryResponseDto } from '../types';

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────────────────────

const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.8s ease-out ${delay}ms, transform 0.8s ease-out ${delay}ms`;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

// ─── BIG TEXT SCROLL REVEAL ───────────────────────────────────────────────────

const useBigTextReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateX(-80px)';
    el.style.transition = 'opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1)';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  // Fetch published ministries dynamically — same pattern as the Navbar
  const [ministries, setMinistries] = useState<MinistryResponseDto[]>([]);

  useEffect(() => {
    ministryApi.getAll({ pageSize: 20 })
      .then(res => {
        if (res.data.isSuccess && res.data.data) {
          setMinistries(res.data.data.items);
        }
      })
      .catch(() => {
        // Silent fail — footer links just won't show if server is down
      });
  }, []);

  const rCta        = useReveal(0);
  const rBrand      = useReveal(100);
  const rMinistries = useReveal(150);
  const rDiscover   = useReveal(200);
  const rNewsletter = useReveal(250);
  const rBottom     = useReveal(0);
  const rBigText    = useBigTextReveal();

  return (
    <footer className="bg-[#09090b] text-slate-400 overflow-hidden">

      {/* ── TOP CTA BAND ─────────────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div ref={rCta} className="flex flex-col md:flex-row items-center
            justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]
                text-fuchsia-500 mb-2">
                Join Us
              </p>
              <h2 className="text-2xl md:text-3xl font-serif text-white">
                Be part of something{' '}
                <span className="italic text-fuchsia-400">eternal.</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/register"
                className="px-6 py-3 bg-fuchsia-600 text-white text-[10px]
                  font-black uppercase tracking-widest hover:bg-fuchsia-500
                  transition-colors rounded-sm"
              >
                Join the Community
              </Link>
              <Link
                to="/give"
                className="px-6 py-3 border border-white/10 text-white
                  text-[10px] font-black uppercase tracking-widest
                  hover:border-fuchsia-500 hover:text-fuchsia-400
                  transition-colors rounded-sm flex items-center gap-2"
              >
                <Heart className="w-3 h-3 fill-fuchsia-500 text-fuchsia-500" />
                Give
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER GRID ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">

          {/* Brand / Social / Contact — full width on mobile */}
          <div ref={rBrand} className="col-span-2 lg:col-span-1 space-y-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em]
                text-fuchsia-500 mb-4">
                Follow Us
              </p>
              <div className="flex items-center gap-3">
                {[
                  {
                    icon: <Facebook className="w-4 h-4" />,
                    href: 'https://www.facebook.com/GlobalFlameMinistry',
                    label: 'Facebook'
                  },
                  {
                    icon: <Instagram className="w-4 h-4" />,
                    href: 'https://www.instagram.com/globalflamemin?igsh=NGVweWQybTY4YmNm',
                    label: 'Instagram'
                  },
                  {
                    icon: <Youtube className="w-4 h-4" />,
                    href: 'https://youtube.com/@globalflame273?si=gj50JPNrITMBZS2P',
                    label: 'YouTube'
                  },
                ].map(social => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-fuchsia-600
                      flex items-center justify-center text-slate-400
                      hover:text-white transition-all duration-300"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  icon: <MapPin className="w-4 h-4 shrink-0 text-fuchsia-500" />,
                  text: 'Zarmaganda, Diye, Off Rayfield Road, Jos, Plateau State, Nigeria'
                },
                {
                  icon: <Phone className="w-4 h-4 shrink-0 text-fuchsia-500" />,
                  text: '(+234) 813 816 3685'
                },
                {
                  icon: <Mail className="w-4 h-4 shrink-0 text-fuchsia-500" />,
                  text: 'info@globalflameministry.org'
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-xs
                  text-slate-500">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── MINISTRIES — dynamic from API ─────────────────────── */}
          <div ref={rMinistries} className="col-span-1">
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em]
              text-fuchsia-500 mb-5">
              DEPARTMENTS
            </h4>
            <ul className="space-y-3">

              {/* Dynamic ministry links from the backend */}
              {ministries.map(ministry => (
                <li key={ministry.id}>
                  <Link
                    to={`/ministries/${ministry.slug}`}
                    className="text-sm text-slate-500 hover:text-fuchsia-400
                      transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100
                      -translate-x-2 group-hover:translate-x-0 transition-all
                      duration-200 text-fuchsia-500 shrink-0" />
                    {ministry.name}
                  </Link>
                </li>
              ))}

              {/* Youth Community is always the last link — hardcoded
                  because it lives at /youth not /ministries/:slug */}
              <li>
                <Link
                  to="/youth"
                  className="text-sm text-slate-500 hover:text-fuchsia-400
                    transition-colors flex items-center gap-2 group"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100
                    -translate-x-2 group-hover:translate-x-0 transition-all
                    duration-200 text-fuchsia-500 shrink-0" />
                  Youth Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div ref={rDiscover} className="col-span-1">
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em]
              text-fuchsia-500 mb-5">
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
                    className="text-sm text-slate-500 hover:text-fuchsia-400
                      transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100
                      -translate-x-2 group-hover:translate-x-0 transition-all
                      duration-200 text-fuchsia-500 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter — full width on mobile */}
          <div ref={rNewsletter} className="col-span-2 lg:col-span-1">
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em]
              text-fuchsia-500 mb-5">
              Stay Inspired
            </h4>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Get daily encouragement and ministry updates sent to your inbox.
            </p>
            <form className="space-y-2" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 text-white
                  px-4 py-3 rounded-lg text-sm placeholder-slate-600
                  focus:outline-none focus:border-fuchsia-500/50
                  focus:bg-white/8 transition-all"
              />
              <button
                type="submit"
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white
                  px-4 py-3 rounded-lg text-[10px] font-black uppercase
                  tracking-widest transition-colors"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-8 border-t border-white/5 pt-6">
              <p className="text-[9px] font-black uppercase tracking-[0.4em]
                text-slate-600 mb-4">
                Service Times
              </p>
              <div className="space-y-2">
                {[
                  { day: 'Tuesday',  service: 'Power Service', Time: '3pm' },
                  { day: 'Saturday', service: 'Morning Glory', Time: '7am'},
                  {day: 'Thursday', service: 'Counselling', Time: '10am'},
                ].map(s => (
                  <div key={s.day} className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400">
                      {s.day}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-wider block">
                        {s.service}
                      </span>
                      <span className="text-[10px] text-slate-500">{s.Time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── OVERSIZED BRAND NAME ─────────────────────────────────────── */}
      <div className="border-t border-white/5 overflow-hidden">
        <div ref={rBigText}>
          <p className="text-center text-slate-500 text-sm leading-relaxed
            pt-10 pb-4 px-6">
            Raising a people who will manifest the Kingdom.{' '}
            <span className="text-slate-400">
              A global movement ignited by the Holy Spirit since 1999.
            </span>
          </p>
          <p
            className="font-black select-none leading-none whitespace-nowrap
              text-center"
            style={{
              fontSize: 'clamp(60px, 13vw, 180px)',
              letterSpacing: '-0.03em',
              paddingBottom: '0.05em',
              background: 'linear-gradient(135deg, #ffffff 0%, #e879f9 50%, #a21caf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            aria-hidden="true"
          >
            Global Flame
          </p>
        </div>
      </div>

      {/* ── BOTTOM BAR ───────────────────────────────────────────────── */}
      <div ref={rBottom} className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center
            justify-between gap-4">
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
                  className="text-xs text-slate-600 hover:text-fuchsia-400
                    transition-colors"
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