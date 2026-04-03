import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader, Users, Lock } from 'lucide-react';
import { ministryApi } from '../api/ministryApi';
import type { MinistryResponseDto } from '../types';
import { useAuth } from '../context/AuthContext';

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

// ─── REGULAR MINISTRY ROW ────────────────────────────────────────────────────

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
        <div className="relative aspect-video overflow-hidden bg-gray-100
          rounded-sm shadow-2xl">
          {ministry.coverImageUrl ? (
            <img
              src={ministry.coverImageUrl}
              alt={ministry.name}
              className="w-full h-full object-cover transition-transform
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

// ─── YOUTH COMMUNITY ROW — special hardcoded card with auth gate ─────────────

const YouthRow: React.FC<{ index: number }> = ({ index }) => {
  const ref = useReveal(index * 100);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', { state: { from: '/youth' } });
    }
  };

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
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br
          from-fuchsia-900 to-purple-900 rounded-sm shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-fuchsia-300 text-6xl font-serif italic
                font-bold opacity-30">
                House of Opra
              </p>
            </div>
          </div>
          {/* Auth badge overlay */}
          {!isAuthenticated && (
            <div className="absolute top-4 left-4 flex items-center gap-2
              bg-black/60 backdrop-blur-sm text-white text-[10px] font-black
              uppercase tracking-widest px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3" />
              Login required to access
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
          Youth Community
        </h3>
        <div className="h-px w-16 bg-black mb-8" />
        <p className="text-gray-600 text-lg font-light leading-relaxed mb-4
          text-justify">
          House of Opra — A vibrant community of young people raising a
          generation passionate about God's kingdom, excellence, and
          transformation in their communities.
        </p>

        {/* Auth notice */}
        {!isAuthenticated && (
          <div className="flex items-start gap-3 p-4 bg-fuchsia-50
            border border-fuchsia-200 rounded-xl mb-6">
            <Lock className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
            <p className="text-xs text-fuchsia-700 leading-relaxed">
              Please{' '}
              <button
                onClick={() => navigate('/login', { state: { from: '/youth' } })}
                className="font-bold underline hover:no-underline"
              >
                sign in
              </button>
              {' '}or{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-bold underline hover:no-underline"
              >
                create an account
              </button>
              {' '}to access the Youth Community.
            </p>
          </div>
        )}

        <Link
          to="/youth"
          onClick={handleViewDetails}
          className="group/link inline-flex items-center gap-4 text-sm
            font-bold uppercase tracking-widest text-gray-900 transition-all
            outline-none"
        >
          <span className="border-b-2 border-black pb-1
            group-hover/link:border-brand-600
            group-hover/link:text-brand-600 transition-all">
            {isAuthenticated ? 'View Details & Gallery' : 'Sign In to View'}
          </span>
          <div className="w-10 h-10 rounded-full border border-gray-200
            flex items-center justify-center
            group-hover/link:bg-black group-hover/link:text-white
            transition-all">
            {isAuthenticated
              ? <ArrowRight className="w-4 h-4" />
              : <Lock className="w-4 h-4" />
            }
          </div>
        </Link>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const Ministries: React.FC = () => {
  const [ministries, setMinistries] = useState<MinistryResponseDto[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const rHero = useReveal(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await ministryApi.getAll({ pageSize: 50 });
        if (res.data.isSuccess && res.data.data) {
          setMinistries(res.data.data.items);
        } else {
          setError('Could not load ministries.');
        }
      } catch {
        setError('Could not reach the server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white relative animate-in fade-in duration-700">

      {/* HERO */}
      <section className="bg-[#0a0a0a] pt-32 pb-20 px-6">
        <div ref={rHero} style={fadeStyle}
          className="max-w-7xl mx-auto border-l border-white/20 pl-8">
          <span className="text-brand-500 uppercase tracking-[0.4em] text-xs
            font-bold mb-4 block">
            Impact & Service
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white
            tracking-tight mb-6">
            Our Ministries
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg font-light
            leading-relaxed text-justify">
            Discover where you belong in the Global Flame family. Every arm
            is a vital part of our mission.
          </p>
        </div>
      </section>

      {isLoading && (
        <div className="flex items-center justify-center py-32">
          <Loader className="animate-spin text-fuchsia-600 w-8 h-8" />
        </div>
      )}

      {error && !isLoading && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl
            text-red-600 text-sm">
            ⚠️ {error}
          </div>
        </div>
      )}

      {!isLoading && !error && ministries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32
          text-center">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-serif italic text-lg">
            No ministries available yet. Check back soon.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col gap-32">
            {/* Dynamic ministries from DB */}
            {ministries.map((ministry, index) => (
              <MinistryRow
                key={ministry.id}
                ministry={ministry}
                index={index}
              />
            ))}
            {/* Youth Community — always last, hardcoded with auth gate */}
            <YouthRow index={ministries.length} />
          </div>
        </section>
      )}
    </div>
  );
};

export default Ministries;