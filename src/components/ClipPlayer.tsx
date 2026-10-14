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
 * - Respects the source aspect ratio (metadata): landscape video widens the
 *   frame; portrait video is centred with dark, blurred sides.
 * - Derives the poster frame from the video itself (Cloudinary `so_0` or
 *   `#t=0.1`), never a cover image / flyer.
 * - Keyboard: Space/K play-pause, ←/→ seek ±5s, M mute, F fullscreen.
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
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(autoPlay);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [frameRatio, setFrameRatio] = useState(16 / 9);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [trackedSrc, setTrackedSrc] = useState(effectiveSrc);

  // Reset transient state whenever the source changes (adjust during render so
  // there is no extra commit/paint cycle on the old clip).
  if (trackedSrc !== effectiveSrc) {
    setTrackedSrc(effectiveSrc);
    setStatus('loading');
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setFrameRatio(16 / 9);
  }

  const revealControls = () => {
    setControlsVisible(true);
    if (playing) {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2500);
    }
  };

  // Register play/pause listeners, enforce one-at-a-time, stop on unmount.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      for (const other of playingVideos) {
        if (other !== video) {
          try {
            other.pause();
          } catch {
            /* ignore */
          }
        }
      }
      playingVideos.add(video);
      setPlaying(true);
    };
    const onPause = () => {
      playingVideos.delete(video);
      setPlaying(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('playing', onPause);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('playing', onPause);
      video.pause();
      playingVideos.delete(video);
    };
  }, [effectiveSrc]);

  // Pause every other registered video when this one starts.
  useEffect(() => {
    if (!playing) return;
    const video = videoRef.current;
    for (const other of playingVideos) {
      if (other !== video) {
        try {
          other.pause();
        } catch {
          /* ignore */
        }
      }
    }
  }, [playing]);

  useEffect(() => {
    if (!autoPlay) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => undefined);
  }, [autoPlay, effectiveSrc]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    },
    []
  );

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => setStatus('error'));
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
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
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

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const ratio = video.videoWidth > 0 && video.videoHeight > 0
      ? video.videoWidth / video.videoHeight
      : 16 / 9;
    // Landscape video widens the frame (clamped); portrait keeps the 16:9
    // frame so the dark/blurred sides show around the centred video.
    setFrameRatio(ratio >= 1 ? Math.min(Math.max(ratio, 16 / 9), 2.2) : 16 / 9);
    setStatus('ready');
  };

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    setStatus('loading');
    video.load();
  };

  const controlsHidden = playing && status === 'ready' && !controlsVisible;

  return (
    <div
      ref={containerRef}
      role="group"
      tabIndex={0}
      aria-label={title ?? 'Video clip'}
      onKeyDown={handleKeyDown}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      onFocus={() => setControlsVisible(true)}
      style={{ aspectRatio: frameRatio }}
      className={`relative mx-auto w-full max-w-[720px] max-h-[60vh] overflow-hidden rounded-2xl bg-black
        shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500 focus-visible:ring-offset-2
        sm:max-h-[420px] ${className}`}
    >
      {/* Blurred backdrop gives portrait clips their dark sides. */}
      {poster && (
        <div
          aria-hidden
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-2xl"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      <video
        ref={videoRef}
        src={effectiveSrc}
        poster={poster}
        preload="metadata"
        playsInline
        muted={muted}
        onClick={togglePlay}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={() => setStatus((prev) => (prev === 'error' ? prev : 'ready'))}
        onError={() => setStatus('error')}
        onTimeUpdate={() => setCurrent(videoRef.current?.currentTime ?? 0)}
        onEnded={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        aria-label={title ?? 'Video clip'}
        className="relative z-10 mx-auto block h-full w-full cursor-pointer bg-transparent object-contain"
      />

      {status === 'loading' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <Loader className="h-8 w-8 animate-spin text-white/80" />
        </div>
      )}

      {status === 'ready' && !playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={title ? `Play ${title}` : 'Play'}
          className="group/play absolute inset-0 z-20 flex items-center justify-center cursor-pointer"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 text-white ring-1 ring-white/40 shadow-lg backdrop-blur-sm transition-transform duration-200 group-hover/play:scale-110 sm:h-20 sm:w-20">
            <Play className="ml-1 h-7 w-7 fill-current sm:h-9 sm:w-9" />
          </span>
        </button>
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

      {/* Controls */}
      {status === 'ready' && (
        <div
          className={`absolute inset-x-0 bottom-0 z-30 flex flex-col gap-1 bg-gradient-to-t
            from-black/80 to-transparent px-3 pb-3 pt-8 transition-opacity duration-300
            ${controlsHidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(event) => seekTo(Number(event.target.value))}
            aria-label="Seek"
            className="h-1.5 w-full cursor-pointer accent-fuchsia-500"
          />
          <div className="flex items-center gap-2 text-white">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors
                hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-fuchsia-400 cursor-pointer"
            >
              {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </button>
            <span className="text-xs tabular-nums text-white/80">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors
                  hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-fuchsia-400 cursor-pointer"
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors
                  hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-fuchsia-400 cursor-pointer"
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
