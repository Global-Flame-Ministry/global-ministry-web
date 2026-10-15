import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Clock, Pause, Play } from 'lucide-react';
import EventTimingBadge from './EventTimingBadge';

export interface HeroSlideCta {
  text: string;
  href: string;
}

/**
 * Unified hero slide model. Every slide owns its own overlay content so the
 * carousel can crossfade the text together with the image.
 *
 * - kind 'event' -> a featured conference: label, title, theme, scripture,
 *   date/location and up to two calls to action.
 * - kind 'slide' -> a plain image slide: label (from subtitle), title and an
 *   optional call to action.
 * - kind 'blog'  -> a featured blog post: department label, title, excerpt and
 *   a read-time/published meta line.
 */
export interface HeroSlideView {
  id: string | number;
  kind: 'event' | 'slide' | 'blog';
  imageUrl: string;
  imageAlt?: string;
  label: string;
  title: string;
  description?: string | null;
  theme?: string | null;
  scripture?: string | null;
  scriptureReference?: string | null;
  dateText?: string | null;
  location?: string | null;
  meta?: string | null;
  /** Optional event window (UTC ISO) used for the live timing badge. */
  eventStartsAt?: string | null;
  eventEndsAt?: string | null;
  primaryCta?: HeroSlideCta;
  secondaryCta?: HeroSlideCta;
}

interface HeroCarouselProps {
  slides: HeroSlideView[];
  intervalMs?: number;
}

export const HERO_ROTATION_MS = 8000;

// Simple opacity crossfade between slides (image and its text overlay).
const CROSSFADE_MS = 600;

// The slide copy glides in from the right on every rotation (never just pops in).
const CONTENT_IN_MS = 700;

// An image at least this wide relative to its height is treated as a landscape
// photo and cover-fitted; anything narrower is a flyer and shown whole.
const LANDSCAPE_RATIO = 1.2;

// Cloudinary videos can produce a lightweight poster with an `so_0` transform.
export const getPosterUrl = (url: string): string | undefined => {
  if (!/res\.cloudinary\.com\/.+\/video\/upload\//.test(url)) return undefined;
  return url.replace(
    /(res\.cloudinary\.com\/[^/]+\/video\/upload\/)/,
    '$1so_0,w_1920,ar_16:9,c_fill,q_auto/'
  );
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
};

// True only on devices with a real hovering pointer (desktop/laptop mouse).
// Touch devices report a coarse pointer, so we never latch a hover there.
const useFinePointer = () => {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return fine;
};

const isExternal = (href: string) =>
  /^https?:\/\//i.test(href) ||
  href.startsWith('//') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:');

/** Renders a link that opens internally with the router or externally in a new tab. */
const CtaLink: React.FC<{
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}> = ({ href, className, children, ariaLabel }) => {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} aria-label={ariaLabel} className={className}>
      {children}
    </Link>
  );
};

const CtaButton: React.FC<{ cta: HeroSlideCta; variant: 'primary' | 'secondary' }> = ({ cta, variant }) => {
  const base =
    'pointer-events-auto inline-flex items-center justify-center px-6 sm:px-7 py-3 rounded-full text-[11px] sm:text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all';
  const styles =
    variant === 'primary'
      ? 'bg-fuchsia-600 text-white shadow-lg shadow-black/30 hover:bg-fuchsia-500 hover:-translate-y-0.5'
      : 'border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm';
  return <CtaLink href={cta.href} className={`${base} ${styles}`}>{cta.text}</CtaLink>;
};

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides, intervalMs = HERO_ROTATION_MS }) => {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focusedWithin, setFocusedWithin] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [firstShown, setFirstShown] = useState(false);
  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const controlsRef = useRef<HTMLDivElement>(null);

  const count = slides.length;
  const safeIndex = count > 0 ? current % count : 0;
  const active = count > 0 ? slides[safeIndex] : null;

  // Auto-rotate every `intervalMs`. Rotation continues under prefers-reduced-
  // motion (only decorative motion is dropped) and pauses on hover, while focus
  // is inside the slide content, when the user paused it, or while the tab is
  // hidden. The controls (dots + pause button) never trigger the focus pause.
  useEffect(() => {
    if (count < 2 || paused || hovered || focusedWithin) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (timer) return;
      timer = setInterval(() => setCurrent(prev => (prev + 1) % count), intervalMs);
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
  }, [count, intervalMs, paused, hovered, focusedWithin]);

  // Measure the active image's natural aspect ratio (and only that one) so we
  // can decide between a full-bleed landscape cover and an uncropped portrait
  // flyer. This avoids downloading every slide up front.
  useEffect(() => {
    const slide = slides[safeIndex];
    if (!slide || ratios[slide.imageUrl] !== undefined) return;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled && img.naturalWidth && img.naturalHeight) {
        setRatios(prev => ({ ...prev, [slide.imageUrl]: img.naturalWidth / img.naturalHeight }));
      }
    };
    img.src = slide.imageUrl;
    return () => {
      cancelled = true;
    };
  }, [safeIndex, slides, ratios]);

  // Preload the next image only once the first slide has actually been shown.
  const nextIndex = count > 0 ? (safeIndex + 1) % count : 0;
  useEffect(() => {
    if (!firstShown || count < 2) return;
    const next = slides[nextIndex];
    if (!next) return;
    const img = new Image();
    img.src = next.imageUrl;
  }, [firstShown, nextIndex, slides, count]);

  const goTo = useCallback(
    (index: number) => setCurrent(((index % count) + count) % count),
    [count]
  );

  if (!active) return null;

  const activeRatio = ratios[active.imageUrl];
  // Until a ratio is measured we assume a flyer so we never crop it.
  const isPortrait = activeRatio === undefined || activeRatio < LANDSCAPE_RATIO;

  const primary = active.primaryCta;
  const titleLinkClass = 'pointer-events-auto hover:text-fuchsia-200 transition-colors line-clamp-3';

  const renderTitle = () =>
    primary?.href ? (
      <CtaLink href={primary.href} className={titleLinkClass}>
        {active.title}
      </CtaLink>
    ) : (
      <span className="line-clamp-3">{active.title}</span>
    );

  const showTiming =
    (active.kind === 'event' || active.kind === 'blog') &&
    (active.eventStartsAt || active.eventEndsAt);

  const align = isPortrait ? 'text-center md:text-left' : 'text-center';
  const rowAlign = isPortrait ? 'justify-center md:justify-start' : 'justify-center';
  const blockAlign = isPortrait ? 'mx-auto md:mx-0' : 'mx-auto';

  const content = (
    <div
      key={active.id}
      className={`hero-text-shadow pointer-events-none ${align}`}
      style={{
        animation: reduced
          ? undefined
          : `hero-slide-in ${CONTENT_IN_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      <div className={`flex ${rowAlign}`}>
        <span className="inline-block py-1 px-4 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-200 text-[10px] font-black uppercase tracking-[0.35em] backdrop-blur-sm">
          {active.label}
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.05] mt-4 mb-4">
        {renderTitle()}
      </h1>

      {active.kind === 'event' ? (
        <>
          {active.theme && (
            <p className={`${blockAlign} text-fuchsia-200 italic font-serif text-base sm:text-lg mb-3 line-clamp-2 max-w-2xl`}>
              Theme: {active.theme}
            </p>
          )}

          {active.scripture && (
            <blockquote className={`${blockAlign} border-l-2 border-fuchsia-400/60 pl-4 mb-4 max-w-2xl ${isPortrait ? 'text-center md:text-left border-l-0 md:border-l-2' : ''}`}>
              <p className="text-white/85 text-sm sm:text-base italic leading-relaxed line-clamp-3">
                &ldquo;{active.scripture}&rdquo;
              </p>
              {active.scriptureReference && (
                <cite className="not-italic block mt-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-fuchsia-300">
                  {active.scriptureReference}
                </cite>
              )}
            </blockquote>
          )}

          {(active.dateText || active.location) && (
            <p className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${rowAlign} text-white/75 text-xs sm:text-sm mb-5`}>
              {active.dateText && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-fuchsia-300" />
                  {active.dateText}
                </span>
              )}
              {active.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-fuchsia-300" />
                  {active.location}
                </span>
              )}
            </p>
          )}
        </>
      ) : active.kind === 'blog' ? (
        <>
          {active.description && (
            <p className={`${blockAlign} text-white/80 text-base sm:text-lg font-light tracking-wide max-w-2xl mb-4 line-clamp-2`}>
              {active.description}
            </p>
          )}

          {active.meta && (
            <p className={`flex items-center gap-2 ${rowAlign} text-white/70 text-xs sm:text-sm mb-5`}>
              <Clock className="w-4 h-4 text-fuchsia-300" />
              {active.meta}
            </p>
          )}
        </>
      ) : (
        active.description && (
          <p className={`${blockAlign} text-white/75 text-base sm:text-lg font-light tracking-wide max-w-2xl mb-6 line-clamp-3`}>
            {active.description}
          </p>
        )
      )}

      {showTiming && (
        <div className={`flex ${rowAlign} mb-5`}>
          <EventTimingBadge startsAt={active.eventStartsAt} endsAt={active.eventEndsAt} />
        </div>
      )}

      {(primary || active.secondaryCta) && (
        <div className={`flex flex-wrap items-center gap-3 ${rowAlign}`}>
          {primary && <CtaButton cta={primary} variant="primary" />}
          {active.secondaryCta && <CtaButton cta={active.secondaryCta} variant="secondary" />}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
      style={{
        paddingTop: 'calc(var(--nav-h) + clamp(1.5rem, 5vh, 3.5rem))',
        paddingBottom: '5rem',
      }}
      aria-roledescription="carousel"
      aria-label="Homepage highlights"
      onMouseEnter={finePointer ? () => setHovered(true) : undefined}
      onMouseLeave={finePointer ? () => setHovered(false) : undefined}
      onFocusCapture={event => {
        if (controlsRef.current?.contains(event.target as Node)) return;
        setFocusedWithin(true);
      }}
      onBlurCapture={event => {
        const next = event.relatedTarget as Node | null;
        if (next && controlsRef.current?.contains(next)) return;
        setFocusedWithin(false);
      }}
    >
      <style>{`
        .hero-text-shadow { text-shadow: 0 2px 18px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.6); }
        @keyframes hero-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes hero-slide-in {
          from { opacity: 0; transform: translate3d(2.5rem, 0, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
      `}</style>

      {/* Static, cheap dark-purple backdrop behind portrait flyers. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(150deg, #1c0b2e 0%, #2b0f45 45%, #0b0614 100%)' }}
      />

      {/* Landscape photos only: the active slide plus its immediate neighbours,
          crossfaded with opacity. Portrait slides keep the gradient backdrop. */}
      {slides.map((slide, index) => {
        const isActive = index === safeIndex;
        const ratio = ratios[slide.imageUrl];
        const landscape = ratio !== undefined && ratio >= LANDSCAPE_RATIO;
        const isNear =
          index === safeIndex ||
          (index - safeIndex + count) % count === 1 ||
          (safeIndex - index + count) % count === 1;

        if (!landscape || !isNear) return null;

        return (
          <div
            key={slide.id}
            className="absolute inset-0"
            aria-hidden={!isActive}
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
              transition: reduced ? 'none' : `opacity ${CROSSFADE_MS}ms ease-out`,
            }}
          >
            <img
              src={slide.imageUrl}
              alt={slide.imageAlt ?? slide.title}
              loading={isActive ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={isActive && index === 0 ? 'high' : undefined}
              onLoad={isActive && index === 0 ? () => setFirstShown(true) : undefined}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
        );
      })}

      {/* Lighter scrim: enough for legible type without blacking out the photo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-black/20 to-black/60"
      />

      {/* Active slide content, in flow so the hero grows with the content.
          Portrait flyers sit in their own column (left on desktop, on top on
          mobile) next to / above the text. */}
      <div className="relative z-20 w-full px-5 sm:px-8">
        {isPortrait ? (
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12">
            <div className="flex justify-center">
              <img
                src={active.imageUrl}
                alt={active.imageAlt ?? active.title}
                loading="eager"
                decoding="async"
                fetchPriority={safeIndex === 0 ? 'high' : undefined}
                onLoad={safeIndex === 0 ? () => setFirstShown(true) : undefined}
                className="h-auto w-auto max-w-full rounded-2xl border border-white/15 object-contain shadow-2xl max-h-[calc(100svh_-_var(--nav-h)_-_10rem)]"
                style={{ animation: reduced ? undefined : `hero-fade ${CROSSFADE_MS}ms ease-out both` }}
              />
            </div>
            <div>{content}</div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl">{content}</div>
        )}
      </div>

      {/* Controls: slide dots plus an explicit pause/play toggle. */}
      {count > 1 && (
        <div
          ref={controlsRef}
          className="absolute inset-x-0 bottom-6 z-30 flex items-center justify-center gap-3 px-4"
        >
          <div className="flex items-center gap-2.5" aria-label="Hero slides">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === safeIndex ? 'true' : undefined}
                aria-label={`Show slide ${index + 1} of ${count}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === safeIndex ? 'w-8 bg-fuchsia-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused(p => !p)}
            aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}
            aria-pressed={paused}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            {paused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
