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

interface ClipPlayerProps {
  src: string;
  title?: string | null;
  className?: string;
  /** Start muted and attempt playback (used for in-view autoplay). Never plays with sound. */
  autoPlay?: boolean;
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Reusable, accessible video player with custom controls.
 *
 * - The `<video>` element is the single source of truth: `isPlaying`,
 *   `isBuffering` and `isEnded` are derived from media events, never from
 *   click handlers.
 * - One click/tap on the video surface toggles playback; the centre overlay is
 *   visual only, so a tap can never fire twice.
 * - Respects the source aspect ratio (metadata): landscape video widens the
 *   frame; portrait video is centred with dark, blurred sides.
 * - Derives the poster frame from the video itself (Cloudinary `so_0` or
 *   `#t=0.1`), never a cover image / flyer.
 * - Keyboard: Space/K play-pause, ←/→ seek ±5s, M mute, F fullscreen.
 * - Fullscreen with pseudo-fullscreen fallback + optional landscape lock.
 * - Only one ClipPlayer anywhere on the page plays at a time.
 */
const ClipPlayer: React.FC<ClipPlayerProps> = ({
  src,
  title,
  className = '',
  autoPlay = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);

  const poster = getClipPoster(src);
  // For non-Cloudinary sources nudge the first frame into view with `#t=0.1`.
  const effectiveSrc = poster ? src : `${src}${src.includes('#') ? '' : '#t=0.1'}`;

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [muted, setMuted] = useState(autoPlay);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [frameRatio, setFrameRatio] = useState(16 / 9);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [trackedSrc, setTrackedSrc] = useState(effectiveSrc);

  const isFullscreen = nativeFullscreen || pseudoFullscreen;

  // Reset transient state whenever the source changes (adjust during render so
  // there is no extra commit/paint cycle on the old clip).
  if (trackedSrc !== effectiveSrc) {
    setTrackedSrc(effectiveSrc);
    setStatus('loading');
    setIsPlaying(false);
    setIsBuffering(false);
    setIsEnded(false);
    setCurrent(0);
    setDuration(0);
    setBuffered(0);
    setFrameRatio(16 / 9);
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
    const onCanPlay = () => { setIsBuffering(false); setStatus('ready'); };
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
      const ratio = video.videoWidth > 0 && video.videoHeight > 0
        ? video.videoWidth / video.videoHeight
        : 16 / 9;
      // Landscape widens the frame (clamped); portrait keeps 16:9 so the
      // dark/blurred sides show around the centred video.
      setFrameRatio(ratio >= 1 ? Math.min(Math.max(ratio, 16 / 9), 2.2) : 16 / 9);
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

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setMessage(null);
    if (video.paused) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => setMessage('Playback was blocked. Tap to play.'));
      }
    } else {
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

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-[100] h-full w-full max-w-none max-h-none rounded-none'
    : 'mx-auto w-full max-w-[720px] max-h-[60vh] sm:max-h-[420px] rounded-2xl';

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
      style={isFullscreen ? undefined : { aspectRatio: frameRatio }}
      className={`relative overflow-hidden bg-black shadow-xl outline-none
        focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2
        ${containerClass} ${className}`}
    >
      {/* Blurred backdrop gives portrait clips their dark sides. */}
      {poster && (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-2xl"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

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
        className="relative z-10 mx-auto block h-full w-full cursor-pointer bg-transparent object-contain"
      />

      {status === 'loading' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
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
  );
};

export default ClipPlayer;
