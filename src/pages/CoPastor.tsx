import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import mummy from '../assets/mummy.jpg';

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

const CoPastor: React.FC = () => {
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(300);

  const fadeStyle: React.CSSProperties = {
    opacity: 0,
    transform: 'translateY(32px)',
    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
  };

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Label + Title */}
        <div ref={r0} style={fadeStyle}>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
            Co-Pastor
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-slate-900 mb-8 leading-tight">
            PASTOR <br />
            <span className="italic text-fuchsia-600">FAITH MUSA.</span>
          </h1>
        </div>

        {/* Grid Layout */}
        <div ref={r1} style={fadeStyle}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-14">
            {/* Image Column */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl shadow-slate-200">
                <img src={mummy} alt="Apostle Faith Musa" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-3 prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-headings:text-gray-900">
              <p className="mb-6 text-justify">
                Pastor Faith Musa serves as the Co-Pastor of Global Flame Ministry alongside
                her husband, Apostle Danjuma Musa. Her name is not incidental - Faith is both
                her identity and her ministry. She moves in a remarkable grace for strengthening
                believers and calling out the potential God has placed in every person she encounters.
              </p>

              <p className="mb-6 text-justify">
                Her ministry has a particular anointing for women's empowerment, family
                wholeness, and worship. She is the driving force behind the <strong>Daughters of Honour</strong> arm
                of the ministry, a platform dedicated to raising women who are confident
                in their identity in Christ and effective in their spheres of influence.
              </p>

              <p className="mb-6 text-justify">
                Her teaching style is direct, compassionate, and deeply rooted in scripture.
                She has a gift for taking complex spiritual truths and delivering them in ways
                that are accessible, practical, and transformative.
              </p>

              <p className="mb-10 text-justify">
                Together with Apostle Danjuma Musa, she provides Global Flame Ministry with
                a balanced, complementary leadership that reflects the heart of God for both
                men and women in the body of Christ.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div ref={r2} style={fadeStyle}>
          <div className="mt-12 pt-10 border-t border-slate-100 flex flex-wrap gap-4">
            <Link
              to="/senior-pastor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600
                text-white font-bold uppercase tracking-widest text-xs
                hover:bg-fuchsia-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-fuchsia-200 rounded-lg"
            >
              Senior Pastor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/our-story"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200
                text-slate-700 font-bold uppercase tracking-widest text-xs
                hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg"
            >
              Our Story <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CoPastor;