import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, RefreshCw, Search, Pencil,
  X, Eye, EyeOff, Megaphone, Filter
} from 'lucide-react';
import {
  announcementApi,
  type CreateAnnouncementDto,
  type UpdateAnnouncementDto
} from '../../api/announcementApi';
import type { AnnouncementDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';

const MODULES    = ['Ministry', 'Youth'];
const CATEGORIES = ['General', 'Service', 'Event', 'Outreach', 'Finance', 'Prayer'];

const emptyForm = (): CreateAnnouncementDto => ({
  title: '', content: '', module: 'Ministry', category: 'General', isPublished: false,
});

const AdminAnnouncements = () => {
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

  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [totalCount, setTotalCount]       = useState(0);
  const [isLoading, setIsLoading]         = useState(true);
  const [search, setSearch]               = useState('');
  const [filterModule, setFilterModule]   = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [pageNumber, setPageNumber]       = useState(1);
  const pageSize = 10;
  const [showForm, setShowForm]           = useState(false);
  const [editing, setEditing]             = useState<AnnouncementDto | null>(null);
  const [form, setForm]                   = useState<CreateAnnouncementDto>(emptyForm());
  const [isSaving, setIsSaving]           = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<AnnouncementDto | null>(null);
  const [isDeleting, setIsDeleting]       = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await announcementApi.adminGetAll({
        title: search || undefined, module: filterModule || undefined,
        isPublished: filterPublished === '' ? undefined : filterPublished === 'true',
        pageNumber, pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setAnnouncements(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch { toast.error('Failed to load announcements'); }
    finally { setIsLoading(false); }
  }, [search, filterModule, filterPublished, pageNumber]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);
  useEffect(() => { setPageNumber(1); }, [search, filterModule, filterPublished]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (a: AnnouncementDto) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content, module: a.module, category: a.category, isPublished: a.isPublished });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim())   { toast.error('Title is required');   return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }
    setIsSaving(true);
    try {
      if (editing) {
        const updateDto: UpdateAnnouncementDto = {
          title: form.title, content: form.content, category: form.category, isPublished: form.isPublished,
        };
        const res = await announcementApi.update(editing.id, updateDto);
        if (res.data.isSuccess) { toast.success('Updated'); setShowForm(false); fetchAnnouncements(); }
      } else {
        const res = await announcementApi.create(form);
        if (res.data.isSuccess) { toast.success('Created'); setShowForm(false); fetchAnnouncements(); }
      }
    } catch { toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  };

  const handleTogglePublish = async (a: AnnouncementDto) => {
    try {
      const res = await announcementApi.update(a.id, {
        title: a.title, content: a.content, category: a.category, isPublished: !a.isPublished,
      });
      if (res.data.isSuccess && res.data.data) {
        setAnnouncements(prev => prev.map(x => x.id === a.id ? res.data.data! : x));
        toast.success(a.isPublished ? 'Unpublished' : 'Published');
      }
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await announcementApi.delete(deleteTarget.id);
      setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget.id));
      setTotalCount(n => n - 1);
      setDeleteTarget(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setIsDeleting(false); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      <div className={`px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Announcements</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{totalCount} total</span>
          <button onClick={fetchAnnouncements} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors text-white">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      <div className={`px-8 py-4 border-b ${t.border} flex flex-wrap gap-3`}>
        <div className="relative flex-1 min-w-48">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <input type="text" placeholder="Search by title..." value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${t.input}`} />
        </div>
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext} pointer-events-none`} />
          <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
            className={`pl-9 pr-8 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}>
            <option value="">All Modules</option>
            {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <select value={filterPublished} onChange={e => setFilterPublished(e.target.value)}
          className={`px-4 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}>
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      <div className="px-8 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className={`animate-pulse h-16 rounded-xl ${t.skeleton}`} />)}
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Megaphone className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
            <p className={t.subtext}>No announcements found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${t.row}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm truncate">{a.title}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                      a.isPublished ? 'bg-emerald-500/20 text-emerald-600' : isDark ? 'bg-zinc-700 text-zinc-400' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {a.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-600 flex-shrink-0">
                      {a.module}
                    </span>
                  </div>
                  <p className={`text-xs truncate mb-1 ${t.subtext}`}>{a.content}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] ${t.mutedtext}`}>{a.category}</span>
                    <span className={`text-[10px] ${t.mutedtext}`}>
                      {new Date(a.createdOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleTogglePublish(a)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                    {a.isPublished ? <EyeOff className={`w-4 h-4 ${t.subtext}`} /> : <Eye className={`w-4 h-4 ${t.subtext}`} />}
                  </button>
                  <button onClick={() => openEdit(a)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                    <Pencil className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                  <button onClick={() => setDeleteTarget(a)} className={`p-2 rounded-lg transition-colors ${t.btnGhost} hover:bg-red-500/20`}>
                    <Trash2 className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className={`text-xs ${t.mutedtext}`}>Page {pageNumber} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs transition-colors ${t.btnGhost}`}>Prev</button>
              <button onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))} disabled={pageNumber === totalPages}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs transition-colors ${t.btnGhost}`}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className={`relative rounded-2xl w-full max-w-lg shadow-2xl border ${t.modal}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border}`}>
              <h3 className="font-bold">{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button onClick={() => setShowForm(false)} className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Title</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all ${t.modalInput}`} />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Content</label>
                <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Announcement content..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all resize-none ${t.modalInput}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                    Module {editing && <span className="normal-case font-normal opacity-50">(cannot change)</span>}
                  </label>
                  <select value={form.module} onChange={e => setForm(f => ({ ...f, module: e.target.value }))}
                    disabled={!!editing}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none appearance-none disabled:opacity-40 disabled:cursor-not-allowed ${t.modalInput}`}>
                    {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none appearance-none ${t.modalInput}`}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-fuchsia-600' : t.toggle}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-sm ${t.subtext}`}>Publish immediately</span>
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
            <h3 className="font-bold text-lg mb-2">Delete announcement?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>"{deleteTarget.title}" will be permanently deleted.</p>
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

export default AdminAnnouncements;