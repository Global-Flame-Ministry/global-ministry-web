import React, { useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import { ShieldCheck } from 'lucide-react';

const beliefs = [
  {
    title: 'The Holy Scripture',
    body: 'We believe the Bible is the inspired, infallible, and authoritative Word of God. It is the supreme standard by which all human conduct, creeds, and opinions shall be tried.',
  },
  {
    title: 'Discipleship',
    body: 'We believe every believer is called to grow into the likeness of Christ through intentional discipleship — studying the Word, sitting under sound teaching, serving others, and reproducing their faith in the lives of those around them. Disciples make disciples.',
  },
  {
    title: 'The Trinity',
    body: 'We believe in one God, eternally existent in three persons — Father, Son, and Holy Spirit. Each person is fully God, yet there is one God.',
  },
  {
    title: 'The Person of Jesus Christ',
    body: 'We believe in the deity of our Lord Jesus Christ, in His virgin birth, in His sinless life, in His miracles, in His atoning death, in His bodily resurrection, in His ascension to the right hand of the Father, and in His personal return to power and glory.',
  },
  {
    title: 'Salvation by Grace',
    body: 'We believe that for the salvation of lost and sinful people, regeneration by the Holy Spirit is absolutely essential. Salvation is by grace alone, through faith alone, in Christ alone.',
  },
  {
    title: 'The Holy Spirit',
    body: 'We believe in the present ministry of the Holy Spirit, by whose indwelling the Christian is enabled to live a godly life and exercise gifts for the building up of the body of Christ.',
  },
  {
    title: 'The Resurrection',
    body: 'We believe in the resurrection of both the saved and the lost — they that are saved unto the resurrection of life, and they that are lost unto the resurrection of damnation.',
  },
  {
    title: 'The Spiritual Unity of Believers and partnerships',
    body: 'We believe in the spiritual unity of believers in our Lord Jesus Christ. All who are born again are members of the body of Christ, regardless of denominational affiliation.',
  },
  {
    title: 'Prayer',
    body: 'We believe in the power of prayer and its central role in the life of every believer and the corporate life of the church. Prayer is both a privilege and a responsibility.',
  },
];

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

const CoreBeliefs: React.FC = () => {
  const rHeader = useReveal(0);
  const fadeStyle: React.CSSProperties = {
    opacity: 0,
    transform: 'translateY(32px)',
    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
  };

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <SEO
        title="Core Beliefs"
        description="Explore the foundational beliefs that guide Global Flame Ministry."
        url="https://globalflameministry.org/core-beliefs"
      />
      {/* Slightly narrower container so cards don't stretch too wide — adds natural center breathing room */}
      <div className="max-w-5xl mx-auto px-8">

        <div ref={rHeader} style={fadeStyle}>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
            Core Beliefs
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-slate-900 mb-4 leading-tight">
            WHAT WE <br />
            <span className="italic text-fuchsia-600">STAND ON.</span>
          </h1>
          <p className="text-slate-500 text-lg mb-14 max-w-xl text-justify">
            These foundational beliefs are not negotiable. They are the bedrock on which
            Global Flame Ministries was built and on which it continues to stand.
          </p>
        </div>

        {/* Grid — gap-x adds horizontal breathing room between columns */}
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {beliefs.map((b, i) => (
            <div
            key={i}
            className="p-6 border border-slate-100 rounded-2xl hover:border-fuchsia-200
                hover:shadow-md transition-all duration-300 group animate-fadeUp"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-fuchsia-50 rounded-lg flex items-center justify-center
                shrink-0 mt-0.5 group-hover:bg-fuchsia-100 transition-colors">
                <ShieldCheck className="w-4 h-4 text-fuchsia-500" />
                </div>
                <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-2">
                    {b.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed text-justify">{b.body}</p>
                </div>
            </div>
            </div>
        ))}
        </div>

      </div>
    </div>
  );
};

export default CoreBeliefs;