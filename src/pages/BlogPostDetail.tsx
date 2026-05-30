import SEO from '../components/SEO';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Flame, Calendar, User, Loader } from 'lucide-react';
import { blogApi } from '../api/blogApi';
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
    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
      {department}
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
        <figure className="my-8 w-full mx-auto">
          <img
            src={block.imageUrl ?? ''}
            alt=""
            className="w-full max-h-[420px] md:max-h-[520px] object-cover rounded-xl"
          />
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
  const navigate = useNavigate();

  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['blogPost', slug],
    queryFn: async () => {
      const response = await blogApi.getBlogPostBySlug(slug!);
      if (!response.data.isSuccess || !response.data.data) throw new Error(response.data.message || 'Post not found');
      const postData = response.data.data;
      const relatedResponse = await blogApi.getPublishedPosts({
        department: postData.department,
        pageSize: 4,
      });
      const relatedPosts = (relatedResponse.data.data?.items ?? [])
        .filter((item) => item.slug !== slug)
        .slice(0, 3);
      return { post: postData, relatedPosts };
    },
    enabled: !!slug,
  });

  const post = queryData?.post ?? null;
  const relatedPosts = queryData?.relatedPosts ?? [];

  const formattedDate = post
    ? new Date(post.createdOn).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  if (error) {
    const errorMsg = error instanceof Error ? error.message : 'An error occurred while loading the post.';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Flame className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorMsg === 'Post not found' ? 'Post Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-gray-600 mb-6">
            {errorMsg === 'Post not found'
              ? "The post you're looking for doesn't exist or has been removed."
              : errorMsg}
          </p>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');
      `}</style>
      <SEO
        title={post?.title ?? 'Blog Post'}
        description={post?.excerpt || post?.title || 'Discover spiritual insights from Global Flame Ministry.'}
        image={post?.coverImageUrl || undefined}
        url={`https://globalflameministry.org/blog/${post?.slug || slug}`}
        type="article"
      />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 text-left">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-700 font-bold uppercase tracking-widest text-xs hover:text-fuchsia-600 transition-all duration-200 cursor-pointer mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader className="animate-spin text-fuchsia-600 w-8 h-8" />
          </div>
        ) : post ? (
          <article>
            {/* Cover Image */}
            {post.coverImageUrl && (
              <div className="w-full overflow-hidden mb-6">
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-auto max-h-[75vh] object-cover rounded-xl"
                />
              </div>
            )}

            {/* Video Player (optional) */}
            {post.videoUrl && (
              <div className="w-full my-6 rounded-xl overflow-hidden shadow-md">
                <video
                  controls
                  className="w-full rounded-xl"
                  src={post.videoUrl}
                />
              </div>
            )}

            <div className="mb-2">
              <DepartmentBadge department={post.department} />
            </div>

            <h1
              className="w-full text-xl md:text-3xl font-bold uppercase 
                tracking-tight text-[#2e1065] mt-3 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {post.title}
            </h1>

                {post.conferenceTheme && (
                  <div className="mt-6 mb-6">
                    <p className="text-sm tracking-widest text-fuchsia-600">
                      <span className="italic font-normal">Theme:</span>
                      <span className="block mt-1 font-bold text-base uppercase">{post.conferenceTheme}</span>
                    </p>
                    {post.themeScripture && (
                      <blockquote className="mt-3 border-l-4 border-fuchsia-500 pl-4">
                        <p className="text-base italic text-gray-600 leading-relaxed">
                          "{post.themeScripture}"
                        </p>
                      </blockquote>
                    )}
                  </div>
                )}

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

            {post.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed mb-8 italic border-l-4 border-purple-200 pl-4">
                {post.excerpt}
              </p>
            )}

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

        {!isLoading && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            {relatedPosts.length > 0 ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended</h3>
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
              </>
            ) : (
              <div className="flex justify-center">
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-700 font-bold uppercase tracking-widest text-xs hover:text-fuchsia-600 transition-all duration-200 cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </button>
              </div>
            )}
          </section>
        )}
      </main>

    </div>
  );
}
