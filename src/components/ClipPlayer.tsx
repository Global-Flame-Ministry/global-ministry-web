import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { getClipPoster } from '../utils/clipPoster';

// Registry of every mounted video so only one plays at a time across the app.
const playingVideos = new Set<HTMLVideoElement>();

interface WebkitVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

interface WebkitDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

interface OrientationLock {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
}

// A clip at least this wide relative to its height is landscape and fills the
// width; anything narrower is portrait/square and is shown in its natural tall
// size against a solid dark stage.
export const LANDSCAPE_RATIO = 1.2;

// Widest a landscape clip may render (px). Overridable per instance.
const DEFAULT_MAX_WIDTH = 720;

export interface ClipRatioInfo {
  /** Natural videoWidth / videoHeight. */
  ratio: number;
  /** True when the clip is portrait or square (ratio below LANDSCAPE_RATIO). */
  isPortrait: boolean;
}

interface ClipPlayerProps {
  src: string;
  title?: string | null;
  className?: string;
  /** Start muted and attempt playback (used for in-view autoplay). Never plays with sound. */
  autoPlay?: boolean;
  /** Seconds into the clip to use as the poster frame (its own frame). Default 1.5s. */
  posterTime?: number;
  /** Widest a landscape clip may render, in px. Default 720. */
  maxWidth?: number;
  /** Called whenever the clip's natural aspect ratio becomes known. */
  onRatioChange?: (info: ClipRatioInfo) => void;
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/** Nudges the browser to render the video's own frame at `time` (no poster image needed). */
const withPosterFragment = (url: string, time: number): string =>
  url.includes('#') ? url : `${url}#t=${time}`;

/**
 * Reusable, accessible video player with custom controls.
 *
 * - The `<video>` element is the single source of truth: `isPlaying`,
 *   `isBuffering` and `isEnded` are derived from media events, never from
 *   click handlers.
 * - One click/tap on the video surface toggles playback; the centre overlay is
 *   visual only, so a tap can never fire twice.
 * - The frame is sized from the clip's natural ratio (read on `loadedmetadata`)
 *   so the whole picture is always visible — `object-contain`, never cover.
 *   Landscape clips fill the width up to `maxWidth`; portrait/square clips get
 *   their natural tall size (capped at 70svh desktop / 75svh mobile / 640px)
 *   centred on a solid dark stage. A neutral 16/9 skeleton shows until the
 *   first metadata arrives, and the previous clip's size is kept across a
 *   source change so switching clips never jumps.
 * - Derives the poster frame from the video itself at `posterTime` (Cloudinary
 *   `so_<posterTime>` or `#t=<posterTime>`), never a cover image / flyer.
 * - The centre play affordance and the bottom-left Play button run the exact
 *   same single `togglePlay`, which reads the element's own `paused` state.
 * - Keyboard: Space/K play-pause, ←/→ seek ±5s, M mute, F fullscreen.
 * - Fullscreen with pseudo-fullscreen fallback + optional landscape lock.
 * - Only one ClipPlayer anywhere on the page plays at a time.
 */
const ClipPlayer: React.FC<ClipPlayerProps> = ({
  src,
  title,
  className = '',
  autoPlay = false,
  posterTime = 1.5,
  maxWidth = DEFAULT_MAX_WIDTH,
  onRatioChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);
  // Set when a play() request was aborted by a pending load/seek so we can retry.
  const pendingPlayRef = useRef(false);
  // Keep the latest callback without re-binding the media listeners.
  const onRatioChangeRef = useRef(onRatioChange);
  useEffect(() => {
    onRatioChangeRef.current = onRatioChange;
  });

  // Poster is always the video's own frame — never a cover image.
  const poster = getClipPoster(src, posterTime);
  // For non-Cloudinary sources nudge the first frame into view with `#t=<posterTime>`.
  const effectiveSrc = poster ? src : withPosterFragment(src, posterTime);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [muted, setMuted] = useState(autoPlay);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  // Natural width/height ratio, or `null` until the first metadata loads.
  const [ratio, setRatio] = useState<number | null>(null);
  // Intrinsic height (px) so portrait clips are never upscaled past their size.
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [trackedSrc, setTrackedSrc] = useState(effectiveSrc);

  const isFullscreen = nativeFullscreen || pseudoFullscreen;

  // Reset transient state whenever the source changes (adjust during render so
  // there is no extra commit/paint cycle on the old clip). The measured ratio
  // is intentionally kept so the frame does not jump before the new metadata.
  if (trackedSrc !== effectiveSrc) {
    setTrackedSrc(effectiveSrc);
    setStatus('loading');
    setIsPlaying(false);
    setIsBuffering(false);
    setIsEnded(false);
    setCurrent(0);
    setDuration(0);
    setBuffered(0);
    setControlsVisible(true);
    setMessage(null);
  }

  // Attach media-event listeners. The <video> is the source of truth.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      for (const other of playingVideos) {
        if (other !== video) {
          try { other.pause(); } catch { /* ignore */ }
        }
      }
      playingVideos.add(video);
      setIsPlaying(true);
      setIsEnded(false);
      setIsBuffering(video.readyState < video.HAVE_FUTURE_DATA);
      setControlsVisible(false);
    };
    const onPlaying = () => { setIsPlaying(true); setIsBuffering(false); setIsEnded(false); };
    const onPause = () => { playingVideos.delete(video); setIsPlaying(false); setControlsVisible(true); };
    const onWaiting = () => setIsBuffering(true);
    const onStalled = () => setIsBuffering(true);
    const onSeeked = () => setIsBuffering(false);
    const onCanPlay = () => {
      setIsBuffering(false);
      setStatus('ready');
      // A first tap that was aborted by the initial load retries itself here.
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        if (video.paused) video.play().catch(() => { /* surfaced via media events */ });
      }
    };
    const onEnded = () => { playingVideos.delete(video); setIsPlaying(false); setIsEnded(true); setIsBuffering(false); setControlsVisible(true); };
    const onError = () => { setStatus('error'); setIsPlaying(false); setIsBuffering(false); };
    const onTimeUpdate = () => setCurrent(video.currentTime);
    const onDurationChange = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onProgress = () => {
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onVolumeChange = () => setMuted(video.muted);
    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      const naturalRatio = video.videoWidth > 0 && video.videoHeight > 0
        ? video.videoWidth / video.videoHeight
        : 16 / 9;
      if (import.meta.env.DEV) {
        console.log(
          `[ClipPlayer] videoWidth=${video.videoWidth} videoHeight=${video.videoHeight} ratio=${naturalRatio.toFixed(3)}`
        );
      }
      // Size the frame from the clip itself so the whole picture is always shown.
      setRatio(naturalRatio);
      setNaturalHeight(video.videoHeight || 0);
      onRatioChangeRef.current?.({ ratio: naturalRatio, isPortrait: naturalRatio < LANDSCAPE_RATIO });
      setStatus('ready');
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('progress', onProgress);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.pause();
      playingVideos.delete(video);
    };
  }, [effectiveSrc]);

  // Autoplay (muted): a rejected promise just shows a paused hint.
  useEffect(() => {
    if (!autoPlay) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => setMessage('Tap to play'));
    }
  }, [autoPlay, effectiveSrc]);

  // Sync fullscreen state from the browser (standard + webkit prefixed).
  useEffect(() => {
    const doc = document as WebkitDocument;
    const onChange = () => setNativeFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  // Lock body scroll while in pseudo-fullscreen.
  useEffect(() => {
    if (!pseudoFullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [pseudoFullscreen]);

  // Escape leaves pseudo-fullscreen.
  useEffect(() => {
    if (!pseudoFullscreen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPseudoFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pseudoFullscreen]);

  // Clear the transient hint.
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), 3500);
    return () => window.clearTimeout(t);
  }, [message]);

  useEffect(() => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, []);

  const revealControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    const video = videoRef.current;
    if (video && !video.paused) {
      hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2500);
    }
  };

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch((err: unknown) => {
        const name = (err as { name?: string } | null)?.name;
        if (name === 'AbortError') {
          // A pending load/seek aborted this request — retry from `canplay`.
          pendingPlayRef.current = true;
        } else if (name === 'NotAllowedError') {
          setMessage('Playback was blocked. Tap to play.');
        } else {
          setMessage('Playback could not start.');
        }
      });
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setMessage(null);
    // Read the element's own state — never a React flag that can lag a frame.
    if (video.paused || video.ended) {
      startPlayback();
    } else {
      pendingPlayRef.current = false;
      video.pause();
    }
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrent(time);
  };

  const seekBy = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const max = Number.isFinite(video.duration) ? video.duration : 0;
    seekTo(Math.min(Math.max(0, video.currentTime + delta), max));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current as FullscreenElement | null;
    const video = videoRef.current as WebkitVideoElement | null;
    if (!container || !video) return;

    if (isFullscreen) {
      const doc = document as WebkitDocument;
      if (document.fullscreenElement && document.exitFullscreen) {
        void document.exitFullscreen().catch(() => undefined);
      } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
        void doc.webkitExitFullscreen();
      }
      try {
        (screen as unknown as { orientation?: OrientationLock }).orientation?.unlock?.();
      } catch { /* ignore */ }
      setPseudoFullscreen(false);
      return;
    }

    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // iOS Safari cannot fullscreen a wrapper — use the native video fullscreen.
    if (isIOS && typeof video.webkitEnterFullscreen === 'function') {
      video.webkitEnterFullscreen();
      return;
    }

    const request = container.requestFullscreen
      ? () => container.requestFullscreen!()
      : container.webkitRequestFullscreen
        ? () => container.webkitRequestFullscreen!()
        : null;

    if (request) {
      Promise.resolve(request())
        .then(() => {
          try {
            (screen as unknown as { orientation?: OrientationLock }).orientation
              ?.lock?.('landscape')
              .catch(() => undefined);
          } catch { /* ignore */ }
        })
        .catch(() => setPseudoFullscreen(true));
      return;
    }

    setPseudoFullscreen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case ' ':
      case 'k':
      case 'K':
        event.preventDefault();
        togglePlay();
        break;
      case 'ArrowRight':
        event.preventDefault();
        seekBy(5);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        seekBy(-5);
        break;
      case 'm':
      case 'M':
        toggleMute();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      default:
        break;
    }
  };

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    setStatus('loading');
    video.load();
  };

  const showCenter = status === 'ready' && (!isPlaying || isEnded || isBuffering);
  const controlsHidden = isPlaying && !controlsVisible && status === 'ready';
  const playedPct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;
  const bufferedPct = duration > 0 ? Math.min(100, (buffered / duration) * 100) : 0;

  const isPortrait = ratio !== null && ratio < LANDSCAPE_RATIO;
  const showSkeleton = ratio === null;

  const stageClass = isFullscreen
    ? 'fixed inset-0 z-[100] h-full w-full max-w-none rounded-none'
    : 'mx-auto w-full max-w-full rounded-2xl';
  // The stage is full-width only for portrait clips (so its dark sides show);
  // landscape clips shrink-wrap to `maxWidth` and stay centred.
  const stageStyle: React.CSSProperties | undefined =
    isFullscreen || isPortrait ? undefined : { maxWidth };
  const frameStyle: React.CSSProperties = isFullscreen
    ? { width: '100%', height: '100%' }
    : isPortrait
      ? {
          aspectRatio: ratio ?? 1,
          maxWidth: '100%',
          maxHeight: naturalHeight > 0 ? `${naturalHeight}px` : undefined,
        }
      : { width: '100%', aspectRatio: ratio ?? 16 / 9 };

  return (
    <div
      ref={containerRef}
      role="group"
      tabIndex={0}
      aria-label={title ?? 'Video clip'}
      onKeyDown={handleKeyDown}
      onMouseMove={revealControls}
      onMouseLeave={() => { if (isPlaying) setControlsVisible(false); }}
      onFocus={revealControls}
      style={stageStyle}
      className={`relative flex items-center justify-center overflow-hidden bg-[#0b0b0f] shadow-xl
        outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2
        ${stageClass} ${className}`}
    >
      <style>{`
        .clip-frame-portrait { height: min(75svh, 640px); }
        @media (min-width: 1024px) { .clip-frame-portrait { height: min(70svh, 640px); } }
      `}</style>

      {/* The frame is sized to the clip's own ratio, so the video fills it
          exactly with object-contain — never cropped, never pillarboxed. */}
      <div
        className={`relative z-10 overflow-hidden rounded-2xl ${isPortrait && !isFullscreen ? 'clip-frame-portrait' : ''}`}
        style={frameStyle}
      >
        {/* Single interactive surface: one tap toggles play/pause. */}
        <video
          ref={videoRef}
          src={effectiveSrc}
          poster={poster}
          preload="metadata"
          playsInline
          muted={muted}
          onClick={togglePlay}
          aria-label={title ?? 'Video clip'}
          className="block h-full w-full cursor-pointer bg-transparent object-contain"
        />

      {showSkeleton && status !== 'error' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#191922]">
          <Loader className="h-8 w-8 animate-spin text-white/60" />
        </div>
      )}

      {!showSkeleton && status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <Loader className="h-8 w-8 animate-spin text-white/80" />
        </div>
      )}

      {/* Centre overlay — visual only (pointer-events-none) so taps hit the video. */}
      {status === 'ready' && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center
            transition-opacity duration-300 motion-reduce:transition-none
            ${showCenter ? 'opacity-100' : 'opacity-0'}`}
        >
          {isBuffering && isPlaying ? (
            <Loader className="h-8 w-8 animate-spin text-white/85" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 text-white ring-1 ring-white/40 shadow-lg backdrop-blur-sm sm:h-20 sm:w-20">
              {isEnded
                ? <RotateCcw className="h-7 w-7 sm:h-9 sm:w-9" />
                : <Play className="ml-1 h-7 w-7 fill-current sm:h-9 sm:w-9" />}
            </span>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
          <AlertCircle className="h-9 w-9 text-red-400" />
          <p className="text-sm text-white/80">This video could not be played.</p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1.5
              text-xs font-semibold uppercase tracking-widest text-white transition-colors
              hover:border-white hover:bg-white/10 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {message && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-4">
          <span className="rounded-full bg-black/75 px-3 py-1 text-[11px] text-white/90">{message}</span>
        </div>
      )}

      {pseudoFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Exit fullscreen"
          className="absolute right-3 top-3 z-40 inline-flex min-h-[40px] items-center gap-2 rounded-full
            bg-black/60 px-4 text-xs font-bold uppercase tracking-widest text-white
            transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-fuchsia-400 cursor-pointer"
        >
          <Minimize className="h-4 w-4" /> Exit
        </button>
      )}

      {/* Controls — anchored to the bottom with a gradient scrim. */}
      {status === 'ready' && (
        <div
          className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/75 to-transparent
            px-2 pb-1.5 pt-10 transition-opacity duration-300 motion-reduce:transition-none
            sm:px-3 sm:pb-2 ${controlsHidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          {/* Progress: buffered + played track with a transparent touch slider on top. */}
          <div className="relative flex h-6 items-center">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25">
              <div className="absolute left-0 h-1 rounded-full bg-white/40" style={{ width: `${bufferedPct}%` }} />
              <div className="absolute left-0 h-1 rounded-full bg-fuchsia-400" style={{ width: `${playedPct}%` }} />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
                style={{ left: `${playedPct}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={current}
              onChange={(event) => seekTo(Number(event.target.value))}
              aria-label="Seek"
              className="absolute inset-0 h-6 w-full cursor-pointer touch-none appearance-none bg-transparent opacity-0"
            />
          </div>

          <div className="flex items-center gap-1 text-white sm:gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors
                hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-fuchsia-400 cursor-pointer sm:h-9 sm:w-9"
            >
              {isBuffering && isPlaying
                ? <Loader className="h-5 w-5 animate-spin" />
                : isPlaying
                  ? <Pause className="h-5 w-5 fill-current" />
                  : <Play className="h-5 w-5 fill-current" />}
            </button>
            <span className="whitespace-nowrap text-[11px] tabular-nums text-white/80 sm:text-xs">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors
                  hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-fuchsia-400 cursor-pointer sm:h-9 sm:w-9"
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors
                  hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-fuchsia-400 cursor-pointer sm:h-9 sm:w-9"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ClipPlayer;
