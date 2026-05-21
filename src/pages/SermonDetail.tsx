import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Calendar, Tag, Share2, Download,
  ArrowLeft, Play, Clock, ChevronRight, Music,
  Check
} from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import type { SermonDto } from '../types';

const SermonDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [sermon, setSermon]       = useState<SermonDto | null>(null);
  const [related, setRelated]     = useState<SermonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const fetchSermon = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const response = await sermonApi.getBySlug(slug);
        if (response.data.isSuccess && response.data.data) {
          const sermonData = response.data.data;
          setSermon(sermonData);
          const allResponse = await sermonApi.getAll({ pageSize: 10 });
          if (allResponse.data.isSuccess && allResponse.data.data) {
            const others = allResponse.data.data.items
              .filter(s => s.id !== sermonData.id)
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
  }, [slug]);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`;
  };

  const handleShare = async () => {
    if (!sermon) return;
    const shareData = {
      title: sermon.title,
      text: `"${sermon.title}" — ${sermon.speaker}. Listen now on Global Flame Ministry.`,
      url: window.location.href,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 2500);
        } catch {
          // Nothing to do
        }
      }
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-serif italic">Loading message...</p>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] pt-20">
        <div className="text-center p-12 bg-slate-800 rounded-3xl shadow-xl border border-slate-700 max-w-md">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Sermon Not Found</h2>
          <p className="text-slate-400 mb-8">The message you are looking for might have been moved or archived.</p>
          <button
            onClick={() => navigate('/sermons')}
            className="w-full py-4 bg-fuchsia-600 text-white rounded-xl font-bold hover:bg-fuchsia-500 transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] min-h-screen">
      <SEO
        title={sermon.title}
        description={sermon.description || `${sermon.title} delivered by ${sermon.speaker}`}
        image={sermon.imageUrl || undefined}
        url={`https://globalflameministry.org/sermons/${sermon.id}`}
        type="article"
      />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-6 text-slate-400 text-sm font-medium pt-4">
            <Link to="/sermons" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Archive
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-500 truncate max-w-xs">{sermon.title}</span>
          </nav>

          {/* VIDEO — full width on mobile, left 3/5 on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* LEFT — Video */}
            <div className="lg:col-span-3">
              {/* Video container */}
              <div
                className="relative w-full rounded-xl overflow-hidden bg-black"
                style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}
              >
                {sermon.videoUrl ? (
                  <iframe
                    src={getEmbedUrl(sermon.videoUrl)}
                    title={sermon.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0,
                    }}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {sermon.imageUrl && (
                      <img
                        src={sermon.imageUrl}
                        alt={sermon.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105"
                      />
                    )}
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                      <p className="text-white font-serif text-xl">Video recording in progress...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags below video */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="flex items-center px-3 py-1 bg-white/10 text-white/70 rounded-full text-[10px] font-bold border border-white/10">
                  <Tag className="w-3 h-3 mr-1.5" /> {sermon.series}
                </span>
                <span className="flex items-center px-3 py-1 bg-white/10 text-white/70 rounded-full text-[10px] font-bold border border-white/10">
                  <Calendar className="w-3 h-3 mr-1.5" /> {formatDate(sermon.sermonDate)}
                </span>
                <span className="flex items-center px-3 py-1 bg-white/10 text-white/70 rounded-full text-[10px] font-bold border border-white/10">
                  <Clock className="w-3 h-3 mr-1.5" /> Full Message
                </span>
              </div>
            </div>

            {/* RIGHT — Info Panel */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Title */}
              <h1 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight">
                {sermon.title}
              </h1>

              {/* Speaker */}
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shrink-0 bg-fuchsia-900/50 flex items-center justify-center">
                  {sermon.speakerImageUrl ? (
                    <img src={sermon.speakerImageUrl} alt={sermon.speaker} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-fuchsia-300 font-black text-lg uppercase select-none">
                      {sermon.speaker.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-fuchsia-400 font-black mb-0.5">Delivered By</p>
                  <h4 className="text-base font-bold text-white">{sermon.speaker}</h4>
                </div>
              </div>

              {/* Description */}
              {sermon.description && (
                <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-fuchsia-500 pl-4 italic">
                  {sermon.description}
                </p>
              )}

              {/* Resources */}
              <div className="space-y-2">
                <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">Resources</p>

                {sermon.audioUrl ? (
                  <div className="space-y-2">
                    <a
                      href={sermon.audioUrl}
                      download
                      className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg">
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="font-semibold text-xs text-white">Download Audio</span>
                      </div>
                      <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded font-bold uppercase text-white/60">MP3</span>
                    </a>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <audio controls className="w-full h-8" style={{ accentColor: '#a855f7' }}>
                        <source src={sermon.audioUrl} />
                      </audio>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10 opacity-40 cursor-not-allowed">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <Music className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs text-white">Audio Unavailable</span>
                  </div>
                )}

                <button
                  onClick={handleShare}
                  className={`w-full py-3 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    shareCopied ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-fuchsia-600 hover:bg-fuchsia-500'
                  }`}
                >
                  {shareCopied ? (
                    <><Check className="w-3.5 h-3.5" /> Link Copied!</>
                  ) : (
                    <><Share2 className="w-3.5 h-3.5" /> Share This Message</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Sermons */}
      {related.length > 0 && (
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white font-serif">More Messages</h3>
              <Link to="/sermons" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold uppercase tracking-widest">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(rel => (
                <Link key={rel.id} to={`/sermons/${rel.slug || rel.id}`} className="group">
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-sm">
                    {rel.imageUrl ? (
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-200 leading-tight group-hover:text-fuchsia-400 transition-colors line-clamp-2 mb-1">
                    {rel.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{rel.speaker}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SermonDetail;