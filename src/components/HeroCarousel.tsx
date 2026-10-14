import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

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
  primaryCta?: HeroSlideCta;
  secondaryCta?: HeroSlideCta;
}

interface HeroCarouselProps {
  slides: HeroSlideView[];
  intervalMs?: number;
}

export const HERO_ROTATION_MS = 5000;

// Crossfade duration for both the image and its text overlay.
const CROSSFADE_MS = 1000;

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
  const [focused, setFocused] = useState(false);
  const reduced = usePrefersReducedMotion();

  const count = slides.length;
  const safeIndex = count > 0 ? current % count : 0;
  const active = count > 0 ? slides[safeIndex] : null;

  // Auto-rotate every `intervalMs`. Pauses on hover, on focus and while the tab
  // is hidden. Disabled entirely for a single slide or reduced-motion users.
  useEffect(() => {
    if (count < 2 || reduced || hovered || focused) return;

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
  }, [count, intervalMs, reduced, hovered, focused]);

  // Preload the next image so transitions are seamless.
  const nextIndex = count > 0 ? (safeIndex + 1) % count : 0;
  useEffect(() => {
    const next = slides[nextIndex];
    if (!next) return;
    const img = new Image();
    img.src = next.imageUrl;
  }, [nextIndex, slides]);

  const goTo = useCallback(
    (index: number) => setCurrent(((index % count) + count) % count),
    [count]
  );

  if (!active) return null;

  const kenBurns = !reduced;
  const primary = active.primaryCta;
  const titleLinkClass =
    'pointer-events-auto hover:text-fuchsia-200 transition-colors line-clamp-3';

  // Title links to the primary CTA when one exists; otherwise it is plain text
  // (e.g. an image slide with no target URL, so we never render a dead link).
  const renderTitle = () =>
    primary?.href ? (
      <CtaLink href={primary.href} className={titleLinkClass}>
        {active.title}
      </CtaLink>
    ) : (
      <span className="line-clamp-3">{active.title}</span>
    );

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Homepage highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      <style>{`
        .hero-text-shadow { text-shadow: 0 2px 18px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.55); }
        @keyframes hero-content-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-kenburns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, 0.5%); }
        }
      `}</style>

      {/* Slide images: a contained foreground over a blurred full-bleed backdrop
          so portrait/wide uploads are never cropped. */}
      {slides.map((slide, index) => {
        const isActive = index === safeIndex;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
              transition: reduced ? 'none' : `opacity ${CROSSFADE_MS}ms ease-out`,
              animation:
                kenBurns && isActive
                  ? `hero-kenburns ${CROSSFADE_MS}ms ease-out both`
                  : undefined,
            }}
          >
            <img
              src={slide.imageUrl}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
            />
            <div aria-hidden className="absolute inset-0 bg-black/25" />
            <img
              src={slide.imageUrl}
              alt={slide.imageAlt ?? slide.title}
              loading={isActive ? 'eager' : 'lazy'}
              className="absolute inset-0 h-full w-full object-contain object-center"
            />
          </div>
        );
      })}

      {/* Strong bottom-heavy gradient so posters with their own text stay legible */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/55 to-black/15" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

      {/* Whole-slide click target (empty areas only; buttons sit above it) */}
      {primary?.href ? (
        <CtaLink
          href={primary.href}
          ariaLabel={active.title}
          className="absolute inset-0 z-[15]"
        >
          <span className="sr-only">{primary.text}</span>
        </CtaLink>
      ) : null}

      {/* Per-slide text overlay — crossfades with the image (same timing) */}
      <div className="absolute inset-0 z-20 flex items-end sm:items-center">
        <div className="mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8 sm:pb-0 pointer-events-none">
          <div
            key={active.id}
            className="hero-text-shadow text-left"
            style={{ animation: reduced ? undefined : `hero-content-in ${CROSSFADE_MS}ms ease-out both` }}
          >
            {active.kind === 'event' ? (
              <>
                <span className="inline-block py-1 px-4 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-200 text-[10px] font-black uppercase tracking-[0.35em] mb-4 sm:mb-5 backdrop-blur-sm">
                  {active.label}
                </span>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.05] mb-4">
                  {renderTitle()}
                </h1>

                {active.theme && (
                  <p className="text-fuchsia-200 italic font-serif text-base sm:text-lg mb-3 line-clamp-2 max-w-2xl">
                    Theme: {active.theme}
                  </p>
                )}

                {active.scripture && (
                  <blockquote className="border-l-2 border-fuchsia-400/60 pl-4 mb-4 max-w-2xl">
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
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/75 text-xs sm:text-sm mb-6">
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

                {(primary || active.secondaryCta) && (
                  <div className="flex flex-wrap items-center gap-3">
                    {primary && <CtaButton cta={primary} variant="primary" />}
                    {active.secondaryCta && <CtaButton cta={active.secondaryCta} variant="secondary" />}
                  </div>
                )}
              </>
            ) : active.kind === 'blog' ? (
              <>
                {active.label && (
                  <span className="inline-block py-1 px-4 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-200 text-[10px] font-black uppercase tracking-[0.35em] mb-4 sm:mb-5 backdrop-blur-sm">
                    {active.label}
                  </span>
                )}

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.05] mb-4">
                  {renderTitle()}
                </h1>

                {active.description && (
                  <p className="text-white/80 text-base sm:text-lg font-light tracking-wide max-w-2xl mb-4 line-clamp-2">
                    {active.description}
                  </p>
                )}

                {active.meta && (
                  <p className="flex items-center gap-2 text-white/70 text-xs sm:text-sm mb-6">
                    <Clock className="w-4 h-4 text-fuchsia-300" />
                    {active.meta}
                  </p>
                )}

                {(primary || active.secondaryCta) && (
                  <div className="flex flex-wrap items-center gap-3">
                    {primary && <CtaButton cta={primary} variant="primary" />}
                    {active.secondaryCta && <CtaButton cta={active.secondaryCta} variant="secondary" />}
                  </div>
                )}
              </>
            ) : (
              <>
                {active.label && (
                  <span className="inline-block py-1 px-4 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-200 text-[10px] font-black uppercase tracking-[0.35em] mb-4 sm:mb-5 backdrop-blur-sm">
                    {active.label}
                  </span>
                )}

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.05] mb-4">
                  {renderTitle()}
                </h1>

                {active.description && (
                  <p className="text-white/75 text-base sm:text-lg font-light tracking-wide max-w-2xl mb-7 line-clamp-3">
                    {active.description}
                  </p>
                )}

                {(primary || active.secondaryCta) && (
                  <div className="flex flex-wrap items-center gap-3">
                    {primary && <CtaButton cta={primary} variant="primary" />}
                    {active.secondaryCta && <CtaButton cta={active.secondaryCta} variant="secondary" />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Indicator: active dot is a wider pill (hidden for a single slide) */}
      {count > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5"
          aria-label="Hero slides"
        >
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
      )}
    </div>
  );
};

export default HeroCarousel;
