import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, RefreshCw, Search, Pencil,
  X, Calendar, MapPin, Filter, Ban, Building2
} from 'lucide-react';
import { eventApi, type CreateEventDto, type UpdateEventDto } from '../../api/eventApi';
import { ministryApi } from '../../api/ministryApi';
import type { EventDto, MinistryResponseDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import ImageUpload from '../../components/ImageUpload';

const MODULES = ['Ministry', 'Youth'];

const emptyForm = (): CreateEventDto => ({
  title: '', description: '', startDate: '', endDate: '',
  location: '', imageUrl: '', module: 'Ministry',
  ministryId: null,
  acceptsDonations: false, donationLabel: '',
  acceptsRegistrations: true,
});

const TEXT_FIELDS: { label: string; key: keyof CreateEventDto; placeholder: string }[] = [
  { label: 'Title',    key: 'title',    placeholder: 'Event title' },
  { label: 'Location', key: 'location', placeholder: 'e.g. Jos, Plateau State' },
];

const AdminEvents = () => {
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

  const [events, setEvents]                   = useState<EventDto[]>([]);
  const [totalCount, setTotalCount]           = useState(0);
  const [isLoading, setIsLoading]             = useState(true);
  const [search, setSearch]                   = useState('');
  const [filterModule, setFilterModule]       = useState('');
  const [filterCancelled, setFilterCancelled] = useState('');
  const [pageNumber, setPageNumber]           = useState(1);
  const pageSize = 10;
  const [showForm, setShowForm]               = useState(false);
  const [editing, setEditing]                 = useState<EventDto | null>(null);
  const [form, setForm]                       = useState<CreateEventDto>(emptyForm());
  const [isCancelledForm, setIsCancelledForm] = useState(false);
  const [isSaving, setIsSaving]               = useState(false);
  const [deleteTarget, setDeleteTarget]       = useState<EventDto | null>(null);
  const [isDeleting, setIsDeleting]           = useState(false);
  const [ministries, setMinistries]           = useState<MinistryResponseDto[]>([]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await eventApi.adminGetAll({
        title: search || undefined,
        module: filterModule || undefined,
        isCancelled: filterCancelled === '' ? undefined : filterCancelled === 'true',
        pageNumber,
        pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setEvents(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch { toast.error('Failed to load events'); }
    finally { setIsLoading(false); }
  }, [search, filterModule, filterCancelled, pageNumber]);

  useEffect(() => {
    ministryApi.adminGetAll({ pageSize: 100 })
      .then(res => {
        if (res.data.isSuccess && res.data.data)
          setMinistries(res.data.data.items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { setPageNumber(1); }, [search, filterModule, filterCancelled]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setIsCancelledForm(false);
    setShowForm(true);
  };

  const openEdit = (e: EventDto) => {
    setEditing(e);
    setForm({
      title:                e.title,
      description:          e.description ?? '',
      module:               e.module,
      startDate:            e.startDate.slice(0, 16),
      endDate:              e.endDate.slice(0, 16),
      location:             e.location,
      imageUrl:             e.imageUrl ?? '',
      ministryId:           e.ministryId ?? null,
      acceptsDonations:     e.acceptsDonations,
      donationLabel:        e.donationLabel ?? '',
      acceptsRegistrations: e.acceptsRegistrations,
    });
    setIsCancelledForm(e.isCancelled);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim())    { toast.error('Title is required');      return; }
    if (!form.startDate)       { toast.error('Start date is required'); return; }
    if (!form.endDate)         { toast.error('End date is required');   return; }
    if (!form.location.trim()) { toast.error('Location is required');   return; }

    setIsSaving(true);
    try {
      const sanitized = {
        ...form,
        imageUrl:      form.imageUrl?.trim()      || undefined,
        description:   form.description?.trim()   || undefined,
        donationLabel: form.donationLabel?.trim() || undefined,
        ministryId:    form.ministryId || null,
      };

      if (editing) {
        const updateDto: UpdateEventDto = {
          title:                sanitized.title,
          description:          sanitized.description,
          startDate:            sanitized.startDate,
          endDate:              sanitized.endDate,
          location:             sanitized.location,
          imageUrl:             sanitized.imageUrl,
          isCancelled:          isCancelledForm,
          ministryId:           sanitized.ministryId,
          acceptsDonations:     sanitized.acceptsDonations,
          donationLabel:        sanitized.donationLabel,
          acceptsRegistrations: sanitized.acceptsRegistrations,
        };
        const res = await eventApi.update(editing.id, updateDto);
        if (res.data.isSuccess) { toast.success('Event updated'); setShowForm(false); fetchEvents(); }
      } else {
        const res = await eventApi.create(sanitized);
        if (res.data.isSuccess) { toast.success('Event created'); setShowForm(false); fetchEvents(); }
      }
    } catch { toast.error('Failed to save event'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await eventApi.delete(deleteTarget.id);
      setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
      setTotalCount(n => n - 1);
      setDeleteTarget(null);
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete event'); }
    finally { setIsDeleting(false); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      <div className={`px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Events</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{totalCount} total</span>
          <button onClick={fetchEvents} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors text-white">
            <Plus className="w-4 h-4" /> New Event
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
        <select value={filterCancelled} onChange={e => setFilterCancelled(e.target.value)}
          className={`px-4 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}>
          <option value="">All Events</option>
          <option value="false">Active</option>
          <option value="true">Cancelled</option>
        </select>
      </div>

      <div className="px-8 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className={`animate-pulse h-20 rounded-xl ${t.skeleton}`} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Calendar className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
            <p className={t.subtext}>No events found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map(e => (
              <div key={e.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${t.row}`}>
                {e.imageUrl && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                    <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm truncate">{e.title}</p>
                    {e.isCancelled && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">Cancelled</span>
                    )}
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-600">{e.module}</span>
                    {e.ministryName && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 flex items-center gap-1">
                        <Building2 className="w-2.5 h-2.5" />{e.ministryName}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-4 text-xs ${t.subtext}`}>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(e.startDate)}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEdit(e)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                    <Pencil className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                  <button onClick={() => setDeleteTarget(e)} className={`p-2 rounded-lg transition-colors ${t.btnGhost} hover:bg-red-500/20`}>
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
          <div className={`relative rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border ${t.modal}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border} sticky top-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}>
              <h3 className="font-bold text-lg">{editing ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => setShowForm(false)} className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {TEXT_FIELDS.map(f => (
                <div key={f.key}>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>{f.label}</label>
                  <input type="text" value={form[f.key] as string}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
                </div>
              ))}

              <ImageUpload value={form.imageUrl || ''} onChange={url => setForm(p => ({ ...p, imageUrl: url ?? undefined }))} label="Event Image" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Start Date</label>
                  <input type="datetime-local" value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>End Date</label>
                  <input type="datetime-local" value={form.endDate}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Description</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Event description..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none ${t.modalInput}`} />
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Module</label>
                <select value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none appearance-none ${t.modalInput}`}>
                  {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Ministry (optional)</label>
                <select value={form.ministryId ?? ''} onChange={e => setForm(p => ({ ...p, ministryId: e.target.value ? Number(e.target.value) : null }))}
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none appearance-none ${t.modalInput}`}>
                  <option value="">— No ministry (general event) —</option>
                  {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <p className={`text-xs mt-1 ${t.label}`}>Link this event to a ministry so it appears on that ministry's page.</p>
              </div>

              <div className="flex items-center gap-3 cursor-pointer"
                onClick={() => setForm(p => ({ ...p, acceptsRegistrations: !p.acceptsRegistrations }))}>
                <div className={`w-11 h-6 rounded-full transition-colors ${form.acceptsRegistrations ? 'bg-fuchsia-600' : t.toggle}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.acceptsRegistrations ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-sm ${t.subtext}`}>Accepts registrations</span>
              </div>

              <div className="flex items-center gap-3 cursor-pointer"
                onClick={() => setForm(p => ({ ...p, acceptsDonations: !p.acceptsDonations }))}>
                <div className={`w-11 h-6 rounded-full transition-colors ${form.acceptsDonations ? 'bg-fuchsia-600' : t.toggle}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.acceptsDonations ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-sm ${t.subtext}`}>Accepts donations</span>
              </div>

              {form.acceptsDonations && (
                <input type="text" value={form.donationLabel}
                  onChange={e => setForm(p => ({ ...p, donationLabel: e.target.value }))}
                  placeholder="Donation button label (optional)"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
              )}

              {editing && (
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsCancelledForm(v => !v)}>
                  <div className={`w-11 h-6 rounded-full transition-colors ${isCancelledForm ? 'bg-red-600' : t.toggle}`}>
                    <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${isCancelledForm ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className={`text-sm flex items-center gap-2 ${t.subtext}`}>
                    <Ban className="w-4 h-4 text-red-500" /> Mark as cancelled
                  </span>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t ${t.border} flex gap-3 justify-end sticky bottom-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}>
              <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${t.btnGhost}`}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-sm font-bold text-white flex items-center gap-2">
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {editing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm text-center border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Delete event?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>"{deleteTarget.title}" will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${t.btnGhost}`}>Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm font-bold text-white flex items-center justify-center gap-2">
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

export default AdminEvents;