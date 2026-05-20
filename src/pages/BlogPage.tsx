import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Filter } from 'lucide-react';
import { blogApi } from '../api/blogApi';
import type { BlogPostResponseDto } from '../types';

const MODULES = ['Ministry', 'Youth'];

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostResponseDto[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(9);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await blogApi.getPublishedPosts({
          searchTerm: search || undefined,
          module: moduleFilter || undefined,
          pageNumber,
          pageSize,
        });
        if (res.data.isSuccess && res.data.data) {
          setPosts(res.data.data.items);
          setTotalCount(res.data.data.totalCount);
        }
      } catch {
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [search, moduleFilter, pageNumber, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-7xl space-y-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#a21caf] font-black mb-2">
                Blog
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111827]">
                Stories and reflections from Global Flame.
              </h1>
            </div>
            <p className="max-w-xl text-sm text-slate-500">
              Browse published posts, filter by ministry or youth module, and read deeper into the latest church stories.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
          <div className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPageNumber(1); }}
                    placeholder="Search posts"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#a21caf] focus:bg-white"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="relative block">
                  <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={moduleFilter}
                    onChange={e => { setModuleFilter(e.target.value); setPageNumber(1); }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#a21caf] focus:bg-white"
                  >
                    <option value="">All Modules</option>
                    {MODULES.map(module => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse rounded-3xl bg-slate-100 p-6 h-60" />
                ))
              ) : posts.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                  No blog posts match your search.
                </div>
              ) : (
                posts.map(post => (
                  <article key={post.id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                    {post.coverImageUrl && (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="h-56 w-full object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#f5dbff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7c3aed]">
                          {post.module}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
                          {new Date(post.createdOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-[#111827] mb-3">{post.title}</h2>
                      <p className="text-sm leading-7 text-slate-600 flex-1">{post.excerpt ?? 'No excerpt available.'}</p>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-500">By {post.authorName}</div>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 rounded-full bg-[#a21caf] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7c3aed]"
                        >
                          Read more <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-4">Showing {posts.length} of {totalCount} posts</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">Page {pageNumber} of {totalPages}</div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#a21caf] hover:text-[#a21caf] disabled:cursor-not-allowed disabled:opacity-50"
                >Previous</button>
                <button
                  type="button"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#a21caf] hover:text-[#a21caf] disabled:cursor-not-allowed disabled:opacity-50"
                >Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
