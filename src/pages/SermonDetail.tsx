import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Tag, Share2, Download,
  ArrowLeft, Play, Clock, ChevronRight, Music,
  Maximize2, Minimize2, X, Check
} from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import type { SermonDto } from '../types';

const SermonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sermon, setSermon]       = useState<SermonDto | null>(null);
  const [related, setRelated]     = useState<SermonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Share state — tracks whether the share action succeeded
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const fetchSermon = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await sermonApi.getById(Number(id));
        if (response.data.isSuccess && response.data.data) {
          setSermon(response.data.data);

          const allResponse = await sermonApi.getAll({ pageSize: 10 });
          if (allResponse.data.isSuccess && allResponse.data.data) {
            const others = allResponse.data.data.items
              .filter(s => s.id !== Number(id))
              .slice(0, 4);
            setRelated(others);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sermon:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSermon();
  }, [id]);

  // Close fullscreen on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // ── SHARE HANDLER ────────────────────────────────────────────
  // Uses Web Share API on supported devices (mobile/modern browsers)
  // Falls back to clipboard copy on desktop
  const handleShare = async () => {
    if (!sermon) return;

    const shareData = {
      title: sermon.title,
      text:  `"${sermon.title}" — ${sermon.speaker}. Listen now on Global Flame Ministry.`,
      url:   window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        // Native share sheet — works on iOS/Android/some desktop
        await navigator.share(shareData);
      } else {
        // Fallback — copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } catch (err) {
      // User cancelled native share — not an error
      if (err instanceof Error && err.name !== 'AbortError') {
        // Clipboard fallback if share failed for any other reason
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 2500);
        } catch {
          // Nothing to do — browser blocked clipboard too
        }
      }
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  // ── LOADING ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBFBFE] pt-20 flex items-center
        justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fuchsia-600
            border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-serif italic">
            Loading message...
          </p>
        </div>
      </div>
    );
  }

  // ── NOT FOUND ────────────────────────────────────────────────
  if (!sermon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
        bg-slate-50 pt-20">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl
          border border-slate-100 max-w-md">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
            Sermon Not Found
          </h2>
          <p className="text-slate-500 mb-8">
            The message you are looking for might have been moved or archived.
          </p>
          <button
            onClick={() => navigate('/sermons')}
            className="w-full py-4 bg-slate-900 text-white rounded-xl
              font-bold hover:bg-fuchsia-600 transition-all flex items-center
              justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  // ── VIDEO PLAYER BLOCK ───────────────────────────────────────
  const VideoPlayer = () => (
    <div className="relative w-full aspect-video bg-black rounded-2xl
      overflow-hidden shadow-2xl">
      {sermon.videoUrl ? (
        <iframe
          src={sermon.videoUrl}
          title={sermon.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write;
            encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center
          justify-center relative">
          {sermon.imageUrl && (
            <img
              src={sermon.imageUrl}
              alt={sermon.title}
              className="absolute inset-0 w-full h-full object-cover
                opacity-40 blur-sm scale-105"
            />
          )}
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 rounded-full bg-white/10
              backdrop-blur-xl border border-white/20 flex items-center
              justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            <p className="text-white font-serif text-xl">
              Video recording in progress...
            </p>
          </div>
        </div>
      )}

      {/* Fullscreen toggle */}
      <button
        onClick={() => setIsFullscreen(f => !f)}
        title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Expand to fullscreen'}
        className="absolute bottom-3 right-3 z-20 flex items-center
          gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80
          backdrop-blur-sm text-white text-[10px] font-bold uppercase
          tracking-widest rounded-lg border border-white/10
          transition-all duration-200 hover:scale-105"
      >
        {isFullscreen
          ? <><Minimize2 className="w-3.5 h-3.5" /> Exit</>
          : <><Maximize2 className="w-3.5 h-3.5" /> Fullscreen</>
        }
      </button>
    </div>
  );

  // ── FULLSCREEN OVERLAY ───────────────────────────────────────
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
        <div className="flex items-center justify-between px-6 py-3
          bg-black/80 backdrop-blur-sm border-b border-white/10 shrink-0">
          <p className="text-white font-semibold text-sm truncate pr-4">
            {sermon.title}
          </p>
          <button
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1.5 text-white/70
              hover:text-white text-[10px] font-bold uppercase
              tracking-widest transition-colors"
          >
            <X className="w-4 h-4" /> Exit Fullscreen
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-[1600px]">
            {sermon.videoUrl ? (
              <iframe
                src={sermon.videoUrl}
                title={sermon.title}
                className="w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write;
                  encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center
                rounded-xl bg-slate-900">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex
                    items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  <p className="text-white font-serif text-xl">
                    Video recording in progress...
                  </p>
                </div>
              </div>
            )}
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2
              text-white/30 text-[10px] uppercase tracking-widest">
              Press Esc or click "Exit Fullscreen" to return
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── NORMAL SPLIT VIEW ────────────────────────────────────────
  return (
    <div className="pt-20 bg-[#FBFBFE] min-h-screen">

      <div className="bg-[#0F172A] pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-slate-400
            text-sm font-medium">
            <Link to="/sermons"
              className="hover:text-white transition-colors flex
                items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Archive
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-500 truncate max-w-xs">
              {sermon.title}
            </span>
          </nav>

          {/* Split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6
            items-start">

            {/* LEFT — Video Player */}
            <div className="lg:col-span-3">
              <VideoPlayer />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="flex items-center px-3 py-1 bg-white/10
                  text-white/70 rounded-full text-[10px] font-bold
                  border border-white/10">
                  <Tag className="w-3 h-3 mr-1.5" /> {sermon.series}
                </span>
                <span className="flex items-center px-3 py-1 bg-white/10
                  text-white/70 rounded-full text-[10px] font-bold
                  border border-white/10">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  {formatDate(sermon.sermonDate)}
                </span>
                <span className="flex items-center px-3 py-1 bg-white/10
                  text-white/70 rounded-full text-[10px] font-bold
                  border border-white/10">
                  <Clock className="w-3 h-3 mr-1.5" /> Full Message
                </span>
              </div>
            </div>

            {/* RIGHT — Info Panel */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Title + Speaker */}
              <div>
                <h1 className="text-2xl font-serif font-bold text-white
                  leading-tight mb-4">
                  {sermon.title}
                </h1>

                {/* ── SPEAKER CARD ─────────────────────────────────────
                  speakerImageUrl comes from the backend (admin uploads it).
                  If none was uploaded, we show a clean avatar placeholder
                  using the first letter of the speaker's name — no more
                  hardcoded image guessing logic.
                */}
                <div className="flex items-center gap-3 p-4 bg-white/5
                  rounded-2xl border border-white/10">
                  <div className="w-12 h-12 rounded-full overflow-hidden
                    border-2 border-white/20 shrink-0 bg-fuchsia-900/50
                    flex items-center justify-center">
                    {sermon.speakerImageUrl ? (
                      <img
                        src={sermon.speakerImageUrl}
                        alt={sermon.speaker}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback — first initial of speaker name
                      <span className="text-fuchsia-300 font-black text-lg
                        uppercase select-none">
                        {sermon.speaker.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest
                      text-fuchsia-400 font-black mb-0.5">
                      Delivered By
                    </p>
                    <h4 className="text-base font-bold text-white">
                      {sermon.speaker}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Description */}
              {sermon.description && (
                <p className="text-sm text-slate-400 leading-relaxed
                  border-l-2 border-fuchsia-500 pl-4 italic">
                  {sermon.description}
                </p>
              )}

              {/* Resources */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase tracking-widest
                  text-white/40 font-bold mb-1">
                  Resources
                </p>

                {sermon.audioUrl ? (
                  <div className="space-y-2">
                    <a
                      href={sermon.audioUrl}
                      download
                      className="w-full flex items-center justify-between
                        p-3 bg-white/5 hover:bg-white/10 rounded-xl
                        border border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg">
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="font-semibold text-xs text-white">
                          Download Audio
                        </span>
                      </div>
                      <span className="text-[9px] bg-white/10 px-2 py-0.5
                        rounded font-bold uppercase text-white/60">
                        MP3
                      </span>
                    </a>
                    <div className="p-3 bg-white/5 rounded-xl
                      border border-white/10">
                      <audio
                        controls
                        className="w-full h-8"
                        style={{ accentColor: '#a855f7' }}
                      >
                        <source src={sermon.audioUrl} />
                      </audio>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-2 p-3
                    bg-white/5 rounded-xl border border-white/10
                    opacity-40 cursor-not-allowed">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <Music className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs text-white">
                      Audio Unavailable
                    </span>
                  </div>
                )}

                {/* ── SHARE BUTTON ───────────────────────────────────
                  Uses Web Share API on mobile/supported browsers.
                  Falls back to copying the URL to clipboard on desktop.
                  Button label changes to "Link Copied!" for 2.5s as feedback.
                */}
                <button
                  onClick={handleShare}
                  className={`w-full py-3 text-white rounded-xl font-bold
                    text-xs transition-all flex items-center justify-center
                    gap-2 ${
                      shareCopied
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-fuchsia-600 hover:bg-fuchsia-500'
                    }`}
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      Share This Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Sermons */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 font-serif">
              More Messages
            </h3>
            <Link
              to="/sermons"
              className="text-xs text-fuchsia-600 hover:underline
                font-bold uppercase tracking-widest"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(rel => (
              <Link
                key={rel.id}
                to={`/sermons/${rel.id}`}
                className="group"
              >
                <div className="aspect-video rounded-xl overflow-hidden
                  bg-slate-200 mb-3 shadow-sm">
                  {rel.imageUrl ? (
                    <img
                      src={rel.imageUrl}
                      alt={rel.title}
                      className="w-full h-full object-cover
                        group-hover:scale-105 transition-transform
                        duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center
                      justify-center">
                      <Music className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-900
                  leading-tight group-hover:text-fuchsia-600
                  transition-colors line-clamp-2 mb-1">
                  {rel.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold
                  uppercase tracking-tight">
                  {rel.speaker}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SermonDetail;