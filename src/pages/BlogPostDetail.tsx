import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { blogApi } from '../api/blogApi';
import type { BlogPostResponseDto } from '../types';

const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await blogApi.getBlogPostBySlug(slug);
        if (res.data.isSuccess && res.data.data) {
          setPost(res.data.data);
        } else {
          setError(res.data.message || 'Post not found.');
        }
      } catch {
        setError('Unable to load blog post.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-5 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-16">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-[#111827] mb-3">{error || 'Post not found.'}</p>
          <Link to="/blog" className="inline-flex items-center gap-2 rounded-full bg-[#a21caf] px-4 py-3 text-sm font-bold text-white hover:bg-[#7c3aed] transition">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#a21caf] hover:text-[#7c3aed] transition">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <article className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {post.coverImageUrl && (
            <img src={post.coverImageUrl} alt={post.title} className="w-full object-cover" />
          )}
          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#a21caf] font-black">
                  {post.module}
                </p>
                <h1 className="text-3xl font-bold text-[#111827] sm:text-4xl">{post.title}</h1>
              </div>
              <div className="space-y-1 text-right text-sm text-slate-500">
                <p>By {post.authorName}</p>
                <p>{new Date(post.createdOn).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            {post.excerpt && <p className="text-lg leading-8 text-slate-600">{post.excerpt}</p>}

            <div className="space-y-8">
              {post.blocks
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((block, index) => {
                  if (block.blockType === 'Heading') {
                    return (
                      <h2 key={index} className="text-2xl font-semibold text-[#111827]">
                        {block.content}
                      </h2>
                    );
                  }
                  if (block.blockType === 'Paragraph') {
                    return (
                      <p key={index} className="max-w-none text-slate-600 leading-8">
                        {block.content}
                      </p>
                    );
                  }
                  if (block.blockType === 'Image' && block.imageUrl) {
                    return (
                      <img key={index} src={block.imageUrl} alt={block.content ?? post.title} className="w-full rounded-3xl object-cover" />
                    );
                  }
                  if (block.blockType === 'Quote') {
                    return (
                      <blockquote key={index} className="rounded-3xl border-l-4 border-[#a21caf] bg-[#faf5ff] px-6 py-5 text-slate-700">
                        <p className="text-lg italic leading-8">{block.content}</p>
                      </blockquote>
                    );
                  }
                  return null;
                })}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPostDetail;
