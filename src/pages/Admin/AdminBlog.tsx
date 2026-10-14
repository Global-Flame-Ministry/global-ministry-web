import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, Trash2, RefreshCw, Search, Pencil,
  X, Eye, EyeOff, Star,
} from 'lucide-react';
import { blogApi } from '../../api/blogApi';
import type {
  BlogPostResponseDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import ImageUpload from '../../components/ImageUpload';
import VideoUpload from '../../components/VideoUpload';
import ContentBlockEditor from '../../components/ContentBlockEditor';
import { buildBlockDtos, type EditorBlock } from '../../components/blog/contentBlocks';

const defaultPostForm = (): CreateBlogPostDto => ({
  title: '',
  excerpt: '',
  coverImageUrl: undefined,
  videoUrl: undefined,
  department: 'Daughters of honour',
  isPublished: false,
  isFeaturedOnHero: false,
  blocks: [],
  conferenceTheme: undefined,
  themeScripture: undefined,
  eventStartsAt: undefined,
  eventEndsAt: undefined,
});

// The admin enters event times in West Africa Time (Africa/Lagos). Nigeria is a
// fixed UTC+1, so we can map to/from UTC with a constant offset — the API stores
// and returns UTC, the pickers show Lagos wall-clock time.
const LAGOS_OFFSET = '+01:00';

const lagosLocalToUtcIso = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const d = new Date(`${value}:00${LAGOS_OFFSET}`);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

const utcIsoToLagosLocal = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const d = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`);
  if (isNaN(d.getTime())) return undefined;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
};

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
  const [uploadCount, setUploadCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPostResponseDto[]>([]);

  const style = useMemo(() => ({
    bg: isDark ? 'bg-[#0d0d0d] text-white' : 'bg-slate-50 text-slate-900',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    panel: isDark ? 'bg-[#161616] border-white/10' : 'bg-white border-slate-200',
    input: isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900',
    muted: isDark ? 'text-zinc-400' : 'text-slate-500',
  }), [isDark]);

  const handleUploadingChange = useCallback((uploading: boolean) => {
    setUploadCount(prev => Math.max(0, prev + (uploading ? 1 : -1)));
  }, []);

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

  const loadFeatured = useCallback(async () => {
    try {
      const res = await blogApi.getAllBlogPosts({ featuredOnHero: true, pageSize: 50 });
      if (res.data.isSuccess && res.data.data) {
        setFeaturedPosts(res.data.data.items);
      }
    } catch {
      setFeaturedPosts([]);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { loadFeatured(); }, [loadFeatured]);
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
        department: post.department ?? 'Daughters of honour',
        isPublished: post.isPublished,
        isFeaturedOnHero: post.isFeaturedOnHero,
        blocks: mappedBlocks,
        conferenceTheme: post.conferenceTheme ?? undefined,
        themeScripture: post.themeScripture ?? undefined,
        eventStartsAt: utcIsoToLagosLocal(post.eventStartsAt),
        eventEndsAt: utcIsoToLagosLocal(post.eventEndsAt),
      });
      setBlocks(mappedBlocks);
    } else {
      setEditing(null);
      setForm(defaultPostForm());
      setBlocks([]);
    }
    setShowEditor(true);
  };

  const savePost = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.department) { toast.error('Department is required'); return; }
    if (form.videoUrl && !form.coverImageUrl) {
      toast.error('Add a cover image — it is used as the video poster and on cards.');
      return;
    }

    const eventStartsAtIso = lagosLocalToUtcIso(form.eventStartsAt);
    const eventEndsAtIso = lagosLocalToUtcIso(form.eventEndsAt);
    if (eventStartsAtIso && eventEndsAtIso && new Date(eventEndsAtIso) < new Date(eventStartsAtIso)) {
      toast.error('Event end date/time must be on or after the start.');
      return;
    }

    const sortedBlocks = buildBlockDtos(blocks);

    const payload: CreateBlogPostDto = {
      title: form.title.trim(),
      excerpt: form.excerpt?.trim() || undefined,
      coverImageUrl: form.coverImageUrl || undefined,
      videoUrl: form.videoUrl?.trim() || undefined,
      department: form.department,
      isPublished: form.isPublished,
      isFeaturedOnHero: form.isFeaturedOnHero ?? false,
      blocks: sortedBlocks,
      conferenceTheme: form.conferenceTheme?.trim() || undefined,
      themeScripture: form.themeScripture?.trim() || undefined,
      eventStartsAt: eventStartsAtIso,
      eventEndsAt: eventEndsAtIso,
    };

    setIsSaving(true);
    try {
      if (editing) {
        const res = await blogApi.updateBlogPost(editing.id, payload as UpdateBlogPostDto);
        if (res.data.isSuccess) {
          toast.success('Blog post updated');
          setShowEditor(false);
          fetchPosts();
          loadFeatured();
        } else {
          toast.error(res.data.message || 'Update failed');
        }
      } else {
        const res = await blogApi.createBlogPost(payload);
        if (res.data.isSuccess) {
          toast.success('Blog post created');
          setShowEditor(false);
          fetchPosts();
          loadFeatured();
        } else {
          toast.error(res.data.message || 'Create failed');
        }
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save blog post';
      toast.error(message);
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
      loadFeatured();
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
        loadFeatured();
      }
    } catch {
      toast.error('Failed to toggle publish state');
    }
  };

  const isCurrentlyFeatured = editing?.isFeaturedOnHero ?? false;
  const isUploading = uploadCount > 0;
  const otherFeaturedPosts = featuredPosts.filter(p => p.id !== editing?.id);
  const featureBlockReason =
    !form.isPublished
      ? 'Publish the post before it can be featured in the hero.'
      : !form.coverImageUrl
        ? 'Add a cover image before the post can be featured in the hero.'
        : otherFeaturedPosts.length >= 2
          ? `Maximum of 2 featured posts reached. Currently featured: ${otherFeaturedPosts
              .map(p => `"${p.title}"`)
              .join(', ')}.`
          : null;
  // A post that is already featured can always be un-featured.
  const featureToggleDisabled = !isCurrentlyFeatured && !!featureBlockReason;

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
                      <td className="px-4 py-4 text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{post.title}</span>
                          {post.isFeaturedOnHero && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-fuchsia-700"
                              title="Featured in the home hero"
                            >
                              <Star className="h-3 w-3" /> Hero
                            </span>
                          )}
                        </div>
                      </td>
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
                  <input
                    list="department-suggestions"
                    value={form.department}
                    onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${style.input}`}
                    placeholder="Type or select a department"
                  />
                  <datalist id="department-suggestions">
                    <option value="Royal Priesthood" />
                    <option value="House of Opera" />
                    <option value="Home of Love" />
                    <option value="Flame Stars" />
                    <option value="Tuesday Service" />
                    <option value="Testimony" />
                    <option value="General" />
                  </datalist>
                </label>
              </div>

                {/* Conference Theme */}
              <label className="space-y-2 text-sm text-slate-700 block">
                Conference Theme
                <input
                  value={form.conferenceTheme ?? ''}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    conferenceTheme: e.target.value || undefined
                  }))}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm 
                    outline-none transition ${style.input}`}
                  placeholder="e.g. Rivers of Living Water"
                />
              </label>

              {/* Theme Scripture — only shown when conferenceTheme has a value */}
              {form.conferenceTheme && (
                <label className="space-y-2 text-sm text-slate-700 block">
                  Anchor Scripture
                  <input
                    value={form.themeScripture ?? ''}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      themeScripture: e.target.value || undefined
                    }))}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm 
                      outline-none transition ${style.input}`}
                    placeholder="e.g. John 7:37 — If anyone thirsts, let him come to me and drink."
                  />
                </label>
              )}

              {/* Optional event dates (Africa/Lagos). Powers the live timing badge. */}
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Event dates (optional)</p>
                  <p className="text-xs text-slate-500">
                    Times are West Africa Time (WAT / Africa/Lagos). Leave blank for a non-event post.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-700">
                    Starts
                    <input
                      type="datetime-local"
                      value={form.eventStartsAt ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, eventStartsAt: e.target.value || undefined }))}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${style.input}`}
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Ends
                    <input
                      type="datetime-local"
                      value={form.eventEndsAt ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, eventEndsAt: e.target.value || undefined }))}
                      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${style.input}`}
                    />
                  </label>
                </div>
                {(() => {
                  const start = lagosLocalToUtcIso(form.eventStartsAt);
                  const end = lagosLocalToUtcIso(form.eventEndsAt);
                  return start && end && end < start ? (
                    <p className="text-xs font-medium text-red-600">
                      End must be on or after the start.
                    </p>
                  ) : null;
                })()}
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
                    onUploadingChange={handleUploadingChange}
                  />
                  <VideoUpload
                    label="Header Video (optional)"
                    value={form.videoUrl ?? null}
                    onChange={(url) => setForm(prev => ({ ...prev, videoUrl: url ?? undefined }))}
                    onUploadingChange={handleUploadingChange}
                  />
                </div>
              </div>

              <ContentBlockEditor
                blocks={blocks}
                onChange={setBlocks}
                onUploadingChange={handleUploadingChange}
                emptyHint="Add one or more blocks to build the blog post layout."
              />
            </div>

            <div className="flex-shrink-0 sticky bottom-0 z-10 border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                  <label className="inline-flex min-h-[44px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" checked={form.isPublished}
                      onChange={e => setForm(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-[#a21caf] focus:ring-[#a21caf]" />
                    Publish now
                  </label>
                  <label className={`inline-flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                    featureToggleDisabled
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}>
                    <input type="checkbox" checked={form.isFeaturedOnHero ?? false}
                      disabled={featureToggleDisabled}
                      onChange={e => setForm(prev => ({ ...prev, isFeaturedOnHero: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#a21caf] focus:ring-[#a21caf] disabled:cursor-not-allowed" />
                    <span>
                      <span className="font-semibold">Feature in home hero</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Shows the cover photo, title and excerpt in the hero. Maximum 2 at a time.
                      </span>
                      {featureToggleDisabled && featureBlockReason && (
                        <span className="mt-1 block text-xs font-medium text-amber-600">
                          {featureBlockReason}
                        </span>
                      )}
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setShowEditor(false)}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                    Cancel
                  </button>
                  <button type="button" onClick={savePost} disabled={isSaving || isUploading}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#a21caf] px-4 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-60">
                    {isUploading ? 'Uploading…' : isSaving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
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