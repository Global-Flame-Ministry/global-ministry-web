import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { getReadTime } from '../../utils/readTime';
import SmartImage from '../SmartImage';
import type { BlogPostResponseDto } from '../../types';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

interface BlogCardProps {
  post: BlogPostResponseDto;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const readTime = getReadTime(post.blocks);

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-[#d5c0d1]/40
        cinematic-shadow transition-all duration-300 hover:-translate-y-1"
    >
      <SmartImage
        src={post.coverImageUrl}
        alt={post.title}
        variant="frame"
        ratio={16 / 10}
        rounded=""
        className="w-full"
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          {post.department && (
            <span className="inline-flex items-center rounded-full bg-[#f3f3f9] px-3 py-1
              text-[10px] font-bold uppercase tracking-widest text-[#5b0064]">
              {post.department}
            </span>
          )}
          <span className="text-xs text-[#51424f]">{readTime} min read</span>
        </div>

        <h3
          className="mt-3 font-serif text-lg font-semibold leading-snug text-[#1a1c20]
            line-clamp-2 group-hover:text-[#5b0064] transition-colors"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {post.title}
        </h3>

        <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-[#51424f]">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{formatDate(post.createdOn)}</span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
