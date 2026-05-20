import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Flame } from 'lucide-react';
import { blogApi } from '../api/blogApi';
import type { BlogPostResponseDto, BlogQueryObject } from '../types';

const MODULES = ['All', 'Ministry', 'Youth'] as const;

type ModuleFilter = (typeof MODULES)[number];

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeModule, setActiveModule] = useState<ModuleFilter>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNumber(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query: BlogQueryObject = {
        pageNumber,
        pageSize,
      };

      if (activeModule !== 'All') {
        query.module = activeModule;
      }

      if (debouncedSearch) {
        query.searchTerm = debouncedSearch;
      }

      const response = await blogApi.getPublishedPosts(query);

      if (response.data.isSuccess && response.data.data) {
        setPosts(response.data.data.items);
        setTotalCount(response.data.data.totalCount);
      } else {
        throw new Error(response.data.message || 'Failed to load posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPosts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, activeModule, debouncedSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="py-10 border-b border-slate-200 mb-8">
          <p className="text-xs uppercase tracking-widest text-[#a21caf] font-bold mb-2">Blog</p>
          <h1 className="text-4xl font-bold text-[#111827] mb-3">Stories & Insights</h1>
          <p className="text-slate-500">Discover inspiring stories, spiritual insights, and community updates from our ministry family.</p>
        </div>
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {MODULES.map((module) => (
              <button
                key={module}
                type="button"
                onClick={() => {
                  setActiveModule(module);
                  setPageNumber(1);
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeModule === module
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:text-purple-700'
                }`}
              >
                {module}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm">{error}</p>
            <button
              type="button"
              onClick={fetchPosts}
              className="mt-2 text-sm font-medium text-red-800 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <p className="text-sm text-slate-500 mb-6">Showing {posts.length} of {totalCount} posts</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-5">
                  <div className="h-5 w-20 bg-gray-200 rounded-full mb-3" />
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
                        <div className="h-3 w-16 bg-gray-200 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-gray-200 rounded" />
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
              return (
                <article
                  key={post.id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all duration-300"
                >
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      {post.coverImageUrl ? (
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center">
                          <Flame className="w-12 h-12 text-purple-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {post.module}
                    </span>
                    <Link to={`/blog/${post.slug}`} className="block mt-3">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="mt-2 text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white text-xs font-semibold">
                          {post.authorName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{post.authorName}</p>
                          <p className="text-xs text-gray-500">{formattedDate}</p>
                        </div>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
                      >
                        Read More
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 text-center max-w-md">
                {debouncedSearch
                  ? `We couldn't find any posts matching "${debouncedSearch}". Try adjusting your search or filter.`
                  : 'There are no blog posts available at the moment. Check back soon!'}
              </p>
            </div>
          )}
        </div>

        {!isLoading && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              className="px-5 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#a21caf] hover:text-[#a21caf] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {pageNumber} of {totalPages}
            </span>
            <button
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
              className="px-5 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#a21caf] hover:text-[#a21caf] disabled:opacity-50 disabled:cursor-not-allowed transition"
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
