import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { heroApi } from '../../api/heroApi';
import { getPosterUrl } from '../HeroCarousel';
import type { HeroSlide } from '../../types';

const FeaturedClips: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['featuredClips'],
    queryFn: () => heroApi.getFeaturedClips().then(res => res.data.data ?? []),
  });

  const clips: HeroSlide[] = data ?? [];
  const count = clips.length;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [index, setIndex] = useState(0);

  // Lazy-load: only mount the <video> once the section nears the viewport,
  // so the home page downloads no clip data up front.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [count]);

  if (count === 0) return null;

  // Clamp in case the featured set shrinks between renders.
  const safeIndex = Math.min(index, count - 1);
  const current = clips[safeIndex];
  const goPrev = () => setIndex((safeIndex - 1 + count) % count);
  const goNext = () => setIndex((safeIndex + 1) % count);

  return (
    <section className="py-20 bg-[#faf5ff]">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.4em] mb-3">
              Short Clips
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 leading-snug">
              The Flame in Motion
            </h2>
          </div>
          <Link
            to="/clips"
            className="inline-flex items-center text-slate-700 font-bold border-b-2 border-brand-200
              hover:border-fuchsia-600 transition-all pb-1 uppercase text-[11px] tracking-[0.2em] self-start md:self-auto"
          >
            View all clips <ArrowRight className="w-3 h-3 ml-2" />
          </Link>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
            {inView ? (
              <video
                key={current.id}
                src={current.url}
                poster={getPosterUrl(current.url)}
                controls
                preload="metadata"
                playsInline
                className="w-full h-full object-contain bg-black"
                aria-label={current.title ?? 'Featured clip'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center
                bg-linear-to-br from-[#5b0064] to-[#712ae2]">
                <span className="w-16 h-16 rounded-full bg-white/90 text-[#5b0064]
                  flex items-center justify-center shadow-lg">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </span>
              </div>
            )}
          </div>

          {(current.title || current.subtitle) && (
            <div className="mt-6 text-center px-4">
              {current.title && (
                <h3 className="font-serif text-2xl text-slate-900 leading-snug">
                  {current.title}
                </h3>
              )}
              {current.subtitle && (
                <p className="text-slate-500 text-sm mt-1.5">{current.subtitle}</p>
              )}
            </div>
          )}

          {count > 1 && (
            <div className="mt-6 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous clip"
                className="p-2.5 rounded-full border border-brand-200 text-brand-600
                  hover:bg-brand-600 hover:text-white hover:border-brand-600
                  transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span
                aria-live="polite"
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
              >
                {safeIndex + 1} of {count}
              </span>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next clip"
                className="p-2.5 rounded-full border border-brand-200 text-brand-600
                  hover:bg-brand-600 hover:text-white hover:border-brand-600
                  transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedClips;
