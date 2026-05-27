import React, { useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import dad from '../assets/priest.jpeg';

const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

const SeniorPastor: React.FC = () => {
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r3 = useReveal(300);

  const fadeStyle: React.CSSProperties = {
    opacity: 0,
    transform: 'translateY(32px)',
    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
  };

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <SEO
        title="Senior Pastor"
        description="Meet Apostle Danjuma Musa, the Senior Pastor of Global Flame Ministry."
        url="https://globalflameministry.org/senior-pastor"
      />
      <div className="max-w-4xl mx-auto px-6">

        {/* Label */}
        <div ref={r0} style={fadeStyle}>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
            Senior Pastor
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-slate-900 mb-8 leading-tight">
            APOSTLE <br />
            <span className="italic text-fuchsia-600">DANJUMA MUSA.</span>
          </h1>
        </div>

        {/* Grid Layout */}
        <div ref={r1} style={fadeStyle}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-14">
            {/* Image Column */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 w-full" style={{ aspectRatio: '3 / 4', position: 'relative' }}>
                <img
                  src={dad}
                  alt="Apostle Danjuma Musa"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                />
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-3 prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-blockquote:border-fuchsia-500">
              <p className="mb-6 text-justify">
                Apostle Danjuma Musa is the founding Senior Pastor of Global Flame Ministry.
                Called from a young age into the ministry of the word, he carries a rare
                combination of apostolic boldness and pastoral warmth - a man equally at home
                in the place of prayer as he is on the platform.
              </p>

              <p className="mb-8 text-justify">
                His ministry is marked by a deep reverence for the word of God, a passion for
                the lost, and an unwavering commitment to raising disciples who themselves
                become leaders. His teaching cuts through the noise of the age and speaks
                directly to the human spirit.
              </p>

              {/* Quote Box */}
              <blockquote className="my-10 p-6 bg-fuchsia-50 rounded-2xl italic font-semibold border-l-4 border-fuchsia-500 not-prose text-fuchsia-900">
                "Diligence positions a man for an enviable destiny."
              </blockquote>

              <p className="mb-6 text-justify">
                Under his leadership, Global Flame Ministry has grown from a small gathering
                into a thriving congregation with arms reaching into multiple areas of ministry.
                His vision extends beyond the walls of the church - he sees a global harvest
                and is relentless in pursuing it.
              </p>
              <p className="mb-6 text-justify">
                He is married to <strong>Co-Pastor Faith Musa</strong>, his faithful partner in ministry and
                in life, and together they lead Global Flame Ministry with a shared heart
                for people and an uncompromising love for God.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div ref={r3} style={fadeStyle}>
          <div className="mt-12 pt-10 border-t border-slate-100 flex flex-wrap gap-4">
            <Link
              to="/our-mission"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Our Mission
            </Link>
            <Link
              to="/co-pastor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-fuchsia-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-fuchsia-200 rounded-lg"
            >
              Meet Co-Pastor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeniorPastor;
