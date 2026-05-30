import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { Play, Headphones, Film, ArrowLeft, Home, Clapperboard, User, Loader } from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import type { SermonDto } from '../types';

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const SeriesDetail: React.FC = () => {
  const { seriesSlug } = useParams<{ seriesSlug: string }>();
  const { data: allSermonsData, isLoading } = useQuery({
    queryKey: ['seriesDetailSermons'],
    queryFn: () => sermonApi.getAll({ pageSize: 100 }).then(res => res.data.data?.items ?? []),
  });
  const [visibleCount, setVisibleCount] = useState(6);

  const seriesEntries = useMemo(() => {
    const allSermons = allSermonsData ?? [];
    const map = new Map<string, SermonDto[]>();
    allSermons.forEach(s => {
      if (!s.series) return;
      const list = map.get(s.series);
      if (list) {
        list.push(s);
      } else {
        map.set(s.series, [s]);
      }
    });
    return Array.from(map.entries());
  }, [allSermonsData]);

  const matchedSeries = useMemo(() => {
    if (!seriesSlug) return null;
    for (const [name, sermons] of seriesEntries) {
      if (slugify(name) === seriesSlug) {
        return { name, sermons };
      }
    }
    return null;
  }, [seriesEntries, seriesSlug]);

  const decodedSeries = matchedSeries?.name || '';
  const allFetched = (matchedSeries?.sermons || [])
    .slice()
    .sort((a, b) => new Date(a.sermonDate).getTime() - new Date(b.sermonDate).getTime());
  const seriesTheme = allFetched.find(s => s.theme)?.theme || null;
  const conferenceTitle = allFetched[0]?.title || decodedSeries;
  const sermons = allFetched.slice(0, visibleCount);
  const hasMore = allFetched.length > visibleCount;

  const hasVideo = (s: SermonDto) => Boolean(s.videoUrl);
  const hasAudio = (s: SermonDto) => Boolean(s.audioUrl);

  return (
    <>
      <SEO
        title={`${decodedSeries || 'Series'} | Message Archive`}
        description={decodedSeries ? `Explore messages from the ${decodedSeries} series.` : 'Browse our full sermon archive.'}
        url={`https://globalflameministry.org/sermons/series/${seriesSlug}`}
      />

      {/* ─── HEADER ─── */}
      <header className="mb-12 bg-[#f9f9ff] pt-32 pb-0 px-4 sm:px-8 max-w-[1280px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-[#5b0064] text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full">{decodedSeries}</span>
              <span className="text-[#51424f] text-[10px] font-bold uppercase tracking-[0.15em]">{allFetched.length} Message{allFetched.length !== 1 ? 's' : ''}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1a1c20] tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {conferenceTitle}
            </h1>
            {seriesTheme && (
              <p className="text-[#712ae2] font-serif text-xl italic font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {seriesTheme}
              </p>
            )}
            <p className="text-[#51424f] max-w-2xl text-base leading-relaxed">
              Explore the complete collection of teachings from this series.
            </p>
          </div>
        </div>
      </header>

      {/* ─── MESSAGE GRID ─── */}
      <main className="bg-[#f9f9ff] text-[#1a1c20] flex-1 pb-24 px-4 sm:px-8 max-w-[1280px] mx-auto w-full">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-40">
            <Loader className="animate-spin text-fuchsia-600 w-8 h-8" />
          </div>
        )}

        {/* Not found */}
        {!isLoading && !matchedSeries && seriesSlug && (
          <div className="py-24 text-center">
            <p className="font-serif text-xl text-gray-400 italic">Series not found.</p>
            <Link to="/sermons" className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5b0064] hover:text-[#712ae2] transition-colors">Browse all series</Link>
          </div>
        )}

        {/* Empty */}
        {!isLoading && matchedSeries && allFetched.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-serif text-xl text-gray-400 italic">No messages in this series yet.</p>
            <Link to="/sermons" className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#5b0064] hover:text-[#712ae2] transition-colors">Browse all series</Link>
          </div>
        )}

        {/* Grid */}
        {!isLoading && allFetched.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermons.map((sermon, idx) => (
              <Link
                key={sermon.id}
                to={`/sermons/${sermon.slug || sermon.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(91,0,100,0.1),0_10px_30px_-10px_rgba(113,42,226,0.1)] transition-all duration-300 hover:scale-[1.02] flex flex-col cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={sermon.imageUrl || ''} alt={sermon.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#5b0064]/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {hasVideo(sermon) && (
                      <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white"><Film className="w-4 h-4" /></div>
                    )}
                    {hasAudio(sermon) && (
                      <div className="bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white"><Headphones className="w-4 h-4" /></div>
                    )}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[#5b0064] text-[9px] font-bold uppercase tracking-[0.15em]">
                      Session {String(idx + 1).padStart(2, '0')} &bull; {formatDate(sermon.sermonDate)}
                    </p>
                    <h3 className="font-serif text-xl text-[#1a1c20] leading-tight group-hover:text-[#5b0064] transition-colors line-clamp-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {sermon.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-[#d5c0d1]/40">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                      {sermon.speakerImageUrl ? (
                        <img src={sermon.speakerImageUrl} alt={sermon.speaker} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-[#712ae2] uppercase">{sermon.speaker?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#1a1c20] uppercase tracking-[0.1em]">{sermon.speaker}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-16 flex justify-center">
            <button onClick={() => setVisibleCount(p => p + 6)} className="bg-[#5b0064] text-white px-12 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-[#5b0064]/40 hover:scale-105 active:scale-95 transition-all">
              Load More Messages
            </button>
          </div>
        )}
      </main>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-5 py-3 bg-[#09090b]/95 backdrop-blur-lg border-t border-[#d5c0d1]/10 z-50 rounded-t-xl shadow-[0_-4px_16px_rgba(0,0,0,0.4)]">
        <Link to="/sermons/series" className="flex flex-col items-center justify-center text-[#5b0064] bg-[#5b0064]/10 rounded-full p-2">
          <Clapperboard className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Series</span>
        </Link>
        <Link to="/" className="flex flex-col items-center justify-center text-[#e2e2e8]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Home</span>
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

export default SeriesDetail;