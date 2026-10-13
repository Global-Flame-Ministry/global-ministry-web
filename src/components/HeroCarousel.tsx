import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { HeroSlide } from '../types';

interface HeroCarouselProps {
  slides: HeroSlide[];
  intervalMs?: number;
}

const DEFAULT_INTERVAL = 15000;

// Cloudinary videos can produce a lightweight poster with an `so_0` transform.
export const getPosterUrl = (url: string): string | undefined => {
  if (!/res\.cloudinary\.com\/.+\/video\/upload\//.test(url)) return undefined;
  return url.replace(
    /(res\.cloudinary\.com\/[^/]+\/video\/upload\/)/,
    '$1so_0,w_1920,ar_16:9,c_fill,q_auto/'
  );
};

const useDataAwareMode = () => {
  const [imagesOnly, setImagesOnly] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const evaluate = () => {
      const nav = navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      };
      const slow =
        nav.connection?.saveData === true ||
        ['slow-2g', '2g', '3g'].includes(nav.connection?.effectiveType ?? '');
      setImagesOnly(slow);
      setReduceMotion(prefersReduced.matches);
    };
    evaluate();
    prefersReduced.addEventListener('change', evaluate);
    return () => prefersReduced.removeEventListener('change', evaluate);
  }, []);

  return { imagesOnly, reduceMotion };
};

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  intervalMs = DEFAULT_INTERVAL,
}) => {
  const [current, setCurrent] = useState(0);
  const { imagesOnly, reduceMotion } = useDataAwareMode();
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const [playable, setPlayable] = useState(false);

  const count = slides.length;
  const active = count > 0 ? slides[current % count] : null;

  // Resume/restart the timer only while the tab is visible
  useEffect(() => {
    if (count < 2 || reduceMotion) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        setCurrent(prev => (prev + 1) % count);
      }, intervalMs);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count, intervalMs, reduceMotion]);

  // Play muted loop only for the active video slide (and only when allowed);
  // pause everything else so idle clips never download full bytes.
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (imagesOnly || reduceMotion || !playable) {
        video.pause();
        return;
      }
      const isActiveVideo = index === current && slides[index]?.mediaType === 'Video';
      if (isActiveVideo) {
        video.loop = true;
        video.muted = true;
        video.play().catch(() => {
          /* autoplay blocked; will resume after a user gesture sets playable */
        });
      } else {
        video.pause();
      }
    });
  }, [current, imagesOnly, reduceMotion, playable, slides]);

  // Mark the carousel "playable" on the first user gesture so muted
  // autoplay is allowed by browser policy inside the autoplay-prone flow.
  useEffect(() => {
    const unlock = () => setPlayable(true);
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % count) + count) % count);
  }, [count]);

  const posterForActive = useMemo(() => {
    return active?.mediaType === 'Video' ? getPosterUrl(active.url) : undefined;
  }, [active]);

  if (count === 0) return null;

  const kenBurns = !reduceMotion && !imagesOnly;

  return (
    <>
      <style>{`
        @keyframes hero-kenburns {
          0%   { transform: scale(1) translate(0, 0); }
          50%  { transform: scale(1.12) translate(-1.5%, 1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
      `}</style>

      <div className="absolute inset-0 z-[5] overflow-hidden" aria-hidden={!playable || imagesOnly}>
        {slides.map((slide, index) => {
          const isActive = index === current;
          const opacity = isActive ? 1 : 0;

          if (slide.mediaType === 'Video') {
            const poster = getPosterUrl(slide.url);
            const showStatic =
              imagesOnly || reduceMotion || (!isActive && !playable);

            if (showStatic && poster) {
              return (
                <img
                  key={slide.id}
                  src={poster}
                  alt={slide.title ?? 'Hero slide'}
                  loading={isActive ? 'eager' : 'lazy'}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    kenBurns && isActive ? 'kenburns' : ''
                  }`}
                  style={{ opacity, zIndex: isActive ? 1 : 0 }}
                />
              );
            }

            return (
              <video
                key={slide.id}
                ref={el => {
                  if (el) videoRefs.current.set(index, el);
                  else videoRefs.current.delete(index);
                }}
                src={slide.url}
                poster={poster}
                muted
                loop
                playsInline
                preload={isActive ? 'auto' : 'metadata'}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  kenBurns && isActive ? 'kenburns' : ''
                }`}
                style={{ opacity, zIndex: isActive ? 1 : 0 }}
              />
            );
          }

          return (
            <img
              key={slide.id}
              src={slide.url}
              alt={slide.title ?? 'Hero slide'}
              loading={isActive ? 'eager' : 'lazy'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                kenBurns && isActive ? 'kenburns' : ''
              }`}
              style={{
                opacity,
                zIndex: isActive ? 1 : 0,
                animation: kenBurns && isActive ? 'hero-kenburns 20s ease-in-out infinite' : undefined,
              }}
            />
          );
        })}

        {/* Active video poster shown while it buffers */}
        {playable && active?.mediaType === 'Video' && posterForActive && (
          <img
            src={posterForActive}
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-[0]"
            style={{ opacity: 0 }}
          />
        )}

        {/* Caption overlay */}
        {active?.title && playable && (
          <div
            key={active.id}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 text-center px-6 pointer-events-none"
          >
            <p className="text-white text-2xl md:text-4xl font-serif drop-shadow-lg">
              {active.title}
            </p>
            {active.subtitle && (
              <p className="text-white/80 text-sm md:text-base mt-2 drop-shadow">
                {active.subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Slide dots */}
      {count > 1 && (
        <div className="absolute bottom-24 right-6 z-30 flex flex-col gap-3 pointer-events-auto">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === current
                  ? 'bg-fuchsia-400 scale-125'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default HeroCarousel;