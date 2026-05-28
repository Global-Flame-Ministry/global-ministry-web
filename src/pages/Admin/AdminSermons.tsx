import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, RefreshCw, Search, Pencil,
  X, BookOpen, Filter, Eye, EyeOff,
  Play, Music, Download, Star
} from 'lucide-react';
import { sermonApi, type CreateSermonDto, type UpdateSermonDto } from '../../api/sermonApi';
import type { SermonDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import AudioUpload from '../../components/AudioUpload';
import ImageUpload from '../../components/ImageUpload';

const emptyForm = (): CreateSermonDto => ({
  title: '', speaker: '', series: '', theme: '', description: '',
  speakerImageUrl: '',
  imageUrl: '', videoUrl: '', audioUrl: '', sermonDate: '', isPublished: false, isFeatured: false,
});

const AdminSermons = () => {
  const { isDark } = useAdminTheme();

  const t = {
    bg:         isDark ? 'bg-[#0d0d0d] text-white'  : 'bg-slate-50 text-slate-900',
    border:     isDark ? 'border-white/5'            : 'border-slate-200',
    subtext:    isDark ? 'text-zinc-400'             : 'text-slate-500',
    mutedtext:  isDark ? 'text-zinc-600'             : 'text-slate-400',
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

  const [sermons, setSermons]                 = useState<SermonDto[]>([]);
  const [totalCount, setTotalCount]           = useState(0);
  const [isLoading, setIsLoading]             = useState(true);
  const [search, setSearch]                   = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [pageNumber, setPageNumber]           = useState(1);
  const pageSize = 10;
  const [showForm, setShowForm]               = useState(false);
  const [editing, setEditing]                 = useState<SermonDto | null>(null);
  const [form, setForm]                       = useState<CreateSermonDto>(emptyForm());
  const [isSaving, setIsSaving]               = useState(false);
  const [deleteTarget, setDeleteTarget]       = useState<SermonDto | null>(null);
  const [isDeleting, setIsDeleting]           = useState(false);

  const fetchSermons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await sermonApi.adminGetAll({
        title: search || undefined,
        isPublished: filterPublished === '' ? undefined : filterPublished === 'true',
        pageNumber, pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setSermons(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch { toast.error('Failed to load sermons'); }
    finally { setIsLoading(false); }
  }, [search, filterPublished, pageNumber]);

  useEffect(() => { fetchSermons(); }, [fetchSermons]);
  useEffect(() => { setPageNumber(1); }, [search, filterPublished]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };

  const openEdit = (s: SermonDto) => {
    setEditing(s);
    setForm({
      title:           s.title,
      speaker:         s.speaker,
      series:          s.series,
      theme:           s.theme ?? '', 
      description:     s.description,
      speakerImageUrl: s.speakerImageUrl ?? '',
      imageUrl:        s.imageUrl ?? '',
      videoUrl:        s.videoUrl ?? '',
      audioUrl:        s.audioUrl ?? '',
      sermonDate:      s.sermonDate.slice(0, 10),
      isPublished:     s.isPublished,
      isFeatured:      s.isFeatured,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim())   { toast.error('Title is required');       return; }
    if (!form.speaker.trim()) { toast.error('Speaker is required');     return; }
    if (!form.sermonDate)     { toast.error('Sermon date is required'); return; }
    setIsSaving(true);
    try {
      if (editing) {
        const res = await sermonApi.update(editing.id, { ...form } as UpdateSermonDto);
        if (res.data.isSuccess) { toast.success('Sermon updated'); setShowForm(false); fetchSermons(); }
      } else {
        const res = await sermonApi.create(form);
        if (res.data.isSuccess) { toast.success('Sermon created'); setShowForm(false); fetchSermons(); }
      }
    } catch { toast.error('Failed to save sermon'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await sermonApi.delete(deleteTarget.id);
      setSermons(prev => prev.filter(s => s.id !== deleteTarget.id));
      setTotalCount(n => n - 1);
      setDeleteTarget(null);
      toast.success('Sermon deleted');
    } catch { toast.error('Failed to delete sermon'); }
    finally { setIsDeleting(false); }
  };

  const togglePublish = async (sermon: SermonDto) => {
    try {
      const dto: UpdateSermonDto = {
        title:           sermon.title,
        speaker:         sermon.speaker,
        series:          sermon.series,
        description:     sermon.description,
        speakerImageUrl: sermon.speakerImageUrl ?? '',
        imageUrl:        sermon.imageUrl ?? '',
        videoUrl:        sermon.videoUrl ?? '',
        audioUrl:        sermon.audioUrl ?? '',
        sermonDate:      sermon.sermonDate.slice(0, 10),
        isPublished:     !sermon.isPublished,
        isFeatured:      sermon.isFeatured,
      };
      const res = await sermonApi.update(sermon.id, dto);
      if (res.data.isSuccess) {
        setSermons(prev => prev.map(s =>
          s.id === sermon.id ? { ...s, isPublished: !s.isPublished } : s
        ));
        toast.success(sermon.isPublished ? 'Sermon unpublished' : 'Sermon published');
      }
    } catch { toast.error('Failed to update sermon'); }
  };

  const toggleFeatured = async (sermon: SermonDto) => {
    try {
      const dto: UpdateSermonDto = { ...sermon, isFeatured: !sermon.isFeatured } as UpdateSermonDto;
      const res = await sermonApi.update(sermon.id, dto);
      if (res.data.isSuccess) {
        setSermons(prev => prev.map(s =>
          s.id === sermon.id ? { ...s, isFeatured: !s.isFeatured } : s
        ));
        toast.success(sermon.isFeatured ? 'Removed from home page' : 'Featured on home page');
      }
    } catch { toast.error('Failed to update sermon'); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* Header */}
      <div className={`px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b ${t.border}
        flex items-center justify-between gap-3`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-xl sm:text-2xl font-bold">Sermons</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`text-sm hidden sm:block ${t.subtext}`}>{totalCount} total</span>
          <button onClick={fetchSermons} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-fuchsia-600
              hover:bg-fuchsia-500 rounded-lg text-xs sm:text-sm font-bold
              uppercase tracking-widest transition-colors text-white whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Sermon</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`px-4 sm:px-8 py-3 sm:py-4 border-b ${t.border} flex flex-col sm:flex-row gap-3`}>
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <input
            type="text"
            placeholder="Search by title, speaker, series..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${t.input}`}
          />
        </div>
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext} pointer-events-none`} />
          <select
            value={filterPublished}
            onChange={e => setFilterPublished(e.target.value)}
            className={`w-full sm:w-auto pl-9 pr-8 py-2.5 border rounded-lg text-sm
              outline-none appearance-none cursor-pointer ${t.input}`}
          >
            <option value="">All Sermons</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="px-4 sm:px-8 py-4 sm:py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`animate-pulse h-20 sm:h-24 rounded-xl ${t.skeleton}`} />
            ))}
          </div>
        ) : sermons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
            <p className={t.subtext}>No sermons found</p>
            <button
              onClick={openCreate}
              className="mt-4 text-fuchsia-600 text-sm font-bold uppercase tracking-widest"
            >
              Add your first sermon
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sermons.map(sermon => (
              <div key={sermon.id} className={`rounded-xl border transition-all p-3 sm:p-4 ${t.row}`}>
                <div className="flex items-start gap-3">

                  {/* Sermon thumbnail — object-top to show faces */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden
                    bg-slate-200 shrink-0">
                    {sermon.imageUrl ? (
                      <img
                        src={sermon.imageUrl}
                        alt={sermon.title}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className={`w-6 h-6 ${t.mutedtext}`} />
                      </div>
                    )}
                  </div>

                  {/* Speaker avatar */}
                  {sermon.speakerImageUrl && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden
                      border-2 border-fuchsia-500/30 shrink-0 hidden sm:block">
                      <img
                        src={sermon.speakerImageUrl}
                        alt={sermon.speaker}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{sermon.title}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            sermon.isPublished
                              ? 'bg-emerald-500/20 text-emerald-600'
                              : 'bg-amber-500/20 text-amber-600'
                          }`}>
                            {sermon.isPublished ? 'Published' : 'Draft'}
                          </span>
                          {sermon.isFeatured && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 
                              rounded-full bg-amber-500/20 text-amber-600">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleFeatured(sermon)}
                          className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}
                          title={sermon.isFeatured ? 'Remove from home page' : 'Feature on home page'}
                        >
                          <Star className={`w-4 h-4 ${sermon.isFeatured 
                            ? 'text-amber-500 fill-amber-500' 
                            : t.subtext}`} 
                          />
                        </button>
                        <button
                          onClick={() => togglePublish(sermon)}
                          className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}
                        >
                          {sermon.isPublished
                            ? <EyeOff className={`w-4 h-4 ${t.subtext}`} />
                            : <Eye className={`w-4 h-4 ${t.subtext}`} />
                          }
                        </button>
                        <button
                          onClick={() => openEdit(sermon)}
                          className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}
                        >
                          <Pencil className={`w-4 h-4 ${t.subtext}`} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sermon)}
                          className={`p-2 rounded-lg transition-colors ${t.btnGhost} hover:bg-red-500/20`}
                        >
                          <Trash2 className={`w-4 h-4 ${t.subtext}`} />
                        </button>
                      </div>
                    </div>

                    {/* Meta info — wraps properly on mobile */}
                    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1 ${t.subtext}`}>
                      <span className="truncate max-w-[120px]">{sermon.speaker}</span>
                      <span className={`hidden sm:inline ${t.mutedtext}`}>·</span>
                      <span className="truncate max-w-[120px] hidden sm:inline">{sermon.series}</span>
                      <span className={`hidden sm:inline ${t.mutedtext}`}>·</span>
                      <span>{formatDate(sermon.sermonDate)}</span>
                    </div>

                    {/* Media indicators */}
                    <div className="flex items-center gap-3 mt-1.5">
                      {sermon.videoUrl && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold ${t.mutedtext}`}>
                          <Play className="w-3 h-3" /> Video
                        </span>
                      )}
                      {sermon.audioUrl && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold ${t.mutedtext}`}>
                          <Music className="w-3 h-3" /> Audio
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className={`text-xs ${t.mutedtext}`}>
              Page {pageNumber} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs transition-colors ${t.btnGhost}`}
              >
                Prev
              </button>
              <button
                onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs transition-colors ${t.btnGhost}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className={`relative rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl shadow-2xl
            max-h-[90vh] overflow-y-auto border ${t.modal}`}>

            <div
              className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b
                ${t.border} sticky top-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}
            >
              <h3 className="font-bold text-lg">{editing ? 'Edit Sermon' : 'New Sermon'}</h3>
              <button onClick={() => setShowForm(false)} className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-5">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Sounds of the Spirit"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Speaker *</label>
                  <input
                    type="text"
                    value={form.speaker}
                    onChange={e => setForm(p => ({ ...p, speaker: e.target.value }))}
                    placeholder="Apostle Danjuma Musa"
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Series</label>
                  <input
                    type="text"
                    value={form.series}
                    onChange={e => setForm(p => ({ ...p, series: e.target.value }))}
                    placeholder="e.g. Firm Foundation"
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                  />
                </div>
              </div>

              <div>
  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
    Series Theme <span className={t.mutedtext}>(optional)</span>
  </label>
  <input
    type="text"
    value={form.theme ?? ''}
    onChange={e => setForm(p => ({ ...p, theme: e.target.value }))}
    placeholder="e.g. Rivers of Living Water"
    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
  />
  <p className={`text-xs mt-1 ${t.mutedtext}`}>
    Shown as a subtitle under the series name across the site.
  </p>
</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Sermon Date *</label>
                  <input
                    type="date"
                    value={form.sermonDate}
                    onChange={e => setForm(p => ({ ...p, sermonDate: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                  />
                </div>
                <div className="pb-1">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setForm(p => ({ ...p, isPublished: !p.isPublished }))}
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors
                      ${form.isPublished ? 'bg-fuchsia-600' : t.toggle}`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform
                        ${form.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className={`text-sm ${t.subtext}`}>
                      {form.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="pb-1">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors
                      ${form.isFeatured ? 'bg-amber-500' : t.toggle}`}>
                      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform
                        ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className={`text-sm ${t.subtext}`}>
                      Featured on Home
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief summary of the sermon..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none ${t.modalInput}`}
                />
              </div>

              <ImageUpload
                value={form.imageUrl || ''}
                onChange={url => setForm(p => ({ ...p, imageUrl: url ?? undefined }))}
                label="Sermon Cover Image"
              />

              <ImageUpload
                value={form.speakerImageUrl || ''}
                onChange={url => setForm(p => ({ ...p, speakerImageUrl: url ?? undefined }))}
                label="Speaker Photo (shown on sermon detail page)"
              />

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                  <Play className="w-3.5 h-3.5 inline mr-1" /> Video URL
                </label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/embed/VIDEO_ID"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                />
                <p className={`text-xs mt-1 ${t.mutedtext}`}>
                  Use YouTube embed URL: youtube.com/embed/VIDEO_ID
                </p>
              </div>

              <AudioUpload
                value={form.audioUrl || ''}
                onChange={url => setForm(p => ({ ...p, audioUrl: url ?? undefined }))}
                label="Sermon Audio"
              />

              {form.audioUrl && (
                <div className={`p-4 rounded-xl border ${t.border} space-y-3`}>
                  <p className={`text-xs font-bold uppercase tracking-widest ${t.subtext}`}>
                    Audio Preview
                  </p>
                  <audio controls className="w-full">
                    <source src={form.audioUrl} />
                  </audio>
                  <a
                    href={form.audioUrl}
                    download
                    className="flex items-center gap-2 text-xs font-bold text-fuchsia-600
                      hover:text-fuchsia-800 uppercase tracking-widest"
                  >
                    <Download className="w-3.5 h-3.5" /> Test Download
                  </a>
                </div>
              )}
            </div>

            <div
              className={`px-5 sm:px-6 py-4 border-t ${t.border} flex gap-3 justify-end sticky bottom-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}
            >
              <button
                onClick={() => setShowForm(false)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${t.btnGhost}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500
                  disabled:opacity-50 text-sm font-bold text-white flex items-center gap-2"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {editing ? 'Update Sermon' : 'Create Sermon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm text-center border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Delete sermon?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>
              "{deleteTarget.title}" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${t.btnGhost}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600
                  disabled:opacity-50 text-sm font-bold text-white
                  flex items-center justify-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSermons;