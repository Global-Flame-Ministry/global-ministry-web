import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Play, Search, Filter, Music, Video } from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import type { SermonDto } from '../types';
import auditorium from '../assets/auditorium.jpg';

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

const Sermons: React.FC = () => {
  const [sermons, setSermons] = useState<SermonDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const rHeader = useReveal(0);
  const rGrid   = useReveal(150);

  const fadeStyle: React.CSSProperties = {
    opacity: 0,
    transform: 'translateY(32px)',
    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
  };

  useEffect(() => {
    const fetchSermons = async () => {
      setIsLoading(true);
      try {
        const response = await sermonApi.getAll({ pageSize: 9 });
        if (response.data.isSuccess && response.data.data) {
          setSermons(response.data.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch sermons:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSermons();
  }, []);

  const filteredSermons = sermons.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.series.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20">
      <SEO
        title="Sermons & Messages"
        description="Watch and listen to powerful sermons and messages from Apostle Danjuma Musa and Global Flame Ministry. Browse our full message archive."
        url="https://globalflameministry.org/sermons"
      />

      {/* ── CINEMATIC HEADER ── */}
      <section className="relative h-[40vh] sm:h-[45vh] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          {/* 
            Background image: object-cover + object-center is correct here
            because the auditorium is a wide establishing shot, not a portrait.
          */}
          <img
            src={auditorium}
            alt="Atmosphere"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-[#fcfcfc]" />
        </div>
        <div
          ref={rHeader}
          style={fadeStyle}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full text-center"
        >
          <span className="text-blue-400 font-bold tracking-[0.4em] uppercase text-[9px] mb-4 block">
            The Digital Library
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-6 tracking-tight">
            Message <span className="italic text-blue-200 font-light">Archive</span>
          </h1>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-6 sm:mt-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1.5
              rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search series, speakers, or topics..."
                  className="w-full bg-transparent pl-11 pr-4 py-2.5 text-sm text-white
                    placeholder:text-white/30 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="hidden sm:flex items-center px-4 border-l border-white/10 gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isLoading ? 'bg-yellow-400 animate-pulse'
                    : filteredSermons.length > 0 ? 'bg-emerald-400 animate-pulse'
                    : 'bg-red-400'
                }`} />
                <span className="text-[9px] uppercase tracking-widest text-white/50 font-medium whitespace-nowrap">
                  {isLoading
                    ? 'Loading...'
                    : filteredSermons.length > 0
                      ? `${filteredSermons.length} Found`
                      : 'No Match'
                  }
                </span>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2
                px-3 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-lg
                font-bold uppercase tracking-widest text-[10px] transition-all">
                <Filter className="w-3.5 h-3.5" />
                Refine
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT GRID ── */}
      <div ref={rGrid} style={fadeStyle} className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[16/10] rounded-xl bg-slate-200 mb-6" />
                <div className="h-4 bg-slate-200 rounded mb-3 w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {filteredSermons.length > 0 ? (
              filteredSermons.map((sermon, idx) => (
                <Link
                  key={sermon.id}
                  to={`/sermons/${sermon.slug || sermon.id}`}
                  className="group cursor-pointer block animate-fadeUp"
                  style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                >
                  {/* 
                    Sermon cover image.
                    object-top is CRITICAL — sermon images are typically photos
                    of speakers at a pulpit. Without it, the face is cropped out
                    because object-cover defaults to centering vertically.
                  */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden
                    shadow-lg border border-slate-100 bg-white">
                    {sermon.imageUrl ? (
                      <img
                        src={sermon.imageUrl}
                        className="w-full h-full object-cover object-top"
                        alt={sermon.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <Music className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/20
                      group-hover:bg-slate-900/40 transition-colors" />
                    {/* Series badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur
                      px-3 py-1 rounded-md shadow-sm">
                      <p className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">
                        {sermon.series}
                      </p>
                    </div>
                    {/* Play icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center
                      opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex
                        items-center justify-center text-black">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Card info */}
                  <div className="mt-5 sm:mt-6 space-y-2 px-1">
                    <div className="flex items-center gap-2 text-[10px] text-amber-600
                      font-bold uppercase tracking-widest">
                      <Video size={12} /> HD Broadcast
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif text-slate-900 leading-tight
                      group-hover:text-gray-600 transition-colors">
                      {sermon.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 font-light text-justify">
                      {sermon.description}
                    </p>

                    {/* Speaker row */}
                    <div className="flex items-center gap-3 pt-3 sm:pt-4">
                      {/* 
                        Speaker avatar: object-top so the face is visible.
                        Speaker photos are usually headshots — face is at top.
                      */}
                      <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden
                        flex items-center justify-center shrink-0 border border-slate-200">
                        {sermon.speakerImageUrl ? (
                          <img
                            src={sermon.speakerImageUrl}
                            alt={sermon.speaker}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span className="text-[11px] font-black text-fuchsia-700
                            uppercase select-none">
                            {sermon.speaker.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-600
                          uppercase tracking-widest block leading-tight">
                          {sermon.speaker}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(sermon.sermonDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed
                border-slate-200 rounded-3xl">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-serif italic text-lg">
                  {sermons.length === 0
                    ? 'No sermons have been published yet.'
                    : 'No matching messages in the archive.'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-blue-600 text-xs font-bold uppercase tracking-widest"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sermons;