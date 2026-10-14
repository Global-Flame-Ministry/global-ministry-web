import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tag as TagIcon } from 'lucide-react';
import { blogApi } from '../../api/blogApi';
import SmartImage from '../SmartImage';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const BlogSidebar: React.FC = () => {
  const { data: postsData } = useQuery({
    queryKey: ['blogSidebarLatest'],
    queryFn: () =>
      blogApi
        .getPublishedPosts({ pageSize: 4, pageNumber: 1, sortBy: 'createdOn', isDescending: true })
        .then(res => res.data.data?.items ?? []),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['blogDepartments'],
    queryFn: () => blogApi.getDepartments().then(res => res.data.data ?? []),
  });

  const latest = postsData ?? [];

  return (
    <aside className="space-y-8">
      <div className="rounded-2xl border border-[#d5c0d1]/40 bg-white p-6 cinematic-shadow">
        <h3
          className="font-serif text-lg font-semibold text-[#1a1c20]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Latest Posts
        </h3>
        <div className="mt-4 space-y-4">
          {latest.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group flex gap-3">
              <div className="h-12 w-12 shrink-0">
                <SmartImage
                  src={post.coverImageUrl}
                  alt={post.title}
                  variant="thumb"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#1a1c20] line-clamp-2
                  group-hover:text-[#5b0064] transition-colors">
                  {post.title}
                </p>
                <p className="mt-0.5 text-xs text-[#51424f]">{formatDate(post.createdOn)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {departments.length > 0 && (
        <div className="rounded-2xl border border-[#d5c0d1]/40 bg-white p-6 cinematic-shadow">
          <h3
            className="font-serif text-lg font-semibold text-[#1a1c20]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Categories
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {departments.map(dept => (
              <Link
                key={dept.name}
                to={`/blog?category=${encodeURIComponent(dept.name)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#d5c0d1] bg-[#f3f3f9]
                  px-3 py-1 text-xs font-medium text-[#51424f] transition-colors
                  hover:border-[#5b0064] hover:text-[#5b0064]"
              >
                <TagIcon className="h-3 w-3" />
                {dept.name}
                {dept.count > 0 && <span className="text-[#837280]">({dept.count})</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default BlogSidebar;
