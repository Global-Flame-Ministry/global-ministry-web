import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, RefreshCw, Pencil,
  X, Eye, EyeOff, ChevronUp, ChevronDown, Image as ImageIcon, Film, LayoutGrid, Star, FileText
} from 'lucide-react';
import { heroApi } from '../../api/heroApi';
import type { CreateHeroSlideDto, HeroSlide } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import ImageUpload from '../../components/ImageUpload';
import VideoUpload from '../../components/VideoUpload';
import { getPosterUrl, HERO_ROTATION_MS } from '../../components/HeroCarousel';

const MAX_FEATURED_CLIPS = 3;

/** Flattens a clip's write-up blocks into plain text for quick editing. */
const blocksToText = (blocks?: HeroSlide['contentBlocks']): string =>
  (blocks ?? [])
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .filter(b => b.blockType !== 'Image')
    .map(b => b.content ?? '')
    .filter(Boolean)
    .join('\n\n');

const emptyForm = (displayOrder = 0): CreateHeroSlideDto => ({
  mediaType: 'Image',
  url: '',
  title: '',
  subtitle: '',
  label: '',
  buttonText: '',
  targetUrl: '',
  displayOrder,
  isActive: true,
  isFeatured: false,
  featuredOrder: 0,
});

const AdminHeroSlides = () => {
  const { isDark } = useAdminTheme();
  const navigate = useNavigate();

  const t = {
    bg:         isDark ? 'bg-[#0d0d0d] text-white'     : 'bg-slate-50 text-slate-900',
    border:     isDark ? 'border-white/5'               : 'border-slate-200',
    subtext:    isDark ? 'text-zinc-400'                : 'text-slate-500',
    mutedtext:  isDark ? 'text-zinc-600'                : 'text-slate-400',
    input:      isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-fuchsia-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    row:        isDark ? 'bg-white/3 hover:bg-white/5 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200',
    btnGhost:   isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
    modal:      isDark ? 'bg-[#161616] border-white/10 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900',
    modalInput: isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-fuchsia-500'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500',
    label:      isDark ? 'text-zinc-400' : 'text-slate-600',
    toggle:     isDark ? 'bg-white/10'  : 'bg-slate-200',
    skeleton:   isDark ? 'bg-white/3'   : 'bg-slate-200',
  };

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<CreateHeroSlideDto>(emptyForm());
  const [initialForm, setInitialForm] = useState<CreateHeroSlideDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [writeUp, setWriteUp] = useState('');
  const [initialWriteUp, setInitialWriteUp] = useState('');
  const [writeUpHasRichBlocks, setWriteUpHasRichBlocks] = useState(false);
  const [isLoadingWriteUp, setIsLoadingWriteUp] = useState(false);
  const writeUpTouchedRef = useRef(false);

  const isDirty = initialForm != null && (
    JSON.stringify(form) !== JSON.stringify(initialForm) ||
    writeUp !== initialWriteUp
  );
  const isBusy  = isSaving || isUploading;

  const featuredClips = useMemo(
    () => slides.filter(s => s.mediaType === 'Video' && s.isFeatured && s.isActive),
    [slides]
  );
  const isCurrentSlideFeatured = editing != null && featuredClips.some(f => f.id === editing.id);
  const featuredLimitReached = featuredClips.length >= MAX_FEATURED_CLIPS;
  const featureToggleDisabled =
    form.mediaType === 'Video' && featuredLimitReached && !isCurrentSlideFeatured;

  const fetchSlides = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await heroApi.getAllSlides();
      if (res.data.isSuccess && res.data.data) {
        setSlides([...res.data.data].sort((a, b) => a.displayOrder - b.displayOrder));
      }
    } catch { toast.error('Failed to load hero slides'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditing(null);
    setInitialForm(null);
    setIsUploading(false);
    setSaveError(null);
  }, []);

  // Default new slides to the end of the list
  const nextDisplayOrder = () =>
    slides.length === 0 ? 0 : Math.max(...slides.map(s => s.displayOrder)) + 1;

  const openCreate = () => {
    const f = emptyForm(nextDisplayOrder());
    setEditing(null);
    setForm(f);
    setInitialForm(f);
    setIsUploading(false);
    setSaveError(null);
    setWriteUp('');
    setInitialWriteUp('');
    setWriteUpHasRichBlocks(false);
    setIsLoadingWriteUp(false);
    writeUpTouchedRef.current = false;
    setShowForm(true);
  };

  const openEdit = (s: HeroSlide) => {
    const f: CreateHeroSlideDto = {
      mediaType: s.mediaType,
      url: s.url,
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      label: s.label ?? '',
      buttonText: s.buttonText ?? '',
      targetUrl: s.targetUrl ?? '',
      displayOrder: s.displayOrder,
      isActive: s.isActive,
      isFeatured: s.isFeatured,
      featuredOrder: s.featuredOrder,
    };
    setEditing(s);
    setForm(f);
    setInitialForm(f);
    setIsUploading(false);
    setSaveError(null);
    setWriteUp('');
    setInitialWriteUp('');
    setWriteUpHasRichBlocks(false);
    writeUpTouchedRef.current = false;
    setShowForm(true);

    if (s.mediaType === 'Video') {
      setIsLoadingWriteUp(true);
      heroApi.getSlideById(s.id)
        .then(res => {
          if (writeUpTouchedRef.current) return;
          const blocks = res.data.data?.contentBlocks ?? [];
          const text = blocksToText(blocks);
          setWriteUp(text);
          setInitialWriteUp(text);
          setWriteUpHasRichBlocks(blocks.some(b => b.blockType !== 'Image' && b.blockType !== 'Paragraph'));
        })
        .catch(() => { /* leave the field blank if the write-up cannot be loaded */ })
        .finally(() => setIsLoadingWriteUp(false));
    } else {
      setIsLoadingWriteUp(false);
    }
  };

  // Lock body scroll while the modal is open
  useEffect(() => {
    if (!showForm) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [showForm]);

  // Close on Escape
  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeForm(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showForm, closeForm]);

  // Close on backdrop click only when the form is pristine
  const handleBackdropClick = () => { if (!isDirty) closeForm(); };

  const handleSave = async () => {
    if (!form.url.trim()) { toast.error('Please upload media first'); return; }
    if (form.mediaType === 'Video' && !form.title?.trim()) {
      toast.error('A title is required for a video clip.');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      // Only touch the write-up when the admin actually edited it. An empty
      // list clears it; leaving it untouched (undefined) preserves the blocks.
      const writeUpChanged = writeUp !== initialWriteUp;
      const contentBlocks: CreateHeroSlideDto['contentBlocks'] =
        form.mediaType === 'Video' && writeUpChanged
          ? (writeUp.trim()
              ? [{ blockType: 'Paragraph', content: writeUp.trim(), displayOrder: 1 }]
              : [])
          : undefined;
      const payload: CreateHeroSlideDto = { ...form, contentBlocks };

      if (editing) {
        const res = await heroApi.updateSlide(editing.id, payload);
        if (res.data.isSuccess) { toast.success('Updated'); closeForm(); fetchSlides(); }
      } else {
        const res = await heroApi.createSlide(payload);
        if (res.data.isSuccess) {
          toast.success('Created');
          const created = res.data.data;
          closeForm();
          fetchSlides();
          // Only open the write-up editor when the admin did not write anything here.
          if (form.mediaType === 'Video' && !writeUp.trim() && created?.id) {
            navigate(`/admin/clips/${created.id}/write-up`);
          }
        }
      }
    } catch (err: unknown) {
      const data = (err as {
        response?: { data?: { message?: string; title?: string; errors?: Record<string, string[]> } };
      })?.response?.data;
      const firstValidationError = data?.errors
        ? Object.values(data.errors).flat().find(Boolean)
        : undefined;
      const message = data?.message || firstValidationError || data?.title || 'Failed to save';
      setSaveError(message);
      toast.error(message);
    }
    finally { setIsSaving(false); }
  };

  const handleToggleActive = async (s: HeroSlide) => {
    try {
      const res = await heroApi.updateSlide(s.id, {
        mediaType: s.mediaType,
        url: s.url,
        title: s.title ?? undefined,
        subtitle: s.subtitle ?? undefined,
        label: s.label ?? undefined,
        buttonText: s.buttonText ?? undefined,
        targetUrl: s.targetUrl ?? undefined,
        displayOrder: s.displayOrder,
        isActive: !s.isActive,
        isFeatured: s.isFeatured,
        featuredOrder: s.featuredOrder,
      });
      if (res.data.isSuccess && res.data.data) {
        setSlides(prev => prev.map(x => x.id === s.id ? res.data.data! : x));
        toast.success(s.isActive ? 'Deactivated' : 'Activated');
      }
    } catch { toast.error('Failed to update'); }
  };

  // Reorder: swap display orders with the neighbouring slide
  const handleReorder = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const a = slides[index];
    const b = slides[target];
    if (!a || !b) return;

    try {
      await Promise.all([
        heroApi.updateSlide(a.id, {
          mediaType: a.mediaType, url: a.url, title: a.title ?? undefined,
          subtitle: a.subtitle ?? undefined, label: a.label ?? undefined,
          buttonText: a.buttonText ?? undefined, targetUrl: a.targetUrl ?? undefined,
          displayOrder: b.displayOrder, isActive: a.isActive,
          isFeatured: a.isFeatured, featuredOrder: a.featuredOrder,
        }),
        heroApi.updateSlide(b.id, {
          mediaType: b.mediaType, url: b.url, title: b.title ?? undefined,
          subtitle: b.subtitle ?? undefined, label: b.label ?? undefined,
          buttonText: b.buttonText ?? undefined, targetUrl: b.targetUrl ?? undefined,
          displayOrder: a.displayOrder, isActive: b.isActive,
          isFeatured: b.isFeatured, featuredOrder: b.featuredOrder,
        }),
      ]);
      toast.success('Order updated');
      fetchSlides();
    } catch { toast.error('Failed to reorder'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await heroApi.deleteSlide(deleteTarget.id);
      setSlides(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setIsDeleting(false); }
  };

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      <div className={`px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Hero Slides</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{slides.length} total</span>
          <button onClick={fetchSlides} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors text-white">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      <div className={`px-8 py-4 border-b ${t.border}`}>
        <p className={`text-sm ${t.subtext}`}>
          Photos rotate on the homepage hero every {HERO_ROTATION_MS / 1000} seconds (by display order).
          Featured home events appear first, ahead of these image slides. Video clips are listed on the
          Clips page — use the write-up button on a clip to add its story page.
        </p>
      </div>

      <div className="px-8 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className={`animate-pulse h-20 rounded-xl ${t.skeleton}`} />)}
          </div>
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <LayoutGrid className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
            <p className={t.subtext}>No hero slides yet. Add your first slide.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {slides.map((s, index) => (
              <div key={s.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${t.row}`}>
                <div className={`flex flex-col gap-0.5 shrink-0 ${t.mutedtext}`}>
                  <button
                    onClick={() => handleReorder(index, -1)}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors ${index === 0 ? 'opacity-25 cursor-not-allowed' : `hover:bg-fuchsia-500/20 ${t.btnGhost}`}`}
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(index, 1)}
                    disabled={index === slides.length - 1}
                    className={`p-1 rounded transition-colors ${index === slides.length - 1 ? 'opacity-25 cursor-not-allowed' : `hover:bg-fuchsia-500/20 ${t.btnGhost}`}`}
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-black shrink-0">
                  {s.mediaType === 'Image' ? (
                    <img src={s.url} alt={s.title ?? 'Slide'} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <video src={s.url} poster={getPosterUrl(s.url)} muted preload="metadata" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold uppercase flex items-center gap-1">
                    {s.mediaType === 'Image' ? <ImageIcon className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                    {s.mediaType}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm truncate">{s.title || 'Untitled slide'}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                      s.isActive ? 'bg-emerald-500/20 text-emerald-600' : isDark ? 'bg-zinc-700 text-zinc-400' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-600 flex-shrink-0">
                      Order {s.displayOrder}
                    </span>
                    {s.mediaType === 'Video' && s.isFeatured && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 flex-shrink-0 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> Featured
                      </span>
                    )}
                    {s.mediaType === 'Video' && s.hasWriteUp && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 flex-shrink-0 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> Write-up
                      </span>
                    )}
                  </div>
                  {s.subtitle && <p className={`text-xs truncate mb-1 ${t.subtext}`}>{s.subtitle}</p>}
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] ${t.mutedtext}`}>
                      {new Date(s.createdOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {s.targetUrl && <span className={`text-[10px] ${t.mutedtext} truncate`}>→ {s.targetUrl}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.mediaType === 'Video' && (
                    <Link to={`/admin/clips/${s.id}/write-up`} title="Edit write-up"
                      className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                      <FileText className={`w-4 h-4 ${t.subtext}`} />
                    </Link>
                  )}
                  <button onClick={() => handleToggleActive(s)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                    {s.isActive ? <EyeOff className={`w-4 h-4 ${t.subtext}`} /> : <Eye className={`w-4 h-4 ${t.subtext}`} />}
                  </button>
                  <button onClick={() => openEdit(s)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                    <Pencil className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                  <button onClick={() => setDeleteTarget(s)} className={`p-2 rounded-lg transition-colors ${t.btnGhost} hover:bg-red-500/20`}>
                    <Trash2 className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleBackdropClick} />
          <div className={`relative flex flex-col w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl border overflow-hidden ${t.modal}`}>
            {/* Fixed header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${t.border}`}>
              <h3 className="font-bold">{editing ? 'Edit Hero Slide' : 'New Hero Slide'}</h3>
              <button onClick={closeForm} className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Media Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Image', 'Video'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        mediaType: type,
                        url: '',
                        isFeatured: type === 'Video' ? f.isFeatured : false,
                        ...(type === 'Video' ? { label: '', buttonText: '' } : {}),
                      }))}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                        form.mediaType === type
                          ? 'bg-fuchsia-600 text-white border-fuchsia-600'
                          : `${t.modalInput} hover:border-fuchsia-400`
                      }`}
                    >
                      {type === 'Image' ? <ImageIcon className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                  {form.mediaType === 'Image'
                    ? `Photo — rotates with the others every ${HERO_ROTATION_MS / 1000} seconds`
                    : 'Video Clip'}
                </label>
                {form.mediaType === 'Image' ? (
                  <ImageUpload
                    label=""
                    compact
                    value={form.url || null}
                    onChange={url => setForm(f => ({ ...f, url: url ?? '' }))}
                    onUploadingChange={setIsUploading}
                  />
                ) : (
                  <>
                    <VideoUpload
                      label=""
                      compact
                      value={form.url || null}
                      onChange={url => setForm(f => ({ ...f, url: url ?? '' }))}
                      onUploadingChange={setIsUploading}
                    />
                    <p className={`text-xs mt-2 ${t.label}`}>
                      A poster frame is taken from the video automatically — no cover image needed.
                      Add the write-up below (you can also fine-tune it later from the clip row).
                    </p>
                  </>
                )}
              </div>

              {form.mediaType === 'Image' && (
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Label (small text above the title)</label>
                  <input type="text" value={form.label ?? ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="Small text above the title (optional)" maxLength={60}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
                  <p className={`text-xs mt-1 ${t.label}`}>Small text shown above the title on the homepage hero. Falls back to the subtitle when empty.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                    Title{form.mediaType === 'Video' && <span className="text-fuchsia-500"> *</span>}
                  </label>
                  <input type="text" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    maxLength={200}
                    placeholder={form.mediaType === 'Video' ? 'Clip title (required)' : 'Slide headline (optional)'}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
                  <p className={`text-xs mt-1 ${t.label}`}>
                    {form.mediaType === 'Video'
                      ? 'Clip title (shown on the clips page and in cards)'
                      : 'Headline shown over the image on the homepage hero.'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Display Order</label>
                  <input type="number" value={form.displayOrder} onChange={e => setForm(f => ({ ...f, displayOrder: Number(e.target.value) }))}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Subtitle</label>
                <input type="text" value={form.subtitle ?? ''} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  maxLength={300}
                  placeholder={form.mediaType === 'Video' ? 'Short summary (optional)' : 'Short caption (optional)'}
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
                <p className={`text-xs mt-1 ${t.label}`}>
                  {form.mediaType === 'Video'
                    ? 'Short summary shown on cards. For the full story, use the write-up below.'
                    : 'Used as the small label above the headline only when Label is empty.'}
                </p>
              </div>

              {form.mediaType === 'Video' && (
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Write-up / Content</label>
                  <textarea
                    value={writeUp}
                    onChange={e => { writeUpTouchedRef.current = true; setWriteUp(e.target.value); }}
                    rows={6}
                    maxLength={10000}
                    disabled={isLoadingWriteUp}
                    placeholder={isLoadingWriteUp
                      ? 'Loading the existing write-up…'
                      : 'Paste the full write-up for this clip — it appears on the clip’s own page when visitors click it.'}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all resize-y disabled:opacity-60 ${t.modalInput}`}
                  />
                  <p className={`text-xs mt-1 ${t.label}`}>
                    Shown on the clip’s public page (opening the clip in the Short Clips section).
                    {writeUpHasRichBlocks ? ' Saving here replaces the existing formatted write-up with this text.' : ''}
                    {editing ? ' Leave blank to keep it unchanged.' : ''}
                  </p>
                </div>
              )}

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Target Link</label>
                <input type="text" value={form.targetUrl ?? ''} onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))}
                  maxLength={500}
                  placeholder="https://... (optional)"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
                <p className={`text-xs mt-1 ${t.label}`}>Where the hero button and slide link to (e.g. /plan-your-visit).</p>
              </div>

              {form.mediaType === 'Image' && (
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Button Text</label>
                  <input type="text" value={form.buttonText ?? ''} onChange={e => setForm(f => ({ ...f, buttonText: e.target.value }))}
                    placeholder="e.g. Learn more (optional)" maxLength={40}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
                  <p className={`text-xs mt-1 ${t.label}`}>Text for the hero button. Shown only when a Target Link is set.</p>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-fuchsia-600' : t.toggle}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-sm ${t.subtext}`}>Show on homepage</span>
              </label>

              {form.mediaType === 'Video' && (
                <div className="space-y-1">
                  <div
                    onClick={() => {
                      if (featureToggleDisabled) return;
                      setForm(f => ({ ...f, isFeatured: !f.isFeatured }));
                    }}
                    className={`flex items-center gap-3 ${featureToggleDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-amber-500' : t.toggle}`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className={`text-sm flex items-center gap-2 ${t.subtext}`}>
                      <Star className="w-4 h-4 text-amber-500" /> Feature on home page
                    </span>
                  </div>
                  {featureToggleDisabled ? (
                    <div className={`text-xs pl-14 space-y-1 ${t.label}`}>
                      <p>Maximum of 3 featured clips. Unfeature one first.</p>
                      {featuredClips.length > 0 && (
                        <p>
                          Currently featured:{' '}
                          {featuredClips.map(f => f.title || 'Untitled clip').join(', ')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className={`text-xs pl-14 ${t.label}`}>
                      Featured clips appear in the home Short Clips section
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Fixed footer */}
            {saveError && (
              <div className="px-6 pb-3 shrink-0">
                <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              </div>
            )}
            <div className={`px-6 py-4 border-t shrink-0 flex gap-3 justify-end ${t.border}`}>
              <button onClick={closeForm} disabled={isBusy}
                className={`px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 ${t.btnGhost}`}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={isBusy || !form.url}
                className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold transition-colors text-white flex items-center gap-2">
                {isBusy && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {isUploading ? 'Uploading…' : isSaving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Delete hero slide?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>"{deleteTarget.title || 'Untitled slide'}" will be removed from the homepage.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${t.btnGhost}`}>Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm font-bold text-white transition-colors">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeroSlides;
