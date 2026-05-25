import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, Trash2, RefreshCw, Search, Pencil,
  X, Eye, EyeOff, ChevronUp, ChevronDown,
  Quote, FileText, BookOpen, Image,
} from 'lucide-react';
import { blogApi } from '../../api/blogApi';
import type {
  BlogPostResponseDto,
  CreateBlogBlockDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import ImageUpload from '../../components/ImageUpload';

const DEPARTMENTS = [
  'Royal Priesthood',
  'House of Opera',
  'Home of Love',
  'Flame Stars',
];

const BLOCK_TYPES = ['Heading', 'Paragraph', 'Image', 'Quote'] as const;
type BlockType = (typeof BLOCK_TYPES)[number];

interface EditorBlock extends CreateBlogBlockDto {
  id: string;
}

const defaultPostForm = (): CreateBlogPostDto => ({
  title: '',
  excerpt: '',
  coverImageUrl: undefined,
  videoUrl: undefined,
  department: 'Royal Priesthood',
  isPublished: false,
  blocks: [],
});

const AdminBlog: React.FC = () => {
  const { isDark } = useAdminTheme();
  const [posts, setPosts] = useState<BlogPostResponseDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<BlogPostResponseDto | null>(null);
  const [form, setForm] = useState<CreateBlogPostDto>(defaultPostForm());
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const style = useMemo(() => ({
    bg: isDark ? 'bg-[#0d0d0d] text-white' : 'bg-slate-50 text-slate-900',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    panel: isDark ? 'bg-[#161616] border-white/10' : 'bg-white border-slate-200',
    input: isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900',
    muted: isDark ? 'text-zinc-400' : 'text-slate-500',
  }), [isDark]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await blogApi.getAllBlogPosts({
        pageNumber,
        pageSize,
        searchTerm: search || undefined,
      });
      if (res.data.isSuccess && res.data.data) {
        setPosts(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPageNumber(1); }, [search]);

  const loadEditor = (post?: BlogPostResponseDto) => {
    if (post) {
      setEditing(post);
      const mappedBlocks: EditorBlock[] = post.blocks.map(b => ({
        id: `${b.id}-${Date.now()}`,
        blockType: b.blockType,
        content: b.content ?? '',
        imageUrl: b.imageUrl ?? undefined,
        displayOrder: b.displayOrder,
      })).sort((a, b) => a.displayOrder - b.displayOrder);

      setForm({
        title: post.title,
        excerpt: post.excerpt ?? '',
        coverImageUrl: post.coverImageUrl ?? undefined,
        videoUrl: post.videoUrl ?? undefined,
        department: post.department ?? 'Royal Priesthood',
        isPublished: post.isPublished,
        blocks: mappedBlocks,
      });
      setBlocks(mappedBlocks);
    } else {
      setEditing(null);
      setForm(defaultPostForm());
      setBlocks([]);
    }
    setShowEditor(true);
  };

  const addBlock = (type: BlockType) => {
    setBlocks(prev => [
      ...prev,
      {
        id: `${type}-${Date.now()}-${prev.length}`,
        blockType: type,
        content: '',
        imageUrl: undefined,
        displayOrder: prev.length + 1,
      },
    ]);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const next = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next.map((block, idx) => ({ ...block, displayOrder: idx + 1 }));
    });
  };

  const removeBlock = (index: number) => {
    setBlocks(prev =>
      prev.filter((_, i) => i !== index).map((block, idx) => ({ ...block, displayOrder: idx + 1 }))
    );
  };

  const setBlockField = (index: number, field: keyof CreateBlogBlockDto, value: string | undefined | number) => {
    setBlocks(prev => prev.map((block, idx) => idx === index ? { ...block, [field]: value } : block));
  };

  const savePost = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.department) { toast.error('Department is required'); return; }

    const validDepts = ['Royal Priesthood', 'House of Opera', 'Home of Love', 'Flame Stars'];
    if (!validDepts.includes(form.department)) {
      toast.error('Invalid department selected');
      return;
    }

    const sortedBlocks: CreateBlogBlockDto[] = blocks
      .map((block, idx) => ({
        blockType: block.blockType,
        content: block.blockType === 'Image' ? undefined : block.content,
        imageUrl: block.blockType === 'Image' ? block.imageUrl : undefined,
        displayOrder: idx + 1,
      }))
      .filter(block => block.blockType !== 'Image' || block.imageUrl) as CreateBlogBlockDto[];

    const payload: CreateBlogPostDto = {
      title: form.title.trim(),
      excerpt: form.excerpt?.trim() || undefined,
      coverImageUrl: form.coverImageUrl || undefined,
      videoUrl: form.videoUrl?.trim() || undefined,
      department: form.department,
      isPublished: form.isPublished,
      blocks: sortedBlocks,
    };

    setIsSaving(true);
    try {
      if (editing) {
        const res = await blogApi.updateBlogPost(editing.id, payload as UpdateBlogPostDto);
        if (res.data.isSuccess) {
          toast.success('Blog post updated');
          setShowEditor(false);
          fetchPosts();
        } else {
          toast.error(res.data.message || 'Update failed');
        }
      } else {
        const res = await blogApi.createBlogPost(payload);
        if (res.data.isSuccess) {
          toast.success('Blog post created');
          setShowEditor(false);
          fetchPosts();
        } else {
          toast.error(res.data.message || 'Create failed');
        }
      }
    } catch {
      toast.error('Failed to save blog post');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await blogApi.deleteBlogPost(deleteTarget.id);
      toast.success('Blog post deleted');
      setDeleteTarget(null);
      fetchPosts();
    } catch {
      toast.error('Failed to delete blog post');
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePublish = async (post: BlogPostResponseDto) => {
    try {
      const res = await blogApi.togglePublish(post.id);
      if (res.data.isSuccess && res.data.data) {
        setPosts(prev => prev.map(item => item.id === post.id ? res.data.data! : item));
        toast.success(post.isPublished ? 'Post unpublished' : 'Post published');
      }
    } catch {
      toast.error('Failed to toggle publish state');
    }
  };

  return (
    <div className={`min-h-screen ${style.bg}`}>
      <div className={`rounded-3xl border ${style.border} bg-white/90 p-6 shadow-sm`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#a21caf] font-black mb-2">Admin</p>
            <h1 className="text-3xl font-bold text-[#111827]">Blog Posts</h1>
            <p className="text-sm text-slate-500">Manage published articles, drafts, and structured blog content.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={fetchPosts}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#a21caf] hover:text-[#a21caf]">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button type="button" onClick={() => loadEditor()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#a21caf] px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#7c3aed]">
              <Plus className="h-4 w-4" /> New Post
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search posts by title"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#a21caf]" />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-slate-500">Title</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-500">Department</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-500">Status</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-500">Created On</th>
                  <th className="px-4 py-4 text-right font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading blog posts...</td></tr>
                ) : posts.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No blog posts found.</td></tr>
                ) : (
                  posts.map(post => (
                    <tr key={post.id} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-4 text-slate-800">{post.title}</td>
                      <td className="px-4 py-4 text-slate-600">{post.department}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${post.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {new Date(post.createdOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        <button type="button" onClick={() => loadEditor(post)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-[#f3e8ff] hover:text-[#7c3aed]" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => togglePublish(post)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-[#f3e8ff] hover:text-[#7c3aed]"
                          title={post.isPublished ? 'Unpublish' : 'Publish'}>
                          {post.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(post)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-red-100 hover:text-red-600" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">Showing {posts.length} posts of {totalCount}</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pageNumber <= 1} onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#a21caf] hover:text-[#a21caf] disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button type="button" disabled={pageNumber * pageSize >= totalCount} onClick={() => setPageNumber(p => p + 1)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#a21caf] hover:text-[#a21caf] disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 px-4 py-6">
          <div className="relative w-full max-w-5xl flex flex-col bg-white rounded-3xl shadow-2xl max-h-[90vh]">
            <div className="flex-shrink-0 sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#111827]">{editing ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
                  <p className="text-sm text-slate-500">Use blocks to build the page structure and upload images.</p>
                </div>
                <button type="button" onClick={() => setShowEditor(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Title
                  <input value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${style.input}`}
                    placeholder="Enter post title" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Department
                  <select value={form.department}
                    onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${style.input}`}>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  Excerpt
                  <textarea value={form.excerpt}
                    onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${style.input}`}
                    placeholder="Enter a short excerpt" />
                </label>
                <div className="space-y-4">
                  <ImageUpload
                    label="Cover Image"
                    value={form.coverImageUrl ?? null}
                    onChange={(url) => setForm(prev => ({ ...prev, coverImageUrl: url ?? undefined }))}
                  />
                  <label className="space-y-2 text-sm text-slate-700 block">
                    Video URL (optional)
                    <input value={form.videoUrl ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, videoUrl: e.target.value || undefined }))}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${style.input}`}
                      placeholder="Paste video URL (optional)" />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Content Blocks</p>
                  <p className="text-sm text-slate-500">Add headings, paragraphs, quotes, and images in order.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BLOCK_TYPES.map(type => (
                    <button type="button" key={type} onClick={() => addBlock(type)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#a21caf] hover:text-[#a21caf]">
                      {type === 'Heading' ? <FileText className="h-4 w-4" /> : type === 'Image' ? <Image className="h-4 w-4" /> : type === 'Quote' ? <Quote className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {blocks.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
                    Add one or more blocks to build the blog post layout.
                  </div>
                )}
                {blocks.map((block, index) => (
                  <div key={block.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-semibold text-slate-900">{block.blockType} Block</div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => moveBlock(index, 'up')}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-[#f3e8ff] hover:text-[#7c3aed]">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => moveBlock(index, 'down')}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-[#f3e8ff] hover:text-[#7c3aed]">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeBlock(index)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-red-600 transition hover:bg-red-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {block.blockType === 'Paragraph' && (
                      <textarea value={block.content} onChange={e => setBlockField(index, 'content', e.target.value)}
                        rows={4} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition"
                        placeholder="Paragraph text..." />
                    )}
                    {block.blockType === 'Heading' && (
                      <input value={block.content} onChange={e => setBlockField(index, 'content', e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition"
                        placeholder="Heading text..." />
                    )}
                    {block.blockType === 'Quote' && (
                      <textarea value={block.content} onChange={e => setBlockField(index, 'content', e.target.value)}
                        rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition"
                        placeholder="Quote text | Author name" />
                    )}
                    {block.blockType === 'Image' && (
                      <ImageUpload
                        label="Block Image"
                        value={block.imageUrl ?? null}
                        onChange={(url) => setBlockField(index, 'imageUrl', url ?? undefined)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 sticky bottom-0 z-10 border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex min-h-[44px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" checked={form.isPublished}
                    onChange={e => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-[#a21caf] focus:ring-[#a21caf]" />
                  Publish now
                </label>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setShowEditor(false)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                    Cancel
                  </button>
                  <button type="button" onClick={savePost} disabled={isSaving}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#a21caf] px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-60">
                    {isSaving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#111827]">Delete post?</h3>
            <p className="mt-3 text-slate-600">
              This action cannot be undone. Are you sure you want to delete "{deleteTarget.title}"?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} disabled={isDeleting}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;