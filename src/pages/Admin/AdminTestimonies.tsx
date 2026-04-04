import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, Star, X, Check, Trash2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { testimonyApi } from '../../api/testimonyApi';
import type { TestimonyDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';

const STATUS_COLORS: Record<string, string> = {
  Pending:  'bg-amber-500/20 text-amber-600',
  Approved: 'bg-emerald-500/20 text-emerald-600',
  Rejected: 'bg-red-500/20 text-red-500',
};

const AdminTestimonies = () => {
  const { isDark } = useAdminTheme();

  const t = {
    bg:       isDark ? 'bg-[#0d0d0d] text-white'     : 'bg-slate-50 text-slate-900',
    border:   isDark ? 'border-white/5'               : 'border-slate-200',
    subtext:  isDark ? 'text-zinc-400'                : 'text-slate-500',
    mutedtext:isDark ? 'text-zinc-600'                : 'text-slate-400',
    input: isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-fuchsia-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    rowActive:isDark ? 'bg-fuchsia-500/10 border-fuchsia-500/20' : 'bg-fuchsia-50 border-fuchsia-300',
    rowIdle:  isDark ? 'border-transparent hover:bg-white/4'     : 'border-transparent hover:bg-white',
    card:     isDark ? 'bg-white/4 border-white/5'    : 'bg-white border-slate-200',
    btnGhost: isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
    modal:    isDark ? 'bg-[#161616] border-white/10 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900',
    skeleton: isDark ? 'bg-white/3'                   : 'bg-slate-200',
  };

  const [testimonies, setTestimonies]     = useState<TestimonyDto[]>([]);
  const [totalCount, setTotalCount]       = useState(0);
  const [isLoading, setIsLoading]         = useState(true);
  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [pageNumber, setPageNumber]       = useState(1);
  const [selected, setSelected]           = useState<TestimonyDto | null>(null);
  const [isUpdating, setIsUpdating]       = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<TestimonyDto | null>(null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const pageSize = 10;

  const STATUS_MAP: Record<string, number> = { Pending: 0, Approved: 1, Rejected: 2 };

  const fetchTestimonies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await testimonyApi.getAll({
        fullName: search || undefined,
        status: filterStatus !== 'all' ? STATUS_MAP[filterStatus] : undefined,
        pageNumber, pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setTestimonies(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch { toast.error('Failed to load testimonies'); }
    finally { setIsLoading(false); }
  }, [search, filterStatus, pageNumber]);

  useEffect(() => { fetchTestimonies(); }, [fetchTestimonies]);
  useEffect(() => { setPageNumber(1); }, [search, filterStatus]);

  const updateStatus = async (id: number, status: number) => {
    setIsUpdating(true);
    try {
      const res = await testimonyApi.updateStatus(id, status);
      if (res.data.isSuccess && res.data.data) {
        const updated = res.data.data;
        setTestimonies(prev => prev.map(tt => tt.id === id ? updated : tt));
        if (selected?.id === id) setSelected(updated);
        toast.success('Status updated');
      }
    } catch { toast.error('Failed to update'); }
    finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await testimonyApi.delete(deleteTarget.id);
      setTestimonies(prev => prev.filter(tt => tt.id !== deleteTarget.id));
      setTotalCount(c => c - 1);
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setIsDeleting(false); }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* Header */}
      <div className={`px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Testimonies</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{totalCount} total</span>
          <button onClick={fetchTestimonies} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`px-8 py-4 border-b ${t.border} flex gap-3 flex-wrap`}>
        <div className="relative flex-1 max-w-sm">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <input type="text" placeholder="Search by name..." value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${t.input}`} />
        </div>
        <div className="flex gap-2">
          {(['all', 'Pending', 'Approved', 'Rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                filterStatus === f ? 'bg-fuchsia-600 text-white' : `${t.btnGhost} ${t.subtext}`
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-[calc(100vh-180px)]">
        {/* List */}
        <div className={`flex flex-col border-r ${t.border} transition-all duration-300 ${selected ? 'w-2/5' : 'w-full'}`}>
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => <div key={i} className={`animate-pulse h-20 rounded-xl ${t.skeleton}`} />)}
              </div>
            ) : testimonies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Star className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
                <p className={`text-sm ${t.subtext}`}>No testimonies found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testimonies.map(tt => (
                  <button key={tt.id} onClick={() => setSelected(tt)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                      selected?.id === tt.id ? t.rowActive : t.rowIdle
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm">{tt.name}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[tt.status] ?? 'bg-slate-200 text-slate-500'}`}>
                        {tt.status}
                      </span>
                    </div>
                    <p className={`text-xs truncate mb-2 ${t.subtext}`}>{tt.content}</p>
                    <span className={`text-[10px] flex items-center gap-1 ${t.mutedtext}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(tt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
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

        {/* Detail */}
        {selected && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`px-8 py-5 border-b ${t.border} flex items-center justify-between`}>
              <div>
                <h2 className="font-bold text-lg">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status]}`}>
                    {selected.status}
                  </span>
                  <span className={`text-xs ${t.subtext}`}>
                    {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className={`w-4 h-4 ${t.subtext}`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className={`rounded-xl p-5 border ${t.card}`}>
                <p className={`text-xs uppercase tracking-widest mb-3 ${t.subtext}`}>Testimony</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.content}</p>
              </div>
            </div>

            <div className={`px-8 py-5 border-t ${t.border} flex flex-wrap items-center gap-3`}>
              {selected.status !== 'Approved' && (
                <button onClick={() => updateStatus(selected.id, 1)} disabled={isUpdating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors disabled:opacity-50 text-white">
                  {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve
                </button>
              )}
              {selected.status !== 'Rejected' && (
                <button onClick={() => updateStatus(selected.id, 2)} disabled={isUpdating}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors disabled:opacity-50 hover:bg-red-500/20 hover:text-red-500 ${t.btnGhost} ${t.subtext}`}>
                  Reject
                </button>
              )}
              {selected.status !== 'Pending' && (
                <button onClick={() => updateStatus(selected.id, 0)} disabled={isUpdating}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${t.btnGhost} ${t.subtext}`}>
                  Set Pending
                </button>
              )}
              <button onClick={() => setDeleteTarget(selected)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors ml-auto hover:bg-red-500/20 hover:text-red-500 ${t.btnGhost} ${t.subtext}`}>
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm text-center border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Delete testimony?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${t.btnGhost}`}>Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm font-bold text-white">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonies;