import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell, Search, Calendar, Tag, ArrowRight,
  X, AlertCircle, Link as LinkIcon, ExternalLink
} from 'lucide-react';
import { announcementApi } from '../api/announcementApi';
import type { AnnouncementDto } from '../types';

// ── SCROLL REVEAL ────────────────────────────────────────────────────────────
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

// ── LINK DETECTION ───────────────────────────────────────────────────────────
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const renderContentWithLinks = (text: string) => {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      const domain = (() => {
        try { return new URL(part).hostname.replace('www.', ''); }
        catch { return part; }
      })();
      return (
        
         <a key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-fuchsia-600 hover:text-fuchsia-800
            underline underline-offset-2 decoration-fuchsia-300 hover:decoration-fuchsia-600
            transition-colors font-medium break-all"
        >
          <LinkIcon className="w-3 h-3 shrink-0" />
          {domain}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// ── SKELETON ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse border border-slate-100 rounded-xl p-6 bg-white">
    <div className="flex justify-between mb-4">
      <div className="h-4 bg-slate-200 rounded w-20" />
      <div className="h-4 bg-slate-200 rounded w-24" />
    </div>
    <div className="h-6 bg-slate-200 rounded mb-3 w-3/4" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
      <div className="h-4 bg-slate-200 rounded w-4/6" />
    </div>
  </div>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDto | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 9;

  const rHero    = useReveal(0);
  const rFilters = useReveal(100);
  const rGrid    = useReveal(200);

  // ── DERIVE CATEGORIES FROM FETCHED DATA (same as old code) ─────────────────
  const categories = useMemo(() => {
    return [...new Set(announcements.map(a => a.category).filter(Boolean))] as string[];
  }, [announcements]);

  // ── FETCH ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await announcementApi.getAll({
          pageNumber,
          pageSize,
          title: searchQuery || undefined,
          category: selectedCategory || undefined,
          module: 'Ministry',
        });
        if (response.data.isSuccess && response.data.data) {
          setAnnouncements(response.data.data.items);
          setTotalCount(response.data.data.totalCount);
        }
      } catch (err) {
        setError("We couldn't load the announcements. Please try again later.");
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    const timeout = setTimeout(fetchAnnouncements, 400);
    return () => clearTimeout(timeout);
  }, [pageNumber, searchQuery, selectedCategory]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

  const totalPages = Math.ceil(totalCount / pageSize);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#fafafa] min-h-screen font-sans selection:bg-fuchsia-100">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,#4a044e,transparent)] opacity-40" />
        <div ref={rHero} style={fadeStyle} className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
            bg-fuchsia-500/10 border border-fuchsia-500/20 mb-6">
            <Bell className="w-4 h-4 text-fuchsia-400" />
            <span className="text-fuchsia-400 uppercase tracking-widest text-[10px] font-bold">
              Latest Updates
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 tracking-tight">
            Announcements
          </h1>
          <p className="text-white/40 text-base mb-8 max-w-lg mx-auto">
            Stay informed with the latest news, events, and updates from Global Flame Ministries.
          </p>
          {/* Search */}
          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5
              group-focus-within:text-fuchsia-400 transition-colors" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPageNumber(1); }}
              className="w-full bg-white/5 backdrop-blur-md border border-white/10 text-white
                placeholder:text-white/30 pl-14 pr-12 py-4 rounded-2xl outline-none
                focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50
                transition-all shadow-2xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 pb-24">

        {/* ── CATEGORY FILTERS ────────────────────────────────────────────── */}
        <div
          ref={rFilters}
          style={fadeStyle}
          className="flex flex-wrap items-center gap-2 mb-12 bg-white p-2 rounded-2xl
            shadow-sm border border-slate-100 overflow-x-auto scrollbar-hide"
        >
          {/* All button */}
          <button
            onClick={() => { setSelectedCategory(''); setPageNumber(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
              transition-all ${
              selectedCategory === ''
                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            All Updates
            {selectedCategory === '' && totalCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {totalCount}
              </span>
            )}
          </button>

          {/* Category buttons — derived dynamically from fetched announcements */}
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setPageNumber(1); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────────────── */}
        <div ref={rGrid} style={fadeStyle}>

          {/* Error state */}
          {error ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-red-50">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold
                  text-sm uppercase tracking-widest"
              >
                Retry
              </button>
            </div>

          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>

          ) : announcements.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 border-dashed">
              <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No announcements found.</p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
                  className="mt-4 text-sm text-fuchsia-600 hover:underline font-semibold"
                >
                  Clear filters
                </button>
              )}
            </div>

          ) : (
            // ── ANNOUNCEMENT GRID ──────────────────────────────────────────
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((item, idx) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedAnnouncement(item)}
                  className="group bg-white border border-slate-100 rounded-2xl
                    hover:border-fuchsia-300 hover:shadow-[0_20px_50px_rgba(217,70,239,0.05)]
                    transition-all duration-500 cursor-pointer flex flex-col overflow-hidden"
                  style={{
                    animationDelay: `${idx * 60}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <div className="p-7 flex flex-col flex-1">
                    {/* Meta row */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg
                        text-[10px] font-black uppercase tracking-widest
                        bg-fuchsia-50 text-fuchsia-600">
                        {item.category || 'General'}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.createdOn)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-3
                      group-hover:text-fuchsia-600 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Content preview — with link detection */}
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                      {renderContentWithLinks(item.content)}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-fuchsia-600 text-xs
                        font-black uppercase tracking-[0.15em]
                        group-hover:gap-3 transition-all duration-300">
                        Read More
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      {URL_REGEX.test(item.content) && (() => {
                        URL_REGEX.lastIndex = 0;
                        return (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <LinkIcon className="w-3 h-3" />
                            Contains link
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ── PAGINATION ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-16">
            <button
              disabled={pageNumber === 1}
              onClick={() => setPageNumber(prev => prev - 1)}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight className="w-5 h-5 rotate-180 text-slate-600" />
            </button>
            <span className="text-sm font-bold text-slate-400 px-4">
              Page <span className="text-slate-900">{pageNumber}</span> of {totalPages}
            </span>
            <button
              disabled={pageNumber === totalPages}
              onClick={() => setPageNumber(prev => prev + 1)}
              className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}
      </main>

      {/* ── DETAIL MODAL ────────────────────────────────────────────────────── */}
      {selectedAnnouncement && (() => {
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setSelectedAnnouncement(null)}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl
              overflow-hidden max-h-[90vh] flex flex-col">

              {/* Close button */}
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100
                  text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable content */}
              <div className="overflow-y-auto p-8 md:p-10 flex-1">

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                    text-[10px] font-black uppercase tracking-widest
                    bg-fuchsia-50 text-fuchsia-600">
                    <Tag className="w-3 h-3" />
                    {selectedAnnouncement.category || 'General'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(selectedAnnouncement.createdOn)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900
                  mb-6 leading-tight">
                  {selectedAnnouncement.title}
                </h2>

                {/* Divider */}
                <div className="h-0.5 w-16 rounded-full mb-6 bg-fuchsia-400" />

                {/* Full content — with link detection */}
                <div className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                  {renderContentWithLinks(selectedAnnouncement.content)}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 shrink-0">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold
                    uppercase tracking-widest text-sm hover:bg-fuchsia-600
                    hover:shadow-xl hover:shadow-fuchsia-200 transition-all
                    active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AnnouncementsPage;