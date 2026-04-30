import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import dadandmum from '../assets/dadandmum.jpg';

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

const OurStory: React.FC = () => {
  const r0 = useReveal(0);
  const r1 = useReveal(100);
  const r2 = useReveal(150);
  const r3 = useReveal(200);
  const r4 = useReveal(250);
  const r5 = useReveal(300);
  const r6 = useReveal(350);
  const r7 = useReveal(400);

  const fadeStyle: React.CSSProperties = {
    opacity: 0,
    transform: 'translateY(32px)',
    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
  };

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Label */}
        <div ref={r0} style={fadeStyle}>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
            Our History
          </p>
        </div>

        {/* Title */}
        <div ref={r1} style={fadeStyle}>
          <h1 className="font-serif text-5xl md:text-6xl text-slate-900 mb-8 leading-tight">
            HOW GLOBAL FLAME <br />
            <span className="italic text-fuchsia-600">BEGAN.</span>
          </h1>
        </div>

        {/* Hero image */}
        <div ref={r2} style={fadeStyle}>
          <div className="rounded-2xl overflow-hidden mb-14 aspect-video shadow-xl shadow-slate-100">
            <img src={dadandmum} alt="Global Flame Ministries" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-headings:text-gray-900 prose-blockquote:border-fuchsia-500 prose-blockquote:text-fuchsia-700">

          {/* Intro Paragraphs */}
          <div ref={r3} style={fadeStyle}>
            <p className="mb-8 text-justify">
              Global Flame Ministries can to birth on the 25th December 1999 — via the mandate given 
              to the president, Pastor Danjuma Musa. 
                 It was formally registered with the Corporate Affairs Commission (CAC) in 2007, under 
              the provision of Company & Allied Matters Act (CAMA) with certicate no. of registration
              NO CAC/IT/NO 263303.
              What began as a small gathering of believers hungry for God's presence has grown into a vibrant,
              multi-faceted ministry touching lives across continents.
            </p>
            <p className="mb-10 text-justify">
              Under the apostolic leadership of Apostle Danjuma Musa and Co-Pastor Faith Musa,
              the church has consistently pursued one mandate: to ignite the passion of Christ in
              the hearts of men and women worldwide. Like a flame that refuses to be extinguished,
              Global Flame Ministries has pressed forward through every season.
            </p>
          </div>

          {/* Section: Early Days */}
          <div ref={r4} style={fadeStyle}>
            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">The Early Days</h2>
            <p className="mb-6 text-justify">
              The ministry was birthed in prayer, and prayer remains its backbone. From the very
              beginning, the founding leadership understood that sustainable impact requires a
              foundation built not on the ingenuity of man but on the unshakeable word of God.

              The ministry is to raise leaders who will manifest the kingdom of God, raise strategic
              prayers over families,communities,cities, and nations, proclaiming freedom to the captives
              and opening of the prison gates to them that are bound.
            </p>
            <p className="mb-10 text-justify">
              Services were held in modest settings — borrowed halls, open-air grounds, family
              homes — yet the atmosphere was never modest. The presence of God was tangible, the
              worship was fervent, and the word of God was preached without compromise.
              To reach out to the hoepless and needy persons, orphans and widows in communities, cities 
              and nations; to help them become holistically developed as God originally intended for mankind.
            </p>
          </div>

          {/* Section: Growing into Purpose */}
          <div ref={r5} style={fadeStyle}>
            <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">Growing into Purpose</h2>
            <p className="mb-6 text-justify">
              As the congregation grew, so did the mandate. Ministries were raised up to serve
              distinct needs: daughters were empowered through the <strong>Daughters of Honour</strong> arm,
              the youth found a home in the <strong>House of Opera</strong>, worshippers found their voice in
              the <strong>Global Choir</strong>, families found care through the <strong>Home of Love</strong> ministry.,
              and sick ones found health through <strong>Mediplex</strong> ministry.
            </p>
            <p className="mb-10 text-justify">
              Today, Global Flame Ministries is not just a local church — it is a movement,
              a training ground, a place where ordinary people encounter an extraordinary God
              and are sent out to change their world.
            </p>
          </div>

          {/* Quote Section */}
          <div ref={r6} style={fadeStyle}>
            <blockquote className="mt-12 p-8 bg-fuchsia-50 rounded-2xl italic font-semibold border-l-4 border-fuchsia-500 not-prose text-fuchsia-900">
              "Faith activates God — Fear activates the Enemy."
            </blockquote>
          </div>
        </div>

        {/* CTA Section */}
        <div ref={r7} style={fadeStyle}>
          <div className="mt-16 pt-10 border-t border-slate-100 flex flex-wrap gap-4">
            <Link
              to="/senior-pastor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600
                text-white font-bold uppercase tracking-widest text-xs
                hover:bg-fuchsia-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-fuchsia-200 rounded-lg"
            >
              Meet Our Pastor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/core-beliefs"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200
                text-slate-700 font-bold uppercase tracking-widest text-xs
                hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg"
            >
              Our Core Beliefs <Flame className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OurStory;