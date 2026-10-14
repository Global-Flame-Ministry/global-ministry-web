import React, { useEffect, useState } from 'react';

/**
 * Nigeria (Africa/Lagos) has observed a fixed UTC+1 offset with no daylight
 * saving since 1919, so "converting to Lagos" only ever shifts the wall clock.
 * Using Intl keeps us correct regardless of the viewer's own timezone.
 */
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Nigeria's fixed UTC+1 offset. Event dates are stored as West Africa Time
 * wall-clock with no zone designator, whereas blog event dates are serialised in
 * UTC with an explicit "Z". Normalise both to an instant here so the badge is
 * correct for every viewer regardless of their own timezone.
 */
const NIGERIA_OFFSET = '+01:00';

const toDate = (value: string): Date =>
  /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
    ? new Date(value)
    : new Date(`${value}${NIGERIA_OFFSET}`);

export type EventTiming = 'upcoming' | 'soon' | 'live' | null;

/**
 * Resolve the badge state for the given window at `nowMs`:
 * - nothing once the event has ended,
 * - "Happening now" between start and end,
 * - "Coming up soon" within 30 days of the start,
 * - "Upcoming" further out.
 */
const resolveEventTiming = (
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
  nowMs: number
): EventTiming => {
  const start = startsAt ? toDate(startsAt).getTime() : NaN;
  const end = endsAt ? toDate(endsAt).getTime() : NaN;
  const hasStart = !Number.isNaN(start);
  const hasEnd = !Number.isNaN(end);

  if (!hasStart && !hasEnd) return null;
  if (hasEnd && nowMs > end) return null;

  if (hasStart && nowMs >= start) return 'live';
  if (!hasStart) return 'live';

  return start - nowMs <= THIRTY_DAYS_MS ? 'soon' : 'upcoming';
};

const LABELS: Record<'upcoming' | 'soon' | 'live', string> = {
  upcoming: 'Upcoming',
  soon: 'Coming up soon',
  live: 'Happening now',
};

const lagosDateTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Lagos',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const formatLagos = (value: string): string => {
  const d = toDate(value);
  return Number.isNaN(d.getTime()) ? '' : lagosDateTime.format(d);
};

interface EventTimingBadgeProps {
  startsAt?: string | null;
  endsAt?: string | null;
  className?: string;
}

/**
 * A small-caps pill that reports how close an event is, evaluated live in
 * Africa/Lagos time. It re-checks every minute (and whenever the tab becomes
 * visible again), and render nothing once the event has ended.
 */
const EventTimingBadge: React.FC<EventTimingBadgeProps> = ({ startsAt, endsAt, className = '' }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 60_000);
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const timing = resolveEventTiming(startsAt, endsAt, now);
  if (!timing) return null;

  const isLive = timing === 'live';
  const title = startsAt
    ? `${LABELS[timing]} · ${formatLagos(startsAt)} (WAT)`
    : LABELS[timing];

  return (
    <>
      <style>{`
        @keyframes etb-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        .etb-pulse { animation: etb-pulse 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .etb-pulse { animation: none !important; }
        }
      `}</style>
      <span
        title={title}
        aria-label={title}
        className={`etb-pulse inline-flex items-center gap-1.5 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-100 backdrop-blur-sm ${className}`}
      >
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-green-400' : 'bg-fuchsia-300'}`}
        />
        {LABELS[timing]}
      </span>
    </>
  );
};

export default EventTimingBadge;
