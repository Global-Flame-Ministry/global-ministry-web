import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader, Play } from 'lucide-react';
import SEO from '../components/SEO';
import SmartImage from '../components/SmartImage';
import ClipPlayer from '../components/ClipPlayer';
import { getPosterUrl } from '../components/HeroCarousel';
import { getClipPoster } from '../utils/clipPoster';
import ContentBlock from '../components/blog/ContentBlock';
import ShareButtons from '../components/blog/ShareButtons';
import { heroApi } from '../api/heroApi';

const ClipDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const { data: clip, isLoading } = useQuery({
    queryKey: ['clip', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Missing slug');
      const response = await heroApi.getClipBySlug(slug);
      if (!response.data.isSuccess) throw new Error(response.data.message || 'Failed to load clip');
      return response.data.data;
    },
    enabled: !!slug,
  });

  const { data: allClips = [] } = useQuery({
    queryKey: ['publicClips'],
    queryFn: () => heroApi.getClips().then(res => res.data.data ?? []),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] pt-28">
        <div className="max-w-3xl mx-auto px-4 py-16 flex items-center justify-center">
          <Loader className="animate-spin text-[#5b0064] w-8 h-8" />
        </div>
      </div>
    );
  }

  if (!clip) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] pt-32">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-[#1a1c20] mb-4">Clip not found</h1>
          <p className="text-[#51424f] mb-6">This clip does not exist or is no longer available.</p>
          <button
            onClick={() => navigate('/clips')}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#d5c0d1] text-[#51424f] font-bold uppercase tracking-widest text-xs hover:border-[#5b0064] hover:text-[#5b0064] transition-all rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Clips
          </button>
        </div>
      </div>
    );
  }

  const absoluteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/clips/${clip.slug}`
    : `https://globalflameministry.org/clips/${clip.slug}`;
  const poster = clip.url ? getClipPoster(clip.url) : undefined;
  const moreClips = allClips.filter((c) => c.slug && c.slug !== clip.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f9f9ff] pt-24 pb-24">
      <SEO
        title={clip.title ?? 'Short Clip'}
        description={clip.subtitle ?? 'Watch a short clip from Global Flame Ministry.'}
        image={poster}
        url={absoluteUrl}
        type="video.other"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <Link
          to="/clips"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#837280] hover:text-[#5b0064] transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All clips
        </Link>

        <ClipPlayer src={clip.url} title={clip.title} />

        <header className="mt-8 mb-10">
          {clip.title && (
            <h1
              className="text-3xl sm:text-4xl font-bold text-[#1a1c20] leading-tight break-words"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {clip.title}
            </h1>
          )}
          {clip.subtitle && (
            <p className="text-lg text-[#51424f] mt-3 leading-relaxed break-words">{clip.subtitle}</p>
          )}
        </header>

        {clip.contentBlocks && clip.contentBlocks.length > 0 && (
          <article className="mb-12">
            {clip.contentBlocks
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((block) => (
                <ContentBlock key={block.id} block={block} />
              ))}
          </article>
        )}

        <div className="pt-8 border-t border-[#d5c0d1]/40">
          <ShareButtons url={absoluteUrl} title={clip.title ?? 'Short clip'} />
        </div>

        {moreClips.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#d5c0d1]/40">
            <h2
              className="text-2xl font-bold text-[#1a1c20] mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              More clips
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreClips.map((c) => {
                const thumb = getPosterUrl(c.url);
                return (
                  <Link
                    key={c.id}
                    to={`/clips/${c.slug}`}
                    className="group rounded-xl overflow-hidden bg-white shadow-[0_10px_30px_-10px_rgba(91,0,100,0.15),0_4px_12px_-5px_rgba(113,42,226,0.1)] transition-all hover:-translate-y-2"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      {thumb ? (
                        <SmartImage
                          src={thumb}
                          alt={c.title ?? 'Short clip'}
                          variant="frame"
                          ratio={16 / 9}
                          rounded=""
                          className="h-full w-full"
                        />
                      ) : (
                        <video
                          src={c.url}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-12 h-12 rounded-full bg-white/90 text-[#5b0064] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </span>
                      </span>
                    </div>
                    <div className="p-5">
                      <h3
                        className="font-serif text-lg text-[#1a1c20] leading-tight group-hover:text-[#5b0064] transition-colors"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {c.title || 'Untitled clip'}
                      </h3>
                      {c.subtitle && (
                        <p className="text-sm text-[#51424f] mt-1 line-clamp-2">{c.subtitle}</p>
                      )}
                      <span className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#712ae2] group-hover:text-[#5b0064] transition-colors">
                        {c.hasWriteUp ? 'Watch and read' : 'Watch'}
                        <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ClipDetail;
