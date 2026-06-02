import React, { useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import work3 from '../assets/auditorium.jpg';

const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

const transitionStyle: React.CSSProperties = {
  transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
};

const OurMission: React.FC = () => {
  const navigate = useNavigate();
  const rHeader = useReveal(0);
  const rImage = useReveal(100);
  const rMission = useReveal(200);
  const rVision = useReveal(300);
  const rFootnote = useReveal(400);
  const rNav = useReveal(500);
  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <SEO
        title="Our Mission"
        description="Learn about Global Flame Ministry's mission and vision to empower believers and transform communities."
        url="https://globalflameministry.org/our-mission"
      />

      {/* ================= HEADER ================= */}
      <div ref={rHeader} style={transitionStyle} className="text-center max-w-3xl mx-auto px-6 mb-16">
        <div className="w-16 h-16 bg-fuchsia-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Globe className="w-6 h-6 text-fuchsia-500" />
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
          Who We Are
        </p>

        <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-4">
          Our Mission & Vision
        </h1>

        <p className="text-slate-500 text-sm md:text-base">
          Discover the heartbeat of our ministry — why we exist and where God is leading us.
        </p>
      </div>

      {/* ================= IMAGE SECTION ================= */}
      <div ref={rImage} style={transitionStyle} className="max-w-6xl mx-auto px-6 mb-20">
        <div className="rounded-3xl overflow-hidden shadow-xl">
          <img
            src={work3}
            alt="Our Mission"
            loading="lazy"
            className="w-full h-[350px] md:h-[450px] object-cover"
          />
        </div>
      </div>

      {/* ================= MISSION & VISION ================= */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">

        {/* -------- Mission -------- */}
        <div ref={rMission} style={transitionStyle} className="bg-slate-50 rounded-3xl p-10 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-6">
            <Globe className="w-5 h-5 text-fuchsia-600" />
          </div>

          <h2 className="font-serif text-2xl text-slate-900 mb-4">
            Our Mission
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm md:text-base justify-center">
            We envision a people who will be filled with the power of the Holy Ghost,
            impact lives and make heaven.
            We also spread the love of Christ across nations,
            raising transformed lives through the Word of God, worship,
            discipleship, and compassionate outreach. 
            We are committed to building a community where faith grows, hope is restored,
            and purpose is discovered.
          </p>
        </div>

        {/* -------- Vision -------- */}
        <div ref={rVision} style={transitionStyle} className="bg-slate-50 rounded-3xl p-10 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-6">
            <Eye className="w-5 h-5 text-fuchsia-600" />
          </div>

          <h2 className="font-serif text-2xl text-slate-900 mb-4">
            Our Vision
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm md:text-base justify-center">
            To be clothed in the power of the Holy Spirit and taking
            the gospel to the nations of the world.
            To see lives empowered spiritually, families
            restored, and communities transformed through the power of
            God's presence. We envision a global movement of believers
            walking in purpose, love, and unwavering faith.
          </p>
        </div>

      </div>

      {/* ================= FOOT NOTE ================= */}
      <div ref={rFootnote} style={transitionStyle} className="text-center mt-20 px-6">
        <p className="text-slate-400 text-sm italic">
          “Impacting lives, transforming nations, advancing God's kingdom.”
        </p>
      </div>

      {/* Navigation Buttons */}
      <div ref={rNav} style={transitionStyle} className="max-w-6xl mx-auto px-6 mt-16 pt-10 border-t border-slate-100 flex flex-wrap gap-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Our Story
        </button>
        <Link to="/senior-pastor" className="inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-fuchsia-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-fuchsia-200 rounded-lg">
          Meet Senior Pastor <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default OurMission;