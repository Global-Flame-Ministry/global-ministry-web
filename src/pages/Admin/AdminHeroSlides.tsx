import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, RefreshCw, Pencil,
  X, Eye, EyeOff, ChevronUp, ChevronDown, Image as ImageIcon, Film, LayoutGrid
} from 'lucide-react';
import { heroApi } from '../../api/heroApi';
import type { CreateHeroSlideDto, HeroSlide } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import ImageUpload from '../../components/ImageUpload';
import VideoUpload from '../../components/VideoUpload';
import { getPosterUrl } from '../../components/HeroCarousel';

const emptyForm = (): CreateHeroSlideDto => ({
  mediaType: 'Image',
  url: '',
  title: '',
  subtitle: '',
  targetUrl: '',
  displayOrder: 0,
  isActive: true,
});

const AdminHeroSlides = () => {
  const { isDark } = useAdminTheme();

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
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (s: HeroSlide) => {
    setEditing(s);
    setForm({
      mediaType: s.mediaType,
      url: s.url,
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      targetUrl: s.targetUrl ?? '',
      displayOrder: s.displayOrder,
      isActive: s.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.mediaType) { toast.error('Media type is required'); return; }
    if (!form.url.trim()) { toast.error('Media is required'); return; }
    setIsSaving(true);
    try {
      if (editing) {
        const res = await heroApi.updateSlide(editing.id, form);
        if (res.data.isSuccess) { toast.success('Updated'); setShowForm(false); fetchSlides(); }
      } else {
        const res = await heroApi.createSlide(form);
        if (res.data.isSuccess) { toast.success('Created'); setShowForm(false); fetchSlides(); }
      }
    } catch { toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  };

  const handleToggleActive = async (s: HeroSlide) => {
    try {
      const res = await heroApi.updateSlide(s.id, {
        mediaType: s.mediaType,
        url: s.url,
        title: s.title ?? undefined,
        subtitle: s.subtitle ?? undefined,
        targetUrl: s.targetUrl ?? undefined,
        displayOrder: s.displayOrder,
        isActive: !s.isActive,
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
          subtitle: a.subtitle ?? undefined, targetUrl: a.targetUrl ?? undefined,
          displayOrder: b.displayOrder, isActive: a.isActive,
        }),
        heroApi.updateSlide(b.id, {
          mediaType: b.mediaType, url: b.url, title: b.title ?? undefined,
          subtitle: b.subtitle ?? undefined, targetUrl: b.targetUrl ?? undefined,
          displayOrder: a.displayOrder, isActive: b.isActive,
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
          Photos and videos rotate on the homepage hero every 15 seconds (oldest first).
          Videos play muted and loop; on slow connections they fall back to a poster image.
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
                  </div>
                  {s.subtitle && <p className={`text-xs truncate mb-1 ${t.subtext}`}>{s.subtitle}</p>}
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] ${t.mutedtext}`}>
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {s.targetUrl && <span className={`text-[10px] ${t.mutedtext} truncate`}>→ {s.targetUrl}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className={`relative rounded-2xl w-full max-w-lg shadow-2xl border ${t.modal}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border}`}>
              <h3 className="font-bold">{editing ? 'Edit Hero Slide' : 'New Hero Slide'}</h3>
              <button onClick={() => setShowForm(false)} className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Media Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Image', 'Video'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, mediaType: type, url: '' }))}
                      className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
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
                  {form.mediaType === 'Image' ? 'Photo' : 'Video Clip'} — rotates every 15s
                </label>
                {form.mediaType === 'Image' ? (
                  <ImageUpload label="" value={form.url || null} onChange={url => setForm(f => ({ ...f, url: url ?? '' }))} />
                ) : (
                  <VideoUpload label="" value={form.url || null} onChange={url => setForm(f => ({ ...f, url: url ?? '' }))} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Title</label>
                  <input type="text" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Slide title (optional)"
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
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
                  placeholder="Short caption (optional)"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Target Link</label>
                <input type="text" value={form.targetUrl ?? ''} onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))}
                  placeholder="https://... (optional)"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-fuchsia-600' : t.toggle}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-sm ${t.subtext}`}>Show on homepage</span>
              </label>
            </div>
            <div className={`px-6 py-4 border-t ${t.border} flex gap-3 justify-end`}>
              <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${t.btnGhost}`}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-sm font-bold transition-colors text-white flex items-center gap-2">
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {editing ? 'Update' : 'Create'}
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