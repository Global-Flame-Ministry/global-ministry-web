import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { Search, Library, ChevronRight, Home, Clapperboard, User, ArrowLeft } from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import type { SermonDto } from '../types';

const BADGE_COLORS = [
  { bg: 'bg-[#5b0064]', text: 'text-white' },
  { bg: 'bg-[#712ae2]', text: 'text-white' },
  { bg: 'bg-[#673f00]', text: 'text-[#ffddb8]' },
  { bg: 'bg-[#653e00]', text: 'text-[#ffddb8]' },
  { bg: 'bg-[#837280]', text: 'text-white' },
  { bg: 'bg-[#80008c]', text: 'text-[#fffbff]' },
  { bg: 'bg-[#482b00]', text: 'text-[#ffddb8]' },
  { bg: 'bg-[#2a1700]', text: 'text-[#fca416]' },
];

const getBadgeStyle = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
};

const CATEGORIES = [
  { key: 'Conference', label: 'Conference' },
  { key: 'PowerService', label: 'Power Service' },
  { key: 'MorningGlory', label: 'Morning Glory' },
] as const;

const Sermons: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<'Conference' | 'PowerService' | 'MorningGlory'>('Conference');
  const { data: allSermonsData, isLoading } = useQuery({
    queryKey: ['publishedSermons', activeCategory],
    queryFn: () => sermonApi.getAll({ pageSize: 100, category: activeCategory }).then(res => res.data.data?.items ?? []),
  });
  const allSermons = useMemo(() => allSermonsData ?? [], [allSermonsData]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedSeries, setSelectedSeries] = useState('');

  const seriesGroups = useMemo(() => {
    const map = new Map<string, SermonDto[]>();
    allSermons.forEach(s => {
      if (!s.series) return;
      const list = map.get(s.series) || [];
      list.push(s);
      list.sort((a, b) => new Date(a.sermonDate).getTime() - new Date(b.sermonDate).getTime());
      map.set(s.series, list);
    });
    return Array.from(map.entries()).map(([name, list]) => ({
      name,
      sermons: list,
      messageCount: list.length,
      imageUrl: list.find(s => s.imageUrl)?.imageUrl || '',
      firstSermonTitle: list[0]?.title || null,
      theme: list.find(s => s.theme)?.theme || null,
    }));
  }, [allSermons]);

  const conferenceSeries = useMemo(() => {
    if (activeCategory !== 'Conference') return [];
    return [...new Set(allSermons.filter(s => s.series?.trim()).map(s => s.series as string))];
  }, [allSermons, activeCategory]);

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return seriesGroups;
    const q = searchQuery.toLowerCase();
    return seriesGroups.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.sermons.some(s =>
        s.speaker?.toLowerCase().includes(q) ||
        s.title?.toLowerCase().includes(q)
      )
    );
  }, [seriesGroups, searchQuery]);

  const seriesFiltered = useMemo(() => {
    if (!selectedSeries) return searched;
    return searched.filter(g => g.name === selectedSeries);
  }, [searched, selectedSeries]);

  const visibleSeries = seriesFiltered.slice(0, visibleCount);
  const hasMore = seriesFiltered.length > visibleCount;

  return (
    <>
      <SEO
        title="Message Archive | Global Flame Ministry"
        description="Browse our complete collection of sermon series, teachings, and messages from Global Flame Ministry."
        url="https://globalflameministry.org/sermons"
      />

      {/* ─── HERO ─── */}
      <section className="relative h-[320px] flex items-center justify-center overflow-hidden bg-[#09090b]">
        <div className="absolute inset-0 bg-[#09090b]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-[#09090b]/80 to-[#f9f9ff]" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl w-full pt-16">
          <h1 className="font-display-lg text-5xl sm:text-6xl md:text-7xl text-white mb-8 tracking-tighter font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Message Archive
          </h1>
          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#ffb95f] z-10 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for series, speakers, or topics..."
              className="w-full bg-[#09090b]/60 border-2 border-[#5b0064]/30 backdrop-blur-xl text-white py-5 pl-16 pr-36 sm:pr-40 rounded-full focus:border-[#ffb95f] focus:ring-0 transition-all placeholder:text-white/50 shadow-2xl outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#5b0064] to-[#712ae2] text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform active:scale-95">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY TABS ─── */}
      <div className="sticky top-0 z-30 bg-[#f9f9ff] border-b border-[#d5c0d1]/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex gap-1 py-3 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setSelectedSeries(''); setVisibleCount(6); }}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-[#5b0064] text-white shadow-lg shadow-[#5b0064]/30'
                  : 'bg-white text-[#51424f] border border-[#d5c0d1]/30 hover:border-[#5b0064]/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {activeCategory === 'Conference' && conferenceSeries.length > 0 && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-3">
            <select
              value={selectedSeries}
              onChange={e => { setSelectedSeries(e.target.value); setVisibleCount(6); }}
              className="px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-[#51424f] border border-[#d5c0d1]/30 focus:border-[#5b0064] focus:outline-none focus:ring-1 focus:ring-[#5b0064] cursor-pointer pr-10 w-full sm:w-auto"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235b0064' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '12px' }}
            >
              <option value="">All Series</option>
              {conferenceSeries.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ─── FILTER + GRID ─── */}
      <section className="bg-[#f9f9ff] flex-1 max-w-[1280px] mx-auto px-4 sm:px-8 relative z-20 pb-32">
        <div className="flex justify-end mb-4">
          <button onClick={() => navigate(-1)} className="text-[#51424f] hover:text-[#5b0064] transition-colors p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden">
                <div className="aspect-video bg-gray-200" />
                <div className="p-8 space-y-4">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Series Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleSeries.map(group => {
              const badge = getBadgeStyle(group.name);
              const seriesSlug = group.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={group.name}
                  to={`/sermons/series/${encodeURIComponent(seriesSlug)}`}
                  className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(91,0,100,0.15),0_4px_12px_-5px_rgba(113,42,226,0.1)] transition-all hover:-translate-y-2"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {group.imageUrl ? (
                      <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Library className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className={`absolute top-4 left-4 ${badge.bg} ${badge.text} px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em]`}>
                      {group.name}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[#ffb95f] text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1">
                        <Library className="w-3.5 h-3.5" />
                        {group.messageCount} Message{group.messageCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-[#1a1c20] mb-1 leading-tight group-hover:text-[#5b0064] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {group.firstSermonTitle}
                    </h3>
                    {group.theme && (
                      <p className="text-[#712ae2] text-sm italic font-bold font-serif mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {group.theme}
                      </p>
                    )}
                    <div className="mt-auto pt-6 border-t border-[#d5c0d1]/40 flex justify-between items-center">
                      <span className="flex items-center gap-2 text-[#5b0064] font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                        View Series
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
            {!isLoading && visibleSeries.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="font-serif text-xl text-gray-400 italic">
                  {searchQuery ? 'No matching series found.' : 'No series available yet.'}
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#5b0064] hover:text-[#712ae2] transition-colors">
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-20 text-center">
            <button
              onClick={() => setVisibleCount(p => p + 6)}
              className="px-12 py-4 bg-white border-2 border-[#5b0064] text-[#5b0064] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#5b0064] hover:text-white transition-all shadow-[0_10px_30px_-10px_rgba(91,0,100,0.15)] active:scale-95"
            >
              Load More Series
            </button>
          </div>
        )}
      </section>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-5 py-3 bg-[#09090b]/95 backdrop-blur-lg border-t border-[#d5c0d1]/10 z-50">
        <Link to="/" className="flex flex-col items-center justify-center text-[#e2e2e8]">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Home</span>
        </Link>
        <Link to="/sermons" className="flex flex-col items-center justify-center text-[#5b0064] bg-[#5b0064]/10 rounded-full p-2">
          <Clapperboard className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Series</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center justify-center text-[#e2e2e8]">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] mt-1">Profile</span>
        </Link>
      </nav>
    </>
  );
};

export default Sermons;