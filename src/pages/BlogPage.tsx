import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowLeft, Flame } from 'lucide-react';
import { blogApi } from '../api/blogApi';
import type { BlogQueryObject } from '../types';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeDepartment, setActiveDepartment] = useState<string>('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNumber(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: queryData, isLoading, error, refetch } = useQuery({
    queryKey: ['publishedBlogPosts', pageNumber, pageSize, activeDepartment, debouncedSearch],
    queryFn: async () => {
      const query: BlogQueryObject = { pageNumber, pageSize };
      if (activeDepartment !== 'All') query.department = activeDepartment;
      if (debouncedSearch) query.searchTerm = debouncedSearch;
      const response = await blogApi.getPublishedPosts(query);
      if (!response.data.isSuccess) throw new Error(response.data.message || 'Failed to load posts');
      return { items: response.data.data?.items ?? [], totalCount: response.data.data?.totalCount ?? 0 };
    },
  });

  const posts = queryData?.items ?? [];
  const totalCount = queryData?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const departments = [...new Set(posts.map(p => p.department).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#f9f9ff] pt-24">
      <SEO
        title="Blog — Stories & Insights"
        description="Inspiring stories, spiritual insights, and community updates from Global Flame Ministry."
        url="https://globalflameministry.org/blog"
      />

      <section className="max-w-[1280px] mx-auto px-5 md:px-16 pt-16 pb-12 text-center">
        <p className="text-xs uppercase tracking-widest text-[#a21caf] font-bold mb-4">Blog</p>
        <h1 className="font-serif text-[40px] md:text-[64px] font-bold text-[#1a1c20] mb-6 tracking-tight leading-[1.1]">
          Stories <span className="italic font-normal">and</span> Insights
        </h1>
        <p className="text-lg text-[#51424f] max-w-2xl mx-auto mb-12 leading-relaxed">
          Discover inspiring stories, spiritual insights, and community updates from our ministry family.
        </p>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#837280] group-focus-within:text-[#5b0064] transition-colors" />
            <input
              type="text"
              placeholder="Search stories, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#d5c0d1] bg-[#f3f3f9] focus:ring-2 focus:ring-[#5b0064]/20 focus:border-[#5b0064] outline-none transition-all text-base"
            />
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-2">
            <button
              type="button"
              onClick={() => { setActiveDepartment('All'); setPageNumber(1); }}
              className={`px-2 py-1 text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeDepartment === 'All'
                  ? 'border-[#5b0064] text-[#5b0064]'
                  : 'border-transparent text-[#51424f] hover:text-[#5b0064]'
              }`}
            >
              All Posts
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => { setActiveDepartment(dept); setPageNumber(1); }}
                className={`px-2 py-1 text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  activeDepartment === dept
                    ? 'border-[#5b0064] text-[#5b0064]'
                    : 'border-transparent text-[#51424f] hover:text-[#5b0064]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-[1280px] mx-auto px-5 md:px-16 pb-32">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#51424f] font-bold uppercase tracking-widest text-xs hover:text-[#5b0064] transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm">{error instanceof Error ? error.message : 'An error occurred'}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm font-medium text-red-800 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <p className="text-sm text-[#51424f] mb-8">
          Showing {posts.length} of {totalCount} posts
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="cinematic-shadow rounded-2xl bg-white p-4 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-xl mb-6" />
                <div className="px-2 space-y-4">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="h-4 w-20 bg-gray-200 rounded" />
                    </div>
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => {
              const formattedDate = new Date(post.createdOn).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const initials = post.authorName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              return (
                <article
                  key={post.id}
                  className="flex flex-col group cinematic-shadow rounded-2xl bg-white p-4 transition-all duration-300"
                >
                  <Link to={`/blog/${post.slug}`} className="overflow-hidden rounded-xl mb-3 aspect-video relative block">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center">
                        <Flame className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                  </Link>
                  <div className="px-2 space-y-3 flex-grow flex flex-col">
                    <span className="inline-block text-[#5b0064] font-bold text-xs uppercase tracking-widest">
                      {post.department}
                    </span>
                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="font-semibold text-lg text-[#1a1c20] group-hover:text-[#5b0064] transition-colors line-clamp-2 leading-tight">
                        {post.title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="text-[#51424f] text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-[#d5c0d1]/30 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#80008c] flex items-center justify-center text-white font-bold text-xs">
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-[#1a1c20]">{post.authorName}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#51424f]">
                        {formattedDate}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-[#5b0064] font-bold text-sm group-hover:gap-4 transition-all"
                    >
                      Read more <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#1a1c20] mb-2">No posts found</h3>
              <p className="text-[#51424f] text-center max-w-md">
                {debouncedSearch
                  ? `We couldn't find any posts matching "${debouncedSearch}". Try adjusting your search or filter.`
                  : 'There are no blog posts available at the moment. Check back soon!'}
              </p>
            </div>
          )}
        </div>

        {!isLoading && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#d5c0d1] text-sm font-semibold text-[#51424f] hover:border-[#5b0064] hover:text-[#5b0064] disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              ← Prev
            </button>
            <span className="text-sm text-[#51424f] whitespace-nowrap">
              {pageNumber} / {totalPages}
            </span>
            <button
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#d5c0d1] text-sm font-semibold text-[#51424f] hover:border-[#5b0064] hover:text-[#5b0064] disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogPage;
