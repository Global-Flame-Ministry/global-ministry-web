import { useEffect, useState, useCallback } from 'react';
import SEO from '../components/SEO';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Flame, Calendar, User } from 'lucide-react';
import { blogApi } from '../api/blogApi';
import type { BlogBlockDto, BlogPostResponseDto } from '../types';

function AuthorAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';

  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-semibold`}
    >
      {initials}
    </div>
  );
}

function ModuleBadge({ module }: { module: string }) {
  const isYouth = module.toLowerCase().includes('youth');
  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
        isYouth ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-purple-100 text-purple-700'
      }`}
    >
      {module}
    </span>
  );
}

function ContentBlock({ block }: { block: BlogBlockDto }) {
  switch (block.blockType) {
    case 'Heading':
      return (
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-10 mb-4 border-l-4 border-purple-600 pl-4">
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
        <figure className="my-8">
          <img src={block.imageUrl ?? ''} alt="" className="w-full max-w-2xl mx-auto rounded-xl object-cover" />
        </figure>
      );
    case 'Quote': {
      const [quote, author] = (block.content ?? '').split('|').map((s) => s.trim());
      return (
        <blockquote className="my-8 bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-xl">
          <p className="text-xl italic text-gray-800 mb-2">{`"${quote}"`}</p>
          {author && <footer className="text-purple-700 font-medium">— {author}</footer>}
        </blockquote>
      );
    }
    default:
      return null;
  }
}

export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostResponseDto | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await blogApi.getBlogPostBySlug(slug);

      if (response.data.isSuccess && response.data.data) {
        setPost(response.data.data);

        const relatedResponse = await blogApi.getPublishedPosts({
          module: response.data.data.module,
          pageSize: 4,
        });

        if (relatedResponse.data.isSuccess && relatedResponse.data.data) {
          setRelatedPosts(
            relatedResponse.data.data.items
              .filter((item) => item.slug !== slug)
              .slice(0, 3)
          );
        }
      } else {
        throw new Error(response.data.message || 'Post not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading the post.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const formattedDate = post
    ? new Date(post.createdOn).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Flame className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Post not found' ? 'Post Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'Post not found'
              ? "The post you're looking for doesn't exist or has been removed."
              : error}
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <SEO
        title={post?.title ?? 'Blog Post'}
        description={post?.excerpt || post?.title || 'Discover spiritual insights from Global Flame Ministry.'}
        image={post?.coverImageUrl || undefined}
        url={`https://globalflameministry.org/blog/${post?.slug || slug}`}
        type="article"
      />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 text-left">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#a21caf] hover:text-[#7c3aed] mb-6"
        >
          <span>←</span>
          Back to Blog
        </Link>

        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
            <div className="aspect-[21/9] bg-gray-200 rounded-2xl mb-8" />
            <div className="h-6 w-24 bg-gray-200 rounded-full mb-4" />
            <div className="h-10 bg-gray-200 rounded mb-4" />
            <div className="h-10 w-3/4 bg-gray-200 rounded mb-6" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 w-4/6 bg-gray-200 rounded" />
            </div>
          </div>
        ) : post ? (
          <article>
            {post.coverImageUrl && (
              <div className="w-full overflow-hidden mb-6">
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-[400px] sm:h-[500px] object-cover rounded-xl"
                />
              </div>
            )}

            <div className="mb-4">
              <ModuleBadge module={post.module} />
            </div>

            <h1 className="w-full text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 pb-8 border-b border-gray-200">
              <div className="inline-flex items-center gap-2">
                <AuthorAvatar name={post.authorName} size="lg" />
                <div className="text-gray-900 font-medium inline-flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {post.authorName}
                </div>
              </div>
              <div className="inline-flex items-center gap-2 text-gray-500 text-sm"> 
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </div>
            </div>

            <div className="w-full">
              {post.blocks
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((block) => (
                  <ContentBlock key={block.id} block={block} />
                ))}
            </div>
          </article>
        ) : null}

        {!isLoading && relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">More from {post?.module}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    {relatedPost.coverImageUrl ? (
                      <img
                        src={relatedPost.coverImageUrl}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center">
                        <Flame className="w-10 h-10 text-purple-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                      {relatedPost.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(relatedPost.createdOn).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
