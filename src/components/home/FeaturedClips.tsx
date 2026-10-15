import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { heroApi } from '../../api/heroApi';
import ClipPlayer, { type ClipRatioInfo } from '../ClipPlayer';
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
  // Layout follows the active clip's shape; kept until the next clip's
  // metadata loads so switching never collapses the section.
  const [isPortrait, setIsPortrait] = useState(false);

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

  const handleRatio = (info: ClipRatioInfo) =>
    setIsPortrait(prev => (prev === info.isPortrait ? prev : info.isPortrait));

  const hasMeta = !!(current.title || current.subtitle || current.slug);

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
            className="flex items-center text-slate-700 font-bold border-b-2 border-brand-200
              hover:border-fuchsia-600 transition-all pb-1 uppercase text-[11px] tracking-[0.2em]"
          >
            View all clips <ArrowRight className="w-3 h-3 ml-2" />
          </Link>
        </div>

        <div className="mx-auto max-w-6xl">
        {/* One grid, always the same DOM shape, so the player never remounts
            when the layout flips between portrait (2-col) and landscape (stack). */}
        <div
          className={`grid grid-cols-1 gap-8 ${
            isPortrait ? 'lg:grid-cols-2 lg:items-center lg:gap-12' : ''
          }`}
        >
          <div className="min-w-0 w-full">
            {inView ? (
              <ClipPlayer
                src={current.url}
                title={current.title}
                autoPlay
                onRatioChange={handleRatio}
              />
            ) : (
              <div className="mx-auto w-full max-w-[720px] aspect-video rounded-2xl overflow-hidden
                flex items-center justify-center bg-linear-to-br from-[#5b0064] to-[#712ae2]">
                <span className="w-16 h-16 rounded-full bg-white/90 text-[#5b0064]
                  flex items-center justify-center shadow-lg">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </span>
              </div>
            )}
          </div>

          <div className={`min-w-0 ${isPortrait ? 'text-center lg:text-left' : 'text-center mx-auto max-w-3xl'}`}>
            {isPortrait && (
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#712ae2] mb-3">
                Short clip
              </p>
            )}

            {hasMeta && (
              <>
                {current.title && (
                  <h3 className="text-2xl sm:text-3xl font-serif font-medium text-slate-900 leading-snug">
                    {current.title}
                  </h3>
                )}
                {current.subtitle && (
                  <p className="mt-3 text-slate-500 leading-relaxed">{current.subtitle}</p>
                )}
              </>
            )}

            {current.slug && (
              <div className={`mt-6 flex ${isPortrait ? 'justify-center lg:justify-start' : 'justify-center'}`}>
                <Link
                  to={`/clips/${current.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full
                    bg-[#5b0064] text-white text-[11px] font-bold uppercase tracking-widest
                    shadow-lg transition-all hover:bg-[#712ae2] hover:-translate-y-0.5
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-600"
                >
                  {current.hasWriteUp ? 'Watch and read' : 'Watch'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {count > 1 && (
              <div className={`mt-8 flex items-center gap-5 ${isPortrait ? 'justify-center lg:justify-start' : 'justify-center'}`}>
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
        </div>
      </div>
    </section>
  );
};

export default FeaturedClips;
