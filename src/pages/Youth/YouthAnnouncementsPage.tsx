import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { announcementApi } from '../../api/announcementApi';
import type { AnnouncementDto } from '../../types';
import SEO from '../../components/SEO';

// ── ANNOUNCEMENT CARD ────────────────────────────────────────────────────────
const AnnouncementCard = ({ item }: { item: AnnouncementDto }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md border-l-4 border-fuchsia-500
                    hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        {/* Category badge */}
        {item.category && (
          <span className="inline-flex items-center px-3 py-1 rounded-full
                           text-xs font-semibold bg-fuchsia-100 text-fuchsia-700 mb-3">
            <Tag className="w-3 h-3 mr-1" />
            {item.category}
          </span>
        )}

        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>

        <p className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="w-4 h-4 mr-2 text-fuchsia-400" />
          {new Date(item.createdOn).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>

        {/* Content — collapse if long */}
        <div className={`text-gray-700 leading-relaxed text-sm
                         overflow-hidden transition-all duration-300
                         ${expanded ? 'max-h-none' : 'max-h-24'}`}>
          {item.content}
        </div>

        {item.content.length > 200 && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="mt-3 flex items-center text-fuchsia-600 font-semibold
                       text-sm hover:text-purple-700 transition-colors">
            {expanded ? (
              <>Show less <ChevronUp className="w-4 h-4 ml-1" /></>
            ) : (
              <>Read more <ChevronDown className="w-4 h-4 ml-1" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ── SKELETON ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md border-l-4
                  border-gray-200 p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
    </div>
  </div>
);

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
const YouthAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 9;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await announcementApi.getYouthAll({
          pageNumber: page,
          pageSize: PAGE_SIZE,
        });
        const result = res.data.data;
        if (page === 1) {
          setAnnouncements(result?.items ?? []);
        } else {
          setAnnouncements(prev => [...prev, ...(result?.items ?? [])]);
        }
        setHasMore(
          result ? result.pageNumber * result.pageSize < result.totalCount : false
        );
      } catch {
        setError('Failed to load announcements. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <SEO title="Youth Announcements" description="Latest announcements and updates for the Global Flame Ministry Youth Community." url="https://globalflameministry.org/youth/announcements" />

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-800 to-fuchsia-900
                          text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <Megaphone className="w-14 h-14 mx-auto mb-4 text-fuchsia-300" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Announcements
          </h1>
          <p className="text-lg font-light opacity-90 max-w-2xl mx-auto">
            Stay updated with the latest news, updates, and important
            information from the GFM Youth Community.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          )}

          {!error && !loading && announcements.length === 0 && (
            <div className="text-center py-20">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No announcements yet
              </h3>
              <p className="text-gray-400">
                Check back soon for updates from the Youth Community.
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map(item => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
            {loading && [...Array(PAGE_SIZE)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && !loading && (
            <div className="text-center mt-12">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-8 py-3 bg-fuchsia-600 text-white font-semibold
                           rounded-full hover:bg-purple-700 transition-colors
                           shadow-md">
                Load More
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default YouthAnnouncementsPage;