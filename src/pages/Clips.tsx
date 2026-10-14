import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, X, Film, AlertCircle, Loader } from 'lucide-react';
import SEO from '../components/SEO';
import { heroApi } from '../api/heroApi';
import { getPosterUrl } from '../components/HeroCarousel';
import type { HeroSlide } from '../types';

const ClipThumbnail: React.FC<{ clip: HeroSlide }> = ({ clip }) => {
  const poster = getPosterUrl(clip.url);
  if (poster) {
    return (
      <img
        src={poster}
        alt={clip.title ?? 'Short clip'}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <video
      src={clip.url}
      preload="metadata"
      muted
      playsInline
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
};

const ClipModal: React.FC<{ clip: HeroSlide; onClose: () => void }> = ({ clip, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl">
        <button
          onClick={onClose}
          className="absolute -top-11 right-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" /> Close
        </button>
        <div className="rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
          <video
            src={clip.url}
            poster={getPosterUrl(clip.url)}
            controls
            autoPlay={false}
            preload="metadata"
            playsInline
            className="w-full max-h-[70vh] bg-black"
          />
          {(clip.title || clip.subtitle) && (
            <div className="px-6 py-4 bg-[#111]">
              {clip.title && (
                <h3 className="font-serif text-lg text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {clip.title}
                </h3>
              )}
              {clip.subtitle && <p className="text-sm text-white/60 mt-1">{clip.subtitle}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Clips: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicClips'],
    queryFn: () => heroApi.getClips().then(res => res.data.data ?? []),
  });

  const clips = data ?? [];
  const [activeClip, setActiveClip] = useState<HeroSlide | null>(null);

  return (
    <>
      <SEO
        title="Short Clips"
        description="Watch short video clips from Global Flame Ministry — moments of worship, teaching, and life together."
        url="https://globalflameministry.org/clips"
      />

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-14 bg-gradient-to-b from-[#5b0064] to-[#712ae2]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-[10px] font-bold uppercase tracking-[0.3em]">
            <Film className="w-3 h-3" /> Short Clips
          </span>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl text-white mt-6 font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Short Clips
          </h1>
          <p className="text-white/70 mt-4 max-w-2xl mx-auto">
            Bite-sized moments of worship, teaching, and life at Global Flame.
          </p>
        </div>
      </section>

      {/* ─── GRID ─── */}
      <section className="bg-[#f9f9ff] flex-1 max-w-[1280px] mx-auto w-full px-4 sm:px-8 pt-12 pb-32">
        {isLoading && (
          <div className="flex items-center justify-center py-40">
            <Loader className="animate-spin text-fuchsia-600 w-8 h-8" />
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
            <p className="font-serif text-xl text-gray-500 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              We couldn't load the clips right now.
            </p>
            <p className="text-sm text-gray-400 mt-2">Please try again in a moment.</p>
          </div>
        )}

        {!isLoading && !isError && clips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <Film className="w-10 h-10 text-gray-300 mb-4" />
            <p className="font-serif text-xl text-gray-400 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              No clips available yet.
            </p>
            <p className="text-sm text-gray-400 mt-2">Check back soon for new shorts.</p>
          </div>
        )}

        {!isLoading && !isError && clips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map(clip => (
              <button
                key={clip.id}
                type="button"
                onClick={() => setActiveClip(clip)}
                className="group text-left rounded-xl overflow-hidden bg-white shadow-[0_10px_30px_-10px_rgba(91,0,100,0.15),0_4px_12px_-5px_rgba(113,42,226,0.1)] transition-all hover:-translate-y-2 cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <ClipThumbnail clip={clip} />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-white/90 text-[#5b0064] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </span>
                  </span>
                </div>
                <div className="p-5">
                  <h3
                    className="font-serif text-lg text-[#1a1c20] leading-tight group-hover:text-[#5b0064] transition-colors"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {clip.title || 'Untitled clip'}
                  </h3>
                  {clip.subtitle && (
                    <p className="text-sm text-[#51424f] mt-1 line-clamp-2">{clip.subtitle}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {activeClip && <ClipModal clip={activeClip} onClose={() => setActiveClip(null)} />}
    </>
  );
};

export default Clips;
