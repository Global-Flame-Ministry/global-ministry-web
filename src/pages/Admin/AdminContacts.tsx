import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Trash2, RefreshCw, Search, Filter,
  ChevronLeft, ChevronRight, X, Phone, Clock,
  Tag, MessageSquare, ExternalLink, Inbox
} from 'lucide-react';
import { contactApi } from '../../api/contactApi';
import type { ContactDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'New',          value: '1' },
  { label: 'Read',         value: '2' },
  { label: 'Responded',    value: '3' },
  { label: 'Closed',       value: '4' },
];

const TYPE_OPTIONS = [
  { label: 'All Types',    value: '' },
  { label: 'General',      value: '1' },
  { label: 'Join Request', value: '2' },
  { label: 'Counselling',  value: '3' },
  { label: 'Feedback',     value: '4' },
];

const NEXT_STATUS: Record<string, { label: string; value: number }> = {
  New:       { label: 'Mark as Read',      value: 2 },
  Read:      { label: 'Mark as Responded', value: 3 },
  Responded: { label: 'Mark as Closed',    value: 4 },
  Closed:    { label: 'Re-open',           value: 1 },
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    New:       'bg-fuchsia-500/20 text-fuchsia-600 border border-fuchsia-500/30',
    Read:      'bg-blue-500/20   text-blue-600   border border-blue-500/30',
    Responded: 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30',
    Closed:    'bg-slate-200 text-slate-500 border border-slate-300',
  };
  return map[status] ?? 'bg-slate-200 text-slate-500';
};

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    General:     'bg-violet-500/20 text-violet-600',
    JoinRequest: 'bg-amber-500/20  text-amber-600',
    Counselling: 'bg-cyan-500/20   text-cyan-600',
    Feedback:    'bg-rose-500/20   text-rose-600',
  };
  return map[type] ?? 'bg-slate-200 text-slate-500';
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const AdminContacts: React.FC = () => {
  const { isDark } = useAdminTheme();

  const t = {
    bg:         isDark ? 'bg-[#0d0d0d] text-white'     : 'bg-slate-50 text-slate-900',
    border:     isDark ? 'border-white/5'               : 'border-slate-200',
    subtext:    isDark ? 'text-zinc-400'                : 'text-slate-500',
    mutedtext:  isDark ? 'text-zinc-600'                : 'text-slate-400',
    input: isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-fuchsia-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    row:        isDark ? 'hover:bg-white/4 border-transparent'     : 'hover:bg-white border-transparent',
    rowActive:  isDark ? 'bg-fuchsia-500/10 border-fuchsia-500/20' : 'bg-fuchsia-50 border-fuchsia-300',
    card:       isDark ? 'bg-white/4 border-white/5'    : 'bg-white border-slate-200',
    btnGhost:   isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
    modal:      isDark ? 'bg-[#161616] border-white/10' : 'bg-white border-slate-200 shadow-xl',
    skeleton:   isDark ? 'bg-white/3'                   : 'bg-slate-100',
    emptyIcon:  isDark ? 'bg-white/5 border-white/8'    : 'bg-slate-100 border-slate-200',
  };

  const [contacts, setContacts]         = useState<ContactDto[]>([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');
  const [pageNumber, setPageNumber]     = useState(1);
  const pageSize = 10;
  const [selected, setSelected]         = useState<ContactDto | null>(null);
  const [isUpdating, setIsUpdating]     = useState(false);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await contactApi.getAll({
        fullName: search || undefined,
        status: filterStatus ? Number(filterStatus) : undefined,
        type: filterType ? Number(filterType) : undefined,
        pageNumber,
        pageSize,
        sortBy: 'createdat',
        isDescending: true,
      });

      if (res.data.isSuccess && res.data.data) {
        const items = filterStatus === '4'
          ? res.data.data.items
          : res.data.data.items.filter(c => c.status !== 'Closed');

        setContacts(items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch { toast.error('Failed to load messages'); }
    finally { setIsLoading(false); }
  }, [search, filterStatus, filterType, pageNumber]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => { setPageNumber(1); }, [search, filterStatus, filterType]);

  const openDetail = async (contact: ContactDto) => {
    setSelected(contact);
    if (contact.status === 'New') {
      try {
        const res = await contactApi.updateStatus(contact.id, { status: 2 });
        if (res.data.isSuccess && res.data.data) {
          const updated = res.data.data;
          setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
          setSelected(updated);
        }
      } catch { /* silent */ }
    }
  };

  const advanceStatus = async () => {
    if (!selected) return;
    const next = NEXT_STATUS[selected.status];
    if (!next) return;
    setIsUpdating(true);
    try {
      const res = await contactApi.updateStatus(selected.id, { status: next.value });
      if (res.data.isSuccess && res.data.data) {
        const updated = res.data.data;
        setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelected(updated);
        toast.success(`Status updated to ${updated.status}`);
      }
    } catch { toast.error('Failed to update status'); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsDeleting(true);
    try {
      await contactApi.delete(selected.id);
      setContacts(prev => prev.filter(c => c.id !== selected.id));
      setTotalCount(n => n - 1);
      setSelected(null);
      setShowDeleteConfirm(false);
      toast.success('Message deleted');
    } catch { toast.error('Failed to delete message'); }
    finally { setIsDeleting(false); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* Header */}
      <div className={`px-4 sm:px-8 pt-8 pb-6 border-b ${t.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Inbox</p>
            <h1 className="text-2xl font-bold tracking-tight">Contact Messages</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${t.subtext}`}>
              {totalCount} total message{totalCount !== 1 ? 's' : ''}
            </span>
            {filterStatus !== '4' && (
              <button
                onClick={() => setFilterStatus('4')}
                className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${t.btnGhost}`}
              >
                📦 View Archive
              </button>
            )}
            {filterStatus === '4' && (
              <button
                onClick={() => setFilterStatus('')}
                className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-fuchsia-100 text-fuchsia-600 transition-colors"
              >
                ← Back to Inbox
              </button>
            )}
            <button onClick={fetchContacts} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
              <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
            <input type="text" placeholder="Search by name or email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${t.input}`} />
          </div>
          <div className="relative">
            <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className={`pl-9 pr-8 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="relative">
            <Tag className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className={`pl-9 pr-8 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex h-[calc(100vh-180px)] relative">

        {/* List — full width on mobile, 2/5 on sm+ when detail is open */}
        <div className={`flex flex-col border-r ${t.border} transition-all duration-300 w-full
          ${selected ? 'sm:w-2/5' : 'sm:w-full'}
          ${selected ? 'hidden sm:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-px p-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`animate-pulse p-4 rounded-lg ${t.skeleton}`}>
                    <div className="flex justify-between mb-2">
                      <div className={`h-3 ${t.skeleton} rounded w-32`} />
                      <div className={`h-3 ${t.skeleton} rounded w-16`} />
                    </div>
                    <div className={`h-3 ${t.skeleton} rounded w-48 mb-2`} />
                    <div className={`h-3 ${t.skeleton} rounded w-full`} />
                  </div>
                ))}
              </div>
            ) : contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${t.emptyIcon}`}>
                  <Inbox className={`w-8 h-8 ${t.mutedtext}`} />
                </div>
                <p className={`text-sm ${t.subtext}`}>No messages found</p>
                <p className={`text-xs mt-1 ${t.mutedtext}`}>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="flex flex-col gap-px p-2">
                {contacts.map(contact => (
                  <button key={contact.id} onClick={() => openDetail(contact)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-150 relative border ${
                      selected?.id === contact.id ? t.rowActive : t.row
                    }`}>
                    {contact.status === 'New' && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-fuchsia-500" />
                    )}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`font-bold text-sm truncate ${contact.status === 'New' ? 'text-slate-900' : t.subtext}`}>
                        {contact.fullName}
                      </span>
                      <span className={`text-xs shrink-0 ${t.mutedtext}`}>{formatDate(contact.createdAt)}</span>
                    </div>
                    <p className={`text-xs truncate mb-2 ${t.subtext}`}>{contact.email}</p>
                    <p className={`text-xs truncate mb-3 ${t.mutedtext}`}>{contact.message}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusBadge(contact.status)}`}>
                        {contact.status}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeBadge(contact.type)}`}>
                        {contact.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className={`px-4 py-3 border-t ${t.border} flex items-center justify-between`}>
              <span className={`text-xs ${t.mutedtext}`}>Page {pageNumber} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1}
                  className={`p-1.5 rounded transition-colors disabled:opacity-30 ${t.btnGhost}`}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))} disabled={pageNumber === totalPages}
                  className={`p-1.5 rounded transition-colors disabled:opacity-30 ${t.btnGhost}`}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel — overlays full screen on mobile, side panel on sm+ */}
        {selected && (
          <div
            className="flex-1 flex flex-col overflow-hidden absolute inset-0 sm:static z-10"
            style={{ background: isDark ? '#0d0d0d' : '#f8fafc' }}
          >
            <div className={`px-4 sm:px-8 py-5 border-b ${t.border} flex items-start justify-between gap-4`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-lg font-bold truncate">{selected.fullName}</h2>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusBadge(selected.status)}`}>
                    {selected.status}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeBadge(selected.type)}`}>
                    {selected.type}
                  </span>
                </div>
                <div className={`flex items-center gap-4 text-xs ${t.subtext}`}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(selected.createdAt)} at {formatTime(selected.createdAt)}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className={`p-2 rounded-lg transition-colors shrink-0 ${t.btnGhost}`}>
                <X className={`w-4 h-4 ${t.subtext}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`rounded-xl p-4 border ${t.card}`}>
                  <p className={`text-xs uppercase tracking-widest mb-1 ${t.subtext}`}>Email</p>
                  <a href={`mailto:${selected.email}`}
                    className="text-sm text-fuchsia-500 hover:text-fuchsia-600 flex items-center gap-1.5 transition-colors">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{selected.email}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                  </a>
                </div>
                <div className={`rounded-xl p-4 border ${t.card}`}>
                  <p className={`text-xs uppercase tracking-widest mb-1 ${t.subtext}`}>Phone</p>
                  {selected.phoneNumber ? (
                    <a href={`tel:${selected.phoneNumber}`}
                      className="text-sm text-fuchsia-500 hover:text-fuchsia-600 flex items-center gap-1.5 transition-colors">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {selected.phoneNumber}
                    </a>
                  ) : (
                    <p className={`text-sm italic ${t.mutedtext}`}>Not provided</p>
                  )}
                </div>
              </div>

              <div className={`rounded-xl p-5 border ${t.card}`}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className={`w-4 h-4 ${t.subtext}`} />
                  <p className={`text-xs uppercase tracking-widest ${t.subtext}`}>Message</p>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className={`rounded-xl p-5 border ${t.card}`}>
                <p className={`text-xs uppercase tracking-widest mb-3 ${t.subtext}`}>Status Workflow</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {['New', 'Read', 'Responded', 'Closed'].map((s, i, arr) => (
                    <React.Fragment key={s}>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                        selected.status === s
                          ? statusBadge(s) + ' scale-105'
                          : isDark ? 'text-zinc-600 bg-white/3' : 'text-slate-400 bg-slate-100'
                      }`}>{s}</span>
                      {i < arr.length - 1 && <ChevronRight className={`w-3 h-3 shrink-0 ${t.mutedtext}`} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className={`px-4 sm:px-8 py-5 border-t ${t.border} flex flex-wrap items-center gap-3`}>
              {NEXT_STATUS[selected.status] && (
                <button onClick={advanceStatus} disabled={isUpdating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors text-white">
                  {isUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {NEXT_STATUS[selected.status].label}
                </button>
              )}
              <a href={`mailto:${selected.email}?subject=Re: Your message to Global Flame Ministries`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${t.btnGhost}`}>
                <Mail className="w-4 h-4" /> Reply via Email
              </a>
              <button onClick={() => setShowDeleteConfirm(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ml-auto ${t.subtext} hover:bg-red-500/20 hover:text-red-500`}>
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        )}

        {!selected && !isLoading && contacts.length > 0 && (
          <div className="hidden lg:flex flex-1 items-center justify-center text-center px-8">
            <div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${t.emptyIcon}`}>
                <Mail className={`w-8 h-8 ${t.mutedtext}`} />
              </div>
              <p className={`text-sm ${t.subtext}`}>Select a message to read it</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm shadow-2xl border ${t.modal}`}>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">Delete this message?</h3>
            <p className={`text-sm text-center mb-6 ${t.subtext}`}>
              From <span className="font-bold">{selected.fullName}</span>. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ${t.btnGhost}`}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm font-bold uppercase tracking-widest transition-colors text-white flex items-center justify-center gap-2">
                {isDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;