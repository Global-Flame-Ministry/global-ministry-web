import React, { useState, useEffect, useRef } from 'react';
import { Link} from 'react-router-dom';
import { ArrowRight, Loader, Users, Flame } from 'lucide-react';
import { ministryApi } from '../api/ministryApi';
import type { MinistryResponseDto } from '../types';

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
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

const fadeStyle: React.CSSProperties = {
  opacity: 0,
  transform: 'translateY(32px)',
  transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
};

// ─── REGULAR MINISTRY ROW ─────────────────────────────────────────────────────

const MinistryRow: React.FC<{
  ministry: MinistryResponseDto;
  index: number;
}> = ({ ministry, index }) => {
  const ref = useReveal(index * 100);
  return (
    <div
      ref={ref}
      style={fadeStyle}
      className={`flex flex-col lg:items-center gap-12 md:gap-20 ${
        index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
      }`}
    >
      {/* Image */}
      <div className="w-full lg:w-3/5 group overflow-hidden">
        <div className="relative overflow-hidden bg-gray-100 rounded-sm shadow-2xl"
          style={{ aspectRatio: '4/3' }}>
          {ministry.coverImageUrl ? (
            <img
              src={ministry.coverImageUrl}
              alt={ministry.name}
              className="w-full h-full object-cover object-center transition-transform
                duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-fuchsia-100
              to-purple-100 flex items-center justify-center">
              <Users className="w-16 h-16 text-fuchsia-300" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-full lg:w-2/5">
        <span className="text-xs font-black uppercase tracking-[0.3em]
          text-brand-600 mb-6 block">
          {index < 9 ? `0${index + 1}` : index + 1} — Department
        </span>
        <h3 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6
          leading-tight">
          {ministry.name}
        </h3>
        <div className="h-px w-16 bg-black mb-8" />
        <p className="text-gray-600 text-lg font-light leading-relaxed mb-4
          text-justify">
          {ministry.shortDescription}
        </p>

        {ministry.leaderName && (
          <div className="flex items-center gap-3 mb-8">
            {ministry.leaderImageUrl && (
              <img
                src={ministry.leaderImageUrl}
                alt={ministry.leaderName}
                className="w-10 h-10 rounded-full object-cover border-2
                  border-fuchsia-200"
              />
            )}
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase
                tracking-widest">
                {ministry.leaderName}
              </p>
              {ministry.leaderTitle && (
                <p className="text-xs text-slate-400">{ministry.leaderTitle}</p>
              )}
            </div>
          </div>
        )}

        <Link
          to={`/ministries/${ministry.slug}`}
          className="group/link inline-flex items-center gap-4 text-sm
            font-bold uppercase tracking-widest text-gray-900 transition-all
            outline-none"
        >
          <span className="border-b-2 border-black pb-1
            group-hover/link:border-brand-600
            group-hover/link:text-brand-600 transition-all">
            View Details & Gallery
          </span>
          <div className="w-10 h-10 rounded-full border border-gray-200
            flex items-center justify-center
            group-hover/link:bg-black group-hover/link:text-white
            transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
};

// ─── YOUTH COMMUNITY ROW ──────────────────────────────────────────────────────


// ─── EMPTY / COMING SOON STATE ────────────────────────────────────────────────
// Shown when either the server is unreachable OR there are genuinely no
// ministries in the database yet. The user never sees a technical error.

const MinistriesComingSoon: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-32 px-6
    text-center max-w-lg mx-auto">
    <div className="w-24 h-24 bg-fuchsia-50 rounded-full flex items-center
      justify-center mx-auto mb-8">
      <Flame className="w-12 h-12 text-fuchsia-300" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.4em]
      text-fuchsia-500 mb-4">
      Global Flame Ministry
    </p>
    <h2 className="font-serif text-4xl text-slate-900 mb-4 leading-tight">
      Something great is <span className="italic text-fuchsia-600">
        coming.
      </span>
    </h2>
    <p className="text-slate-400 text-base leading-relaxed mb-10">
      Our ministry departments are being set up. Each arm is a vital part
      of our mission - check back soon to discover where you belong in the
      Global Flame family.
    </p>
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Link
        to="/contact"
        className="px-8 py-3.5 bg-slate-900 hover:bg-fuchsia-600
          text-white text-[10px] font-black uppercase tracking-widest
          rounded-xl transition-all"
      >
        Get in Touch
      </Link>
      <Link
        to="/events"
        className="px-8 py-3.5 border-2 border-slate-200
          hover:border-fuchsia-300 text-slate-700 hover:text-fuchsia-600
          text-[10px] font-black uppercase tracking-widest rounded-xl
          transition-all"
      >
        View Events
      </Link>
    </div>
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const Ministries: React.FC = () => {
  const [ministries, setMinistries] = useState<MinistryResponseDto[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  // NOTE: no error state — we treat all failure modes as "empty"
  // so the user never sees a technical error message

  const rHero = useReveal(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await ministryApi.getAll({ pageSize: 50 });
        if (res.data.isSuccess && res.data.data) {
          setMinistries(res.data.data.items);
        }
        // If isSuccess is false we just leave ministries as [] — shows empty state
      } catch {
        // Server unreachable — silently fall through to empty state
        // The user sees "Something great is coming" instead of a server error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white relative animate-in fade-in duration-700">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] pt-32 pb-20 px-6">
        <div ref={rHero} style={fadeStyle}
          className="max-w-7xl mx-auto border-l border-white/20 pl-8">
          <span className="text-brand-500 uppercase tracking-[0.4em] text-xs
            font-bold mb-4 block">
            Impact & Service
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white
            tracking-tight mb-6">
            Our Departments
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg font-light
            leading-relaxed text-justify">
            Discover where you belong in the Global Flame family. Every arm
            is a vital part of our mission.
          </p>
        </div>
      </section>

      {/* ── LOADING ───────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-40">
          <Loader className="animate-spin text-fuchsia-600 w-8 h-8" />
        </div>
      )}

      {/* ── EMPTY / SERVER DOWN — graceful state ──────────────────────── */}
      {!isLoading && ministries.length === 0 && (
        <MinistriesComingSoon />
      )}

      {/* ── MINISTRY LIST ─────────────────────────────────────────────── */}
      {!isLoading && ministries.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col gap-32">
            {ministries.map((ministry, index) => (
              <MinistryRow
                key={ministry.id}
                ministry={ministry}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Ministries;