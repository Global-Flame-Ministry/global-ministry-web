import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Play, Share2, PlusCircle, Music, Download,
  ArrowLeft, Home, Clapperboard, User,
} from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import type { SermonDto } from '../types';

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

const SermonDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeSermon, setActiveSermon] = useState<SermonDto | null>(null);
  const [seriesSermons, setSeriesSermons] = useState<SermonDto[]>([]);
  const [allSeriesSermons, setAllSeriesSermons] = useState<SermonDto[]>([]);
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
          setActiveSermon(sermonData);
          const allResponse = await sermonApi.getAll({
            pageSize: 50,
            series: sermonData.series,
          });
          if (allResponse.data.isSuccess && allResponse.data.data) {
            const all = allResponse.data.data.items;
            setAllSeriesSermons(all);
            const others = all.filter(s => s.id !== sermonData.id).slice(0, 6);
            setSeriesSermons(others);
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

  const handleSermonSwap = (s: SermonDto) => {
    setActiveSermon(s);
    const remaining = allSeriesSermons.filter(x => x.id !== s.id).slice(0, 6);
    setSeriesSermons(remaining);
  };

  const handleShare = async () => {
    if (!activeSermon) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: activeSermon.title,
          text: `"${activeSermon.title}" — ${activeSermon.speaker}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

const getEmbedUrl = (url: string): string => {
  if (!url) return '';

  if (url.includes('/embed/')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url.replace('youtube.com', 'youtube-nocookie.com')}${separator}rel=0&modestbranding=1`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}?rel=0&modestbranding=1`;
  }

  const watchMatch = url.match(/[?&]v=([^?&]+)/);
  if (watchMatch) {
    return `https://www.youtube-nocookie.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }

  return url;
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#5b0064] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeSermon) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col items-center justify-center">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl max-w-md">
          <h2 className="font-serif text-3xl font-bold text-[#1a1c20] mb-4">Sermon Not Found</h2>
          <p className="text-[#51424f] mb-8">The message you are looking for might have been moved or archived.</p>
          <Link to="/sermons" className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b0064] text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#712ae2] transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Archive
          </Link>
        </div>
      </div>
    );
  }

  const currentPart = allSeriesSermons.findIndex(s => s.id === activeSermon.id) + 1;
  const totalParts = allSeriesSermons.length;
  const progressPercent = totalParts > 0 ? Math.round((currentPart / totalParts) * 100) : 0;
  const seriesSlug = slugify(activeSermon.series);

  return (
    <>
      <SEO
        title={`${activeSermon.title} — ${activeSermon.speaker}`}
        description={activeSermon.description || `Watch "${activeSermon.title}" delivered by ${activeSermon.speaker}`}
        image={activeSermon.imageUrl || undefined}
        url={`https://globalflameministry.org/sermons/${activeSermon.slug || activeSermon.id}`}
        type="article"
      />

      <main className="bg-[#f9f9ff] text-[#1a1c20] antialiased flex-1 pt-24 pb-16 px-4 sm:px-8 w-full min-h-[calc(100dvh-12rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── LEFT COLUMN: Player & Info ─── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Video Player */}
            <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-2xl" style={{ paddingTop: '56.25%' }}>
              {activeSermon.videoUrl ? (
                <iframe
                  src={getEmbedUrl(activeSermon.videoUrl)}
                  title={activeSermon.title}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              ) : (
                <>
                  <img
                    src={activeSermon.imageUrl || ''}
                    alt={activeSermon.title}
                    className="absolute top-0 left-0 w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-[#5b0064]/90 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sermon Identity */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/sermons/series/${seriesSlug}`}
                  className="px-3 py-1 rounded-full bg-[#80008c] text-[#fffbff] text-[9px] font-bold uppercase tracking-[0.15em]"
                >
                  {activeSermon.series}
                </Link>
                {activeSermon.theme && (
                  <span className="text-[#712ae2] text-[10px] font-bold italic tracking-[0.1em]">
                    {activeSermon.theme}
                  </span>
                )}
                <span className="text-[#837280] text-[10px] font-bold uppercase tracking-[0.15em]">
                  {formatDate(activeSermon.sermonDate)}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1a1c20] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {activeSermon.title}
              </h1>

              {/* Speaker Info + Actions */}
              <div className="flex flex-wrap items-center justify-between py-6 border-y border-[#d5c0d1]/10 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#5b0064]/20 shrink-0 bg-gray-100 flex items-center justify-center">
                    {activeSermon.speakerImageUrl ? (
                      <img src={activeSermon.speakerImageUrl} alt={activeSermon.speaker} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-[#712ae2] uppercase">
                        {activeSermon.speaker?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-serif text-xl text-[#1a1c20]" style={{ fontFamily: "'Playfair Display', serif" }}>{activeSermon.speaker}</p>
                    <p className="text-[#837280] text-sm">Lead Pastor, Global Flame Ministry</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#e8e8ee] hover:bg-[#e2e2e8] transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-[#5b0064]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{shareCopied ? 'Copied!' : 'Share'}</span>
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#5b0064] text-[#5b0064] hover:bg-[#5b0064]/5 transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            {activeSermon.description && (
              <article className="max-w-none">
                <p className="text-lg text-[#51424f] leading-relaxed">
                  {activeSermon.description}
                </p>
              </article>
            )}

            {/* Audio Section */}
            <section className="p-8 rounded-2xl bg-[#f3f3f9] border border-[#d5c0d1]/10 shadow-[0_4px_24px_-6px_rgba(91,0,100,0.2),0_10px_15px_-3px_rgba(113,42,226,0.1)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#ffb95f]/20 flex items-center justify-center">
                  <Music className="w-6 h-6 text-[#ffb95f]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Also available in audio</h3>
                  <p className="text-[#837280] text-sm">Listen on the go or download for offline access</p>
                </div>
              </div>
              {activeSermon.audioUrl ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <audio controls className="flex-1 w-full h-14">
                    <source src={activeSermon.audioUrl} type="audio/mpeg" />
                  </audio>
                  <a
                    href={activeSermon.audioUrl}
                    download
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-gradient-to-r from-[#5b0064] to-[#712ae2] text-white font-bold hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Download MP3</span>
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center h-14 bg-white/60 rounded-full border border-[#d5c0d1]/20">
                  <Music className="w-4 h-4 text-[#837280] mr-2" />
                  <span className="text-[#837280] text-sm italic">No audio available for this sermon</span>
                </div>
              )}
            </section>
          </div>

          {/* ─── RIGHT SIDEBAR: More From Series ─── */}
          <aside className="lg:col-span-4 h-fit sticky top-28 space-y-6">
            <div className="bg-[#09090b] rounded-2xl overflow-hidden shadow-2xl border border-[#d5c0d1]/10">
              <div className="p-6 border-b border-[#d5c0d1]/20">
                <h2 className="font-serif text-xl text-white" style={{ fontFamily: "'Playfair Display', serif" }}>More from this series</h2>
                <p className="text-[#e2e2e8] text-[9px] font-bold uppercase tracking-[0.15em] mt-1">
                  {activeSermon.series} &bull; {allSeriesSermons.length} EPISODES
                </p>
              </div>
              <div className="max-h-[700px] overflow-y-auto p-2 space-y-2">
                {/* Current Item */}
                <div className="flex gap-4 p-3 rounded-xl bg-[#8b4bfc] text-[#fffbff] group border border-[#5b0064]/20">
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0">
                    <img
                      src={activeSermon.imageUrl || ''}
                      alt={activeSermon.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#5b0064]/40 flex items-center justify-center">
                      <div className="w-5 h-5 bg-white/80 rounded-sm" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-xs font-bold line-clamp-2 leading-snug">{activeSermon.title}</h4>
                    <div className="flex items-center gap-2 mt-1 opacity-80">
                      <span className="text-[9px] font-bold uppercase tracking-tighter">Part {currentPart}</span>
                      <span className="text-[9px]"> &bull; </span>
                      <span className="text-[9px]">Playing</span>
                    </div>
                  </div>
                </div>

                {/* Related Items */}
                {seriesSermons.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => handleSermonSwap(rel)}
                    className="flex gap-4 p-3 rounded-xl hover:bg-white/5 group transition-all cursor-pointer"
                  >
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0">
                      <img
                        src={rel.imageUrl || ''}
                        alt={rel.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="text-xs font-bold text-[#e2e2e8] group-hover:text-white line-clamp-2 leading-snug transition-colors">
                        {rel.title}
                      </h4>
                      <p className="text-[10px] text-[#837280] mt-1 font-medium">{rel.speaker}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white/5 text-center">
                <Link
                  to={`/sermons/series/${seriesSlug}`}
                  className="inline-block px-6 py-2.5 bg-[#5b0064] text-white font-bold text-[10px] uppercase tracking-[0.15em] rounded-full hover:bg-[#7a008a] transition-all shadow-md"
                >
                  View All Series Content
                </Link>
              </div>
            </div>

            {/* Series Progress */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-[#d5c0d1]/20 bg-[#f3f3f9] flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#837280]">Series Progress</p>
                <h4 className="font-serif text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>{currentPart} of {totalParts} Sermons</h4>
              </div>
              <div className="relative w-16 h-16">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="32" cy="32" fill="transparent" r="28" stroke="#e2e2e8" strokeWidth="4" />
                  <circle cx="32" cy="32" fill="transparent" r="28" stroke="#5b0064" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)} strokeWidth="4" strokeLinecap="round" />
                </svg>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm font-bold text-[#5b0064]">{progressPercent}%</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-5 py-3 bg-[#09090b]/95 backdrop-blur-lg border-t border-[#d5c0d1]/10 z-50 rounded-t-xl shadow-[0_-4px_16px_rgba(0,0,0,0.4)]">
        <Link to="/" className="flex flex-col items-center justify-center text-[#e2e2e8]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Home</span>
        </Link>
        <Link to="/sermons" className="flex flex-col items-center justify-center text-[#e2e2e8]">
          <Clapperboard className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Series</span>
        </Link>
        <Link to="/sermons" className="flex flex-col items-center justify-center text-[#e2e2e8]">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Back to archive</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center justify-center text-[#e2e2e8]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default SermonDetail;