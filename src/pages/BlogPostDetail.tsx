import SEO from '../components/SEO';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, Loader } from 'lucide-react';
import { blogApi } from '../api/blogApi';
import BlogCard from '../components/blog/BlogCard';
import BlogSidebar from '../components/blog/BlogSidebar';
import ShareButtons from '../components/blog/ShareButtons';
import SmartImage from '../components/SmartImage';
import { getReadTime } from '../utils/readTime';
import type { BlogBlockDto } from '../types';

function AuthorAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-semibold`}>
      {initials}
    </div>
  );
}

function DepartmentBadge({ department }: { department: string }) {
  return (
    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-[#f3f3f9] text-[#5b0064]">
      {department}
    </span>
  );
}

function ContentBlock({ block }: { block: BlogBlockDto }) {
  switch (block.blockType) {
    case 'Heading':
      return (
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-10 mb-4 border-l-4 border-[#5b0064] pl-4">
          {block.content}
        </h2>
      );
    case 'Paragraph':
      return (
        <p className="w-full max-w-full text-gray-700 text-[17px] leading-relaxed mb-6 whitespace-pre-wrap text-justify">
          {block.content}
        </p>
      );
    case 'Image':
      return (
        <SmartImage
          src={block.imageUrl}
          alt={block.imageUrl?.split('/').pop() ?? 'Blog post image'}
          variant="article"
        />
      );
    case 'Quote': {
      const [quote, author] = (block.content ?? '').split('|').map((s) => s.trim());
      return (
        <blockquote className="my-8 bg-purple-50 border-l-4 border-[#5b0064] p-6 rounded-r-2xl">
          <p className="text-xl italic text-gray-800 mb-2">{`"${quote}"`}</p>
          {author && <p className="text-sm font-semibold text-gray-700">{author}</p>}
        </blockquote>
      );
    }
    default:
      return null;
  }
}

const BlogPostDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const { data: postData, isLoading } = useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Missing slug');
      const response = await blogApi.getBlogPostBySlug(slug);
      if (!response.data.isSuccess) throw new Error(response.data.message || 'Failed to load post');
      return response.data.data;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['blogRelated', slug],
    queryFn: async () => {
      if (!slug) return [];
      const response = await blogApi.getRelated(slug, 3);
      return response.data.data ?? [];
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] pt-20">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center py-40">
            <Loader className="animate-spin text-[#5b0064] w-8 h-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] pt-20">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <p className="text-gray-600 mb-6">The blog post you are looking for does not exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#d5c0d1] text-[#51424f] font-bold uppercase tracking-widest text-xs hover:border-[#5b0064] hover:text-[#5b0064] transition-all rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const post = postData;
  const formattedDate = new Date(post.createdOn).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const readTime = getReadTime(post.blocks);
  const absoluteUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${post.slug}` : `https://globalflameministry.org/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-[#f9f9ff] pt-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
      `}</style>
      <SEO
        title={post.title}
        description={post.excerpt || post.title}
        image={post.coverImageUrl || undefined}
        url={absoluteUrl}
        type="article"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#51424f] font-bold uppercase tracking-widest text-xs hover:text-[#5b0064] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            All posts
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <article>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {post.department && <DepartmentBadge department={post.department} />}
              <div className="flex items-center gap-2 text-[#51424f] text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <span className="text-[#51424f] text-sm">{readTime} min read</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1c20] leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-[#51424f] leading-relaxed mb-8 border-l-4 border-[#d5c0d1] pl-4">
                {post.excerpt}
              </p>
            )}

            {post.coverImageUrl && (
              <SmartImage
                src={post.coverImageUrl}
                alt={post.title}
                variant="article"
                priority
                className="mb-10"
              />
            )}

            {post.videoUrl && (
              <div className="w-full mb-10 rounded-2xl overflow-hidden bg-black">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={post.coverImageUrl ?? undefined}
                  className="w-full"
                  src={post.videoUrl}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-10 pb-8 border-b border-[#d5c0d1]/40">
              <div className="inline-flex items-center gap-2">
                <AuthorAvatar name={post.authorName} size="lg" />
                <div className="inline-flex items-center gap-2 text-[#1a1c20] font-medium">
                  <User className="w-4 h-4 text-[#837280]" />
                  {post.authorName}
                </div>
              </div>
            </div>

            <div className="mb-10">
              {post.blocks
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((block) => (
                  <ContentBlock key={block.id} block={block} />
                ))}
            </div>

            <div className="mb-12">
              <ShareButtons url={absoluteUrl} title={post.title} />
            </div>

            {relatedPosts.length > 0 && (
              <section className="pt-10 border-t border-[#d5c0d1]/40">
                <h3
                  className="text-2xl font-bold text-[#1a1c20] mb-6"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Related Posts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <BlogCard key={relatedPost.id} post={relatedPost} />
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <BlogSidebar />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BlogPostDetail;
