import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Search, HandHeart, Check, X,
  Clock, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { prayerApi } from '../../api/prayerApi';
import type { PrayerRequestDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';

const AdminPrayerRequests = () => {
  const { isDark } = useAdminTheme();

  const t = {
    bg:        isDark ? 'bg-[#0d0d0d] text-white'     : 'bg-slate-50 text-slate-900',
    border:    isDark ? 'border-white/5'               : 'border-slate-200',
    subtext:   isDark ? 'text-zinc-400'                : 'text-slate-500',
    mutedtext: isDark ? 'text-zinc-600'                : 'text-slate-400',
    input:     isDark
      ? 'bg-white/5 border-white/8 text-white placeholder-zinc-600 focus:border-fuchsia-500/50'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    rowActive: isDark ? 'bg-fuchsia-500/10 border-fuchsia-500/20' : 'bg-fuchsia-50 border-fuchsia-300',
    rowIdle:   isDark ? 'border-transparent hover:bg-white/4'     : 'border-transparent hover:bg-white',
    card:      isDark ? 'bg-white/4 border-white/5'    : 'bg-white border-slate-200',
    btnGhost:  isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
    modal:     isDark ? 'bg-[#161616] border-white/10 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900',
    skeleton:  isDark ? 'bg-white/3'                   : 'bg-slate-200',
  };

  const [requests, setRequests]             = useState<PrayerRequestDto[]>([]);
  const [totalCount, setTotalCount]         = useState(0);
  const [isLoading, setIsLoading]           = useState(true);
  const [search, setSearch]                 = useState('');
  const [filterAttended, setFilterAttended] =
    useState<'all' | 'pending' | 'attended'>('all');
  const [pageNumber, setPageNumber]         = useState(1);
  const [selected, setSelected]             = useState<PrayerRequestDto | null>(null);
  const [isUpdating, setIsUpdating]         = useState(false);
  const [deleteTarget, setDeleteTarget]     = useState<PrayerRequestDto | null>(null);
  const [isDeleting, setIsDeleting]         = useState(false);
  const pageSize = 10;

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await prayerApi.getAll({
        name: search || undefined,
        isAttendedTo:
          filterAttended === 'all'
            ? undefined
            : filterAttended === 'attended',
        pageNumber,
        pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setRequests(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch {
      toast.error('Failed to load prayer requests');
    } finally {
      setIsLoading(false);
    }
  }, [search, filterAttended, pageNumber]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { setPageNumber(1); }, [search, filterAttended]);

  const markAttended = async (id: number, attended: boolean) => {
    setIsUpdating(true);
    try {
      const res = await prayerApi.markAsAttended(id, attended);
      if (res.data.isSuccess && res.data.data) {
        const updated = res.data.data;
        setRequests(prev => prev.map(r => r.id === id ? updated : r));
        if (selected?.id === id) setSelected(updated);
        toast.success(attended ? 'Marked as attended' : 'Marked as pending');
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleHardDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await prayerApi.hardDelete(deleteTarget.id);
      setRequests(prev => prev.filter(r => r.id !== deleteTarget.id));
      setTotalCount(n => n - 1);
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      toast.success('Prayer request permanently deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* Header */}
      <div className={`px-8 pt-8 pb-6 border-b ${t.border}
        flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em]
            text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Prayer Requests</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{totalCount} total</span>
          <button
            onClick={fetchRequests}
            className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}
          >
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`px-8 py-4 border-b ${t.border} flex gap-3 flex-wrap`}>
        <div className="relative flex-1 max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2
            w-4 h-4 ${t.subtext}`} />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm
              outline-none transition-all ${t.input}`}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'attended'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterAttended(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase
                tracking-widest transition-colors ${
                  filterAttended === f
                    ? 'bg-fuchsia-600 text-white'
                    : `${t.btnGhost} ${t.subtext}`
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Split view */}
      <div className="flex h-[calc(100vh-180px)]">

        {/* List */}
        <div className={`flex flex-col border-r ${t.border} transition-all
          duration-300 ${selected ? 'w-2/5' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`animate-pulse h-20 rounded-xl
                    ${t.skeleton}`} />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center
                h-full text-center">
                <HandHeart className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
                <p className={`text-sm ${t.subtext}`}>
                  No prayer requests found
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`w-full text-left p-4 rounded-xl border
                      transition-all duration-150 ${
                        selected?.id === r.id ? t.rowActive : t.rowIdle
                      }`}
                  >
                    <div className="flex items-start justify-between
                      gap-2 mb-1">
                      <span className={`font-bold text-sm ${
                        !r.isAttendedTo ? 'text-slate-900' : t.subtext
                      }`}>
                        {r.name}
                      </span>
                      <span className={`text-[10px] font-bold uppercase
                        px-2 py-0.5 rounded-full flex-shrink-0 ${
                          r.isAttendedTo
                            ? 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-amber-500/20 text-amber-600'
                        }`}>
                        {r.isAttendedTo ? 'Attended' : 'Pending'}
                      </span>
                    </div>
                    <p className={`text-xs truncate mb-2 ${t.subtext}`}>
                      {r.content}
                    </p>
                    <span className={`text-[10px] flex items-center gap-1
                      ${t.mutedtext}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className={`px-4 py-3 border-t ${t.border} flex items-center
              justify-between`}>
              <span className={`text-xs ${t.mutedtext}`}>
                Page {pageNumber} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className={`p-1.5 rounded transition-colors
                    disabled:opacity-30 ${t.btnGhost}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                  disabled={pageNumber === totalPages}
                  className={`p-1.5 rounded transition-colors
                    disabled:opacity-30 ${t.btnGhost}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`px-8 py-5 border-b ${t.border} flex items-center
              justify-between`}>
              <div>
                <h2 className="font-bold text-lg">{selected.name}</h2>
                <p className={`text-xs ${t.subtext}`}>
                  {new Date(selected.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long',
                    day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}
              >
                <X className={`w-4 h-4 ${t.subtext}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              <div className={`rounded-xl p-5 border ${t.card}`}>
                <p className={`text-xs uppercase tracking-widest mb-3
                  ${t.subtext}`}>
                  Prayer Request
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.content}
                </p>
              </div>
              <div className={`rounded-xl p-4 border ${t.card}`}>
                <p className={`text-xs uppercase tracking-widest mb-2
                  ${t.subtext}`}>
                  Status
                </p>
                <span className={`text-sm font-bold ${
                  selected.isAttendedTo
                    ? 'text-emerald-500'
                    : 'text-amber-500'
                }`}>
                  {selected.isAttendedTo ? '✓ Attended to' : '⏳ Pending'}
                </span>
              </div>
            </div>

            <div className={`px-8 py-5 border-t ${t.border} flex
              items-center gap-3`}>
              {selected.isAttendedTo ? (
                <>
                  <button
                    onClick={() => markAttended(selected.id, false)}
                    disabled={isUpdating}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold
                      uppercase tracking-widest transition-colors
                      disabled:opacity-50 ${t.btnGhost}`}
                  >
                    Mark as Pending
                  </button>
                  {/* Hard delete — only shown for attended requests */}
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                      text-sm font-bold uppercase tracking-widest text-red-500
                      hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </button>
                </>
              ) : (
                <button
                  onClick={() => markAttended(selected.id, true)}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-5 py-2.5
                    bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm
                    font-bold uppercase tracking-widest transition-colors
                    disabled:opacity-50 text-white"
                >
                  {isUpdating
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Check className="w-4 h-4" />
                  }
                  Mark as Attended
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hard Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm text-center
            border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Permanently Delete?</h3>
            <p className={`text-sm mb-2 ${t.subtext}`}>
              This prayer request from{' '}
              <strong>{deleteTarget.name}</strong> will be permanently removed
              from the database. This action cannot be undone.
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 border
              border-amber-200 rounded-xl p-3 mb-6">
              Only attended prayer requests can be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className={`flex-1 py-2.5 rounded-lg text-sm
                  transition-colors ${t.btnGhost}`}
              >
                Cancel
              </button>
              <button
                onClick={handleHardDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500
                  hover:bg-red-600 disabled:opacity-50 text-sm font-bold
                  text-white flex items-center justify-center gap-2"
              >
                {isDeleting
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : null
                }
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrayerRequests;