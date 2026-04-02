import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bell, Search, Calendar, Tag, ArrowRight, X, AlertCircle } from 'lucide-react';
import { announcementApi } from '../api/announcementApi';
import type { AnnouncementDto } from '../types';

const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

const fadeStyle: React.CSSProperties = {
  opacity: 0,
  transform: 'translateY(32px)',
  transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
};

const SkeletonCard = () => (
  <div className="animate-pulse border border-slate-100 rounded-xl p-6 bg-white">
    <div className="flex justify-between mb-4">
      <div className="h-4 bg-slate-200 rounded w-20" />
      <div className="h-4 bg-slate-200 rounded w-24" />
    </div>
    <div className="h-6 bg-slate-200 rounded mb-3 w-full" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
    </div>
  </div>
);

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDto | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 9;

  const rHero = useReveal(0);
  const rFilters = useReveal(100);
  const rGrid = useReveal(200);

  const categories = useMemo(() => {
    return [...new Set(announcements.map(a => a.category).filter(Boolean))];
  }, [announcements]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await announcementApi.getAll({
          pageNumber, pageSize,
          title: searchQuery || undefined,
          category: selectedCategory || undefined,
          module: 'Ministry',
        });
        if (response.data.isSuccess && response.data.data) {
          setAnnouncements(response.data.data.items);
          setTotalCount(response.data.data.totalCount);
        }
      } catch (err) {
        setError('We couldn\'t load the announcements. Please try again later.');
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    const timeout = setTimeout(fetchAnnouncements, 400);
    return () => clearTimeout(timeout);
  }, [pageNumber, searchQuery, selectedCategory]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="bg-[#fafafa] min-h-screen font-sans selection:bg-fuchsia-100">

      {/* Hero Section */}
      <section className="bg-[#0a0a0a] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,#4a044e,transparent)] opacity-40" />
        <div ref={rHero} style={fadeStyle} className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-6">
            <Bell className="w-4 h-4 text-fuchsia-400" />
            <span className="text-fuchsia-400 uppercase tracking-widest text-[10px] font-bold">Latest Updates</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight">Announcements</h1>
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5 group-focus-within:text-fuchsia-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by title or keyword..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPageNumber(1); }}
              className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-white/30 pl-14 pr-12 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all shadow-2xl"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 pb-20">

        {/* Filters */}
        <div ref={rFilters} style={fadeStyle}
          className="flex flex-wrap items-center gap-3 mb-12 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => { setSelectedCategory(''); setPageNumber(1); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              selectedCategory === '' ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            All Updates
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setPageNumber(1); }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === cat ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status + Grid */}
        <div ref={rGrid} style={fadeStyle}>
          {error ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-red-50">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm uppercase tracking-widest">Retry</button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 border-dashed">
              <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No announcements found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.map((item, idx) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedAnnouncement(item)}
                  className="group bg-white border border-slate-100 rounded-2xl p-8 hover:border-fuchsia-300 hover:shadow-[0_20px_50px_rgba(217,70,239,0.05)] transition-all duration-500 cursor-pointer flex flex-col h-full animate-fadeUp"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-fuchsia-50 text-fuchsia-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {item.category || 'General'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter">
                      {formatDate(item.createdOn)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 group-hover:text-fuchsia-600 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-8 flex-grow text-justify">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-2 text-fuchsia-600 text-xs font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                    Read Announcement <ArrowRight className="w-4 h-4" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-20">
            <button disabled={pageNumber === 1} onClick={() => setPageNumber(prev => prev - 1)}
              className="p-3 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 transition-all">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <span className="text-sm font-bold text-slate-400 mx-4">
              Page <span className="text-slate-900">{pageNumber}</span> of {totalPages}
            </span>
            <button disabled={pageNumber === totalPages} onClick={() => setPageNumber(prev => prev + 1)}
              className="p-3 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 transition-all">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedAnnouncement(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedAnnouncement(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className="p-10 pt-16">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="w-4 h-4 text-fuchsia-500" />
                <span className="text-xs font-black text-fuchsia-600 uppercase tracking-widest">{selectedAnnouncement.category || 'General'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-400">{formatDate(selectedAnnouncement.createdOn)}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                {selectedAnnouncement.title}
              </h2>
              <div className="prose prose-fuchsia max-w-none">
                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap text-justify">
                  {selectedAnnouncement.content}
                </p>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)}
                className="mt-12 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-fuchsia-600 hover:shadow-xl hover:shadow-fuchsia-200 transition-all transform active:scale-[0.98]">
                Close Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;