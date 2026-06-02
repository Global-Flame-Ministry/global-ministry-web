import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import {
  Play, Share2, PlusCircle, Music, Download,
  Volume2, ArrowLeft,
  PlayCircle,
} from 'lucide-react';
import { sermonApi } from '../api/sermonApi';

const SermonPlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [shareCopied, setShareCopied] = useState(false);

  const { data: queryData, isLoading } = useQuery({
    queryKey: ['sermonPlayer', slug],
    queryFn: async () => {
      const response = await sermonApi.getBySlug(slug!);
      if (!response.data.isSuccess || !response.data.data) return null;
      const sermonData = response.data.data;
      const allResponse = await sermonApi.getAll({ pageSize: 20, series: sermonData.series });
      const all = allResponse.data.data?.items ?? [];
      return { sermon: sermonData, allSeriesSermons: all };
    },
    enabled: !!slug,
  });

  const sermon = queryData?.sermon ?? null;

  const seriesSermons = useMemo(() => {
    const allSeriesSermons = queryData?.allSeriesSermons ?? [];
    if (!sermon) return [];
    return allSeriesSermons.filter(s => s.id !== sermon.id).slice(0, 6);
  }, [queryData, sermon]);

  const allSeriesSermons = queryData?.allSeriesSermons ?? [];

  const handleShare = async () => {
    if (!sermon) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: sermon.title,
          text: `"${sermon.title}" — ${sermon.speaker}`,
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
      return `${url}${separator}rel=0&modestbranding=1&iv_load_policy=3`;
    }
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}?rel=0&modestbranding=1&iv_load_policy=3`;
    }
    const watchMatch = url.match(/[?&]v=([^?&]+)/);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1&iv_load_policy=3`;
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

  if (!sermon) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col items-center justify-center">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl max-w-md">
          <h2 className="font-serif text-3xl font-bold text-[#1a1c20] mb-4">Sermon Not Found</h2>
          <p className="text-[#51424f] mb-8">The message you are looking for might have been moved or archived.</p>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Archive
          </button>
        </div>
      </div>
    );
  }

  const currentPart = allSeriesSermons.findIndex(s => s.id === sermon.id) + 1;
  const totalParts = allSeriesSermons.length;
  const progressPercent = totalParts > 0 ? Math.round((currentPart / totalParts) * 100) : 0;

  return (
    <>
      <SEO
        title={`${sermon.title} — ${sermon.speaker}`}
        description={sermon.description || `Watch "${sermon.title}" delivered by ${sermon.speaker}`}
        image={sermon.imageUrl || undefined}
        url={`https://globalflameministry.org/sermons/${sermon.slug || sermon.id}`}
        type="article"
      />

      <main className="bg-[#f9f9ff] text-[#1a1c20] antialiased flex-1 pt-24 pb-16 px-4 sm:px-8 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ─── LEFT COLUMN: Player & Info ─── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Video Player */}
            <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-2xl" style={{ paddingTop: '56.25%' }}>
              {sermon.videoUrl ? (
                <iframe
                  src={getEmbedUrl(sermon.videoUrl)}
                  title={sermon.title}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              ) : (
                <>
                  <img
                    src={sermon.imageUrl || ''}
                    alt={sermon.title}
                    loading="lazy"
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
                  to={`/sermons/series/${encodeURIComponent(sermon.series)}`}
                  className="px-3 py-1 rounded-full bg-[#80008c] text-[#fffbff] text-[9px] font-bold uppercase tracking-[0.15em]"
                >
                  {sermon.series}
                </Link>
                <span className="text-[#837280] text-[10px] font-bold uppercase tracking-[0.15em]">
                  {formatDate(sermon.sermonDate)}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1a1c20] leading-tight">
                {sermon.title}
              </h1>

              {/* Speaker Info + Actions */}
              <div className="flex flex-wrap items-center justify-between py-6 border-y border-[#d5c0d1]/10 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#5b0064]/20 shrink-0 bg-gray-100 flex items-center justify-center">
                    {sermon.speakerImageUrl ? (
                      <img src={sermon.speakerImageUrl} alt={sermon.speaker} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-[#712ae2] uppercase">
                        {sermon.speaker?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-serif text-xl text-[#1a1c20]">{sermon.speaker}</p>
                    <p className="text-[#837280] text-sm">Guest Speaker, Global Flame Ministry</p>
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
            {sermon.description && (
              <article className="max-w-none">
                <p className="text-lg text-[#51424f] leading-relaxed">
                  {sermon.description}
                </p>
              </article>
            )}

            {/* Audio Section */}
            {sermon.audioUrl && (
              <section className="p-8 rounded-2xl bg-[#f3f3f9] border border-[#d5c0d1]/10 shadow-[0_4px_24px_-6px_rgba(91,0,100,0.2),0_10px_15px_-3px_rgba(113,42,226,0.1)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#ffb95f]/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-[#ffb95f]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl">Also available in audio</h3>
                    <p className="text-[#837280] text-sm">Listen on the go or download for offline access</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 w-full bg-white rounded-full h-14 flex items-center px-6 gap-4 shadow-sm border border-[#d5c0d1]/5">
                    <PlayCircle className="w-6 h-6 text-[#5b0064] cursor-pointer shrink-0" />
                    <div className="flex-1 h-1 bg-[#e2e2e8] rounded-full relative">
                      <div className="absolute left-0 top-0 h-full w-1/3 bg-[#5b0064] rounded-full" />
                      <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#5b0064] rounded-full border-2 border-white shadow-md" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#837280] shrink-0 whitespace-nowrap">12:45 / 42:10</span>
                    <Volume2 className="w-5 h-5 text-[#837280] cursor-pointer shrink-0" />
                  </div>
                  <a
                    href={sermon.audioUrl}
                    download
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-gradient-to-r from-[#5b0064] to-[#712ae2] text-white font-bold hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Download MP3</span>
                  </a>
                </div>
              </section>
            )}
          </div>

          {/* ─── RIGHT SIDEBAR: More From Series ─── */}
          <aside className="lg:col-span-4 h-fit sticky top-28 space-y-6">
            <div className="bg-[#09090b] rounded-2xl overflow-hidden shadow-2xl border border-[#d5c0d1]/10">
              <div className="p-6 border-b border-[#d5c0d1]/20">
                <h2 className="font-serif text-xl text-white">More from this series</h2>
                <p className="text-[#e2e2e8] text-[9px] font-bold uppercase tracking-[0.15em] mt-1">
                  {sermon.series} &bull; {seriesSermons.length + 1} EPISODES
                </p>
              </div>
              <div className="max-h-[700px] overflow-y-auto p-2 space-y-2 scrollbar-thin">

                {/* Currently Playing Item */}
                <div className="flex gap-4 p-3 rounded-xl bg-[#8b4bfc] text-white group border border-[#5b0064]/20">
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0">
                    <img
                      src={sermon.imageUrl || ''}
                      alt={sermon.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#5b0064]/40 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white animate-pulse" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-xs font-bold line-clamp-2 leading-snug">{sermon.title}</h4>
                    <div className="flex items-center gap-2 mt-1 opacity-80">
                      <span className="text-[9px] font-bold uppercase tracking-tighter">Playing</span>
                    </div>
                  </div>
                </div>

                {/* Related Items */}
                {seriesSermons.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/sermons/player/${rel.slug || rel.id}`}
                    className="flex gap-4 p-3 rounded-xl hover:bg-white/5 group transition-all cursor-pointer"
                  >
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0">
                      <img
                        src={rel.imageUrl || ''}
                        alt={rel.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1.5 py-0.5 rounded text-white font-bold">42:10</span>
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="text-xs font-bold text-[#e2e2e8] group-hover:text-white line-clamp-2 leading-snug transition-colors">
                        {rel.title}
                      </h4>
                      <p className="text-[10px] text-[#837280] mt-1 font-medium">{rel.speaker}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-4 bg-white/5 text-center">
                <Link
                  to={`/sermons/series/${encodeURIComponent(sermon.series)}`}
                  className="text-[#5b0064] font-bold text-[10px] uppercase tracking-[0.15em] hover:text-[#fc8eff] transition-colors"
                >
                  View All Series Content
                </Link>
              </div>
            </div>

            {/* Series Progress */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-[#d5c0d1]/20 bg-[#f3f3f9] flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#837280]">Series Progress</p>
                <h4 className="font-serif text-xl">{currentPart} of {totalParts} Lessons</h4>
              </div>
              <div className="relative w-16 h-16">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="32" cy="32" fill="transparent" r="28" stroke="#e2e2e8" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" fill="transparent" r="28"
                    stroke="#5b0064"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - progressPercent / 100)}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm font-bold text-[#5b0064]">{progressPercent}%</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
};

export default SermonPlayer;

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="10" width="4" height="11" />
      <rect x="10" y="6" width="4" height="15" />
      <rect x="17" y="2" width="4" height="19" />
    </svg>
  );
}
