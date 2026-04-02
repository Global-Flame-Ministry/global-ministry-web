import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, RefreshCw, Search, Pencil,
  X, Users, Filter, Eye, EyeOff, Star
} from 'lucide-react';
import { ministryApi } from '../../api/ministryApi';
import type { MinistryResponseDto, CreateMinistryDto, UpdateMinistryDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import ImageUpload from '../../components/ImageUpload';

const emptyForm = (): CreateMinistryDto => ({
  name:             '',
  shortDescription: '',
  description:      '',
  coverImageUrl:    '',
  leaderName:       '',
  leaderTitle:      '',
  leaderImageUrl:   '',
  contactEmail:     '',
  displayOrder:     0,
  isPublished:      false,
});

const AdminMinistries = () => {
  const { isDark } = useAdminTheme();

  const t = {
    bg:         isDark ? 'bg-[#0d0d0d] text-white'     : 'bg-slate-50 text-slate-900',
    border:     isDark ? 'border-white/5'               : 'border-slate-200',
    subtext:    isDark ? 'text-zinc-400'                : 'text-slate-500',
    mutedtext:  isDark ? 'text-zinc-600'                : 'text-slate-400',
    input:      isDark
      ? 'bg-white/5 border-white/8 text-white placeholder-zinc-600 focus:border-fuchsia-500/50'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    row:        isDark ? 'bg-white/3 hover:bg-white/5 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200',
    btnGhost:   isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
    modal:      isDark ? 'bg-[#161616] border-white/10 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900',
    modalInput: isDark
      ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-fuchsia-500/50'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500',
    label:      isDark ? 'text-zinc-400' : 'text-slate-600',
    skeleton:   isDark ? 'bg-white/3'   : 'bg-slate-200',
  };

  const [ministries, setMinistries]     = useState<MinistryResponseDto[]>([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [pageNumber, setPageNumber]     = useState(1);
  const pageSize = 10;

  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState<MinistryResponseDto | null>(null);
  const [form, setForm]                 = useState<CreateMinistryDto>(emptyForm());
  const [isSaving, setIsSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MinistryResponseDto | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  const fetchMinistries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ministryApi.adminGetAll({
        name:        search || undefined,
        isPublished: filterPublished === '' ? undefined : filterPublished === 'true',
        pageNumber,
        pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setMinistries(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch { toast.error('Failed to load ministries'); }
    finally { setIsLoading(false); }
  }, [search, filterPublished, pageNumber]);

  useEffect(() => { fetchMinistries(); }, [fetchMinistries]);
  useEffect(() => { setPageNumber(1); }, [search, filterPublished]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (m: MinistryResponseDto) => {
    setEditing(m);
    setForm({
      name:             m.name,
      shortDescription: m.shortDescription,
      description:      m.description ?? '',
      coverImageUrl:    m.coverImageUrl ?? '',
      leaderName:       m.leaderName ?? '',
      leaderTitle:      m.leaderTitle ?? '',
      leaderImageUrl:   m.leaderImageUrl ?? '',
      contactEmail:     m.contactEmail ?? '',
      displayOrder:     m.displayOrder,
      isPublished:      m.isPublished,
    });
    setShowForm(true);
  };

  const sanitize = (dto: CreateMinistryDto): CreateMinistryDto => ({
    ...dto,
    description:    dto.description?.trim()    || undefined,
    coverImageUrl:  dto.coverImageUrl?.trim()  || undefined,
    leaderName:     dto.leaderName?.trim()     || undefined,
    leaderTitle:    dto.leaderTitle?.trim()    || undefined,
    leaderImageUrl: dto.leaderImageUrl?.trim() || undefined,
    contactEmail:   dto.contactEmail?.trim()   || undefined,
  });

  const handleSave = async () => {
    if (!form.name.trim())             { toast.error('Name is required');              return; }
    if (!form.shortDescription.trim()) { toast.error('Short description is required'); return; }

    setIsSaving(true);
    try {
      const dto = sanitize(form);
      if (editing) {
        const res = await ministryApi.update(editing.id, dto as UpdateMinistryDto);
        if (res.data.isSuccess) {
          toast.success('Ministry updated');
          setShowForm(false);
          fetchMinistries();
        }
      } else {
        const res = await ministryApi.create(dto);
        if (res.data.isSuccess) {
          toast.success('Ministry created');
          setShowForm(false);
          fetchMinistries();
        }
      }
    } catch { toast.error('Failed to save ministry'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ministryApi.delete(deleteTarget.id);
      setMinistries(prev => prev.filter(m => m.id !== deleteTarget.id));
      setTotalCount(n => n - 1);
      setDeleteTarget(null);
      toast.success('Ministry deleted');
    } catch { toast.error('Failed to delete ministry'); }
    finally { setIsDeleting(false); }
  };

  const togglePublish = async (ministry: MinistryResponseDto) => {
    try {
      const dto: UpdateMinistryDto = {
        name:             ministry.name,
        shortDescription: ministry.shortDescription,
        description:      ministry.description ?? undefined,
        coverImageUrl:    ministry.coverImageUrl ?? undefined,
        leaderName:       ministry.leaderName ?? undefined,
        leaderTitle:      ministry.leaderTitle ?? undefined,
        leaderImageUrl:   ministry.leaderImageUrl ?? undefined,
        contactEmail:     ministry.contactEmail ?? undefined,
        displayOrder:     ministry.displayOrder,
        isPublished:      !ministry.isPublished,
      };
      const res = await ministryApi.update(ministry.id, dto);
      if (res.data.isSuccess) {
        setMinistries(prev => prev.map(m =>
          m.id === ministry.id ? { ...m, isPublished: !m.isPublished } : m
        ));
        toast.success(ministry.isPublished ? 'Ministry unpublished' : 'Ministry published');
      }
    } catch { toast.error('Failed to update ministry'); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* Header */}
      <div className={`px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Ministries</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{totalCount} total</span>
          <button onClick={fetchMinistries} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500
              rounded-lg text-sm font-bold uppercase tracking-widest transition-colors text-white"
          >
            <Plus className="w-4 h-4" /> New Ministry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`px-8 py-4 border-b ${t.border} flex flex-wrap gap-3`}>
        <div className="relative flex-1 min-w-48">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${t.input}`}
          />
        </div>
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <select
            value={filterPublished}
            onChange={e => setFilterPublished(e.target.value)}
            className={`pl-9 pr-8 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}
          >
            <option value="">All Ministries</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="px-8 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`animate-pulse h-24 rounded-xl ${t.skeleton}`} />
            ))}
          </div>
        ) : ministries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
            <p className={t.subtext}>No ministries found</p>
            <button
              onClick={openCreate}
              className="mt-4 text-fuchsia-600 text-sm font-bold uppercase tracking-widest"
            >
              Add your first ministry
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {ministries.map(ministry => (
              <div
                key={ministry.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${t.row}`}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  {ministry.coverImageUrl ? (
                    <img src={ministry.coverImageUrl} alt={ministry.name}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className={`w-6 h-6 ${t.mutedtext}`} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm truncate">{ministry.name}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ministry.isPublished
                        ? 'bg-emerald-500/20 text-emerald-600'
                        : 'bg-amber-500/20 text-amber-600'
                    }`}>
                      {ministry.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full
                      ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-400'}`}>
                      /{ministry.slug}
                    </span>
                  </div>
                  <p className={`text-xs ${t.subtext} truncate max-w-lg`}>
                    {ministry.shortDescription}
                  </p>
                  {ministry.leaderName && (
                    <p className={`text-xs mt-0.5 ${t.mutedtext}`}>
                      Lead: {ministry.leaderName}
                      {ministry.leaderTitle && ` · ${ministry.leaderTitle}`}
                    </p>
                  )}
                </div>

                <div className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0
                  ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>
                  #{ministry.displayOrder}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => togglePublish(ministry)}
                    className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}
                    title={ministry.isPublished ? 'Unpublish' : 'Publish'}>
                    {ministry.isPublished
                      ? <EyeOff className={`w-4 h-4 ${t.subtext}`} />
                      : <Eye className={`w-4 h-4 ${t.subtext}`} />}
                  </button>
                  <button onClick={() => openEdit(ministry)}
                    className={`p-2 rounded-lg transition-colors ${t.btnGhost}`} title="Edit">
                    <Pencil className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                  <button onClick={() => setDeleteTarget(ministry)}
                    className={`p-2 rounded-lg transition-colors ${t.btnGhost} hover:bg-red-500/20`}
                    title="Delete">
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
              <button onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs transition-colors ${t.btnGhost}`}>
                Prev
              </button>
              <button onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs transition-colors ${t.btnGhost}`}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowForm(false)} />
          <div className={`relative rounded-2xl w-full max-w-2xl shadow-2xl
            max-h-[90vh] overflow-y-auto border ${t.modal}`}>

            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${t.border} sticky top-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}
            >
              <h3 className="font-bold text-lg">{editing ? 'Edit Ministry' : 'New Ministry'}</h3>
              <button onClick={() => setShowForm(false)}
                className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Name */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                  Ministry Name *
                </label>
                <input type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Daughters of Honour"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                />
              </div>

              {/* Short Description */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                  Short Description * (shown on cards & dropdown)
                </label>
                <input type="text" value={form.shortDescription}
                  onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                  placeholder="e.g. Empowering women to walk in their divine purpose"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                />
              </div>

              {/* Full Description */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                  Full Description (shown on ministry page)
                </label>
                <textarea rows={4} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Detailed description of the ministry..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none ${t.modalInput}`}
                />
              </div>

              {/* Cover Image — Cloudinary upload */}
              <ImageUpload
                value={form.coverImageUrl || ''}
                onChange={url => setForm(p => ({ ...p, coverImageUrl: url }))}
                label="Cover Image"
              />

              {/* Leader Name + Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                    Leader Name
                  </label>
                  <input type="text" value={form.leaderName}
                    onChange={e => setForm(p => ({ ...p, leaderName: e.target.value }))}
                    placeholder="e.g. Apostle Faith Musa"
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                    Leader Title
                  </label>
                  <input type="text" value={form.leaderTitle}
                    onChange={e => setForm(p => ({ ...p, leaderTitle: e.target.value }))}
                    placeholder="e.g. Co-Pastor"
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                  />
                </div>
              </div>

              {/* Leader Image — Cloudinary upload */}
              <ImageUpload
                value={form.leaderImageUrl || ''}
                onChange={url => setForm(p => ({ ...p, leaderImageUrl: url }))}
                label="Leader Image"
              />

              {/* Contact Email */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                  Contact Email
                </label>
                <input type="email" value={form.contactEmail}
                  onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                  placeholder="ministry@globalflame.org"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                />
              </div>

              {/* Display Order */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>
                  Display Order (lower = first)
                </label>
                <input type="number" value={form.displayOrder} min={0}
                  onChange={e => setForm(p => ({ ...p, displayOrder: Number(e.target.value) }))}
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`}
                />
              </div>

              {/* Published toggle */}
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setForm(p => ({ ...p, isPublished: !p.isPublished }))}
              >
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  form.isPublished ? 'bg-fuchsia-600' : isDark ? 'bg-white/10' : 'bg-slate-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                    form.isPublished ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
                <span className={`text-sm flex items-center gap-2 ${t.subtext}`}>
                  <Star className="w-4 h-4 text-fuchsia-500" />
                  {form.isPublished
                    ? 'Published — visible on website'
                    : 'Draft — hidden from website'}
                </span>
              </div>
            </div>

            <div
              className={`px-6 py-4 border-t ${t.border} flex gap-3 justify-end sticky bottom-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}
            >
              <button onClick={() => setShowForm(false)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${t.btnGhost}`}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500
                  disabled:opacity-50 text-sm font-bold text-white flex items-center gap-2"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {editing ? 'Update Ministry' : 'Create Ministry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)} />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm text-center border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Delete ministry?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>
              "{deleteTarget.name}" will be permanently deleted.
              All events linked to it will be unlinked.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${t.btnGhost}`}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
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

export default AdminMinistries;