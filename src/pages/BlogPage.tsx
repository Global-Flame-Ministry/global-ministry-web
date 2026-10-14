import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search, Newspaper, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import BlogCard from '../components/blog/BlogCard';
import { blogApi } from '../api/blogApi';
import type { BlogQueryObject } from '../types';

const PAGE_SIZE = 9;

const BlogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ key: '', page: 1 });

  const filterKey = `${category}|${debouncedSearch}`;
  const pageNumber = pagination.key === filterKey ? pagination.page : 1;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: postsData, isLoading, error, refetch } = useQuery({
    queryKey: ['publishedBlogPosts', pageNumber, PAGE_SIZE, category, debouncedSearch],
    queryFn: async () => {
      const query: BlogQueryObject = { pageNumber, pageSize: PAGE_SIZE };
      if (category) query.department = category;
      if (debouncedSearch) query.searchTerm = debouncedSearch;
      const response = await blogApi.getPublishedPosts(query);
      if (!response.data.isSuccess) throw new Error(response.data.message || 'Failed to load posts');
      return {
        items: response.data.data?.items ?? [],
        totalCount: response.data.data?.totalCount ?? 0,
      };
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['blogDepartments'],
    queryFn: () => blogApi.getDepartments().then(res => res.data.data ?? []),
  });

  const posts = postsData?.items ?? [];
  const totalCount = postsData?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const selectCategory = (department: string) => {
    const next = new URLSearchParams(searchParams);
    if (department) next.set('category', department);
    else next.delete('category');
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] pt-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
      `}</style>
      <SEO
        title="Blog — Stories & Insights"
        description="Inspiring stories, spiritual insights, and community updates from Global Flame Ministry."
        url="https://globalflameministry.org/blog"
      />

      <section className="max-w-[1280px] mx-auto px-5 md:px-16 pt-10 pb-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f9] px-3 py-1
          text-xs font-semibold text-[#5b0064]">
          <Newspaper className="h-3.5 w-3.5" /> Blog
        </span>
        <h1
          className="mt-4 font-serif text-[32px] md:text-[44px] font-bold text-[#1a1c20] leading-[1.1] tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Stories <span className="italic font-normal">and</span> Insights
        </h1>
        <p className="mt-3 text-sm md:text-base text-[#51424f] max-w-2xl leading-relaxed">
          Discover inspiring stories, spiritual insights, and community updates from our ministry family.
        </p>

        <div className="mt-6 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#837280] group-focus-within:text-[#5b0064] transition-colors" />
            <input
              type="text"
              placeholder="Search stories, or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#d5c0d1] bg-[#f3f3f9]
                focus:ring-2 focus:ring-[#5b0064]/20 focus:border-[#5b0064] outline-none transition-all text-base"
            />
          </div>
        </div>
      </section>

      <main className="max-w-[1280px] mx-auto px-5 md:px-16 pb-16">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 mb-8">
          <button
            type="button"
            onClick={() => selectCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              !category ? 'bg-[#5b0064] text-white' : 'bg-[#f3f3f9] text-[#51424f] hover:text-[#5b0064]'
            }`}
          >
            All
          </button>
          {departments.map((dept) => (
            <button
              key={dept.name}
              type="button"
              onClick={() => selectCategory(dept.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                category === dept.name
                  ? 'bg-[#5b0064] text-white'
                  : 'bg-[#f3f3f9] text-[#51424f] hover:text-[#5b0064]'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm">{error instanceof Error ? error.message : 'An error occurred'}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm font-medium text-red-800 hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#5b0064] w-8 h-8" />
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPagination({ key: filterKey, page: pageNumber - 1 })}
                className="px-3 py-1.5 rounded-lg border border-[#d5c0d1] text-sm font-semibold text-[#51424f]
                  hover:border-[#5b0064] hover:text-[#5b0064] disabled:opacity-50 disabled:cursor-not-allowed
                  transition whitespace-nowrap cursor-pointer"
              >
                ← Prev
              </button>
              <span className="text-sm text-[#51424f] whitespace-nowrap">
                {pageNumber} / {totalPages}
              </span>
              <button
                type="button"
                disabled={pageNumber >= totalPages}
                onClick={() => setPagination({ key: filterKey, page: pageNumber + 1 })}
                className="px-3 py-1.5 rounded-lg border border-[#d5c0d1] text-sm font-semibold text-[#51424f]
                  hover:border-[#5b0064] hover:text-[#5b0064] disabled:opacity-50 disabled:cursor-not-allowed
                  transition whitespace-nowrap cursor-pointer"
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-[#f3f3f9] flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-[#b57edc]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1a1c20] mb-2">No posts found</h3>
            <p className="text-[#51424f] text-center max-w-md">
              {debouncedSearch
                ? `We couldn't find any posts matching "${debouncedSearch}". Try adjusting your search or filter.`
                : 'There are no blog posts available at the moment. Check back soon!'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogPage;
