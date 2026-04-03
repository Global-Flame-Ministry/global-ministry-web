import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Search, Heart, X, Check,
  ChevronLeft, ChevronRight, UserCheck, Clock
} from 'lucide-react';
import { counsellingApi } from '../../api/counsellingApi';
import type { CounsellingResponseDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: '1', label: 'New' },
  { value: '2', label: 'Assigned' },
  { value: '3', label: 'In Progress' },
  { value: '4', label: 'Completed' },
  { value: '5', label: 'Closed' },
];

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'New':        return 'bg-blue-500/20 text-blue-600';
    case 'Assigned':   return 'bg-amber-500/20 text-amber-600';
    case 'InProgress': return 'bg-purple-500/20 text-purple-600';
    case 'Completed':  return 'bg-emerald-500/20 text-emerald-600';
    case 'Closed':     return 'bg-slate-200 text-slate-500';
    default:           return 'bg-slate-100 text-slate-500';
  }
};

const AdminCounselling = () => {
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

  const [requests, setRequests]         = useState<CounsellingResponseDto[]>([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [isLoading, setIsLoading]       = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pageNumber, setPageNumber]     = useState(1);
  const [selected, setSelected]         = useState<CounsellingResponseDto | null>(null);
  const pageSize = 10;

  // Assign modal state
  const [showAssign, setShowAssign]     = useState(false);
  const [assignForm, setAssignForm]     = useState({
    assignedTo: '', assignedToEmail: ''
  });
  const [isAssigning, setIsAssigning]   = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await counsellingApi.adminGetAll({
        fullName: search || undefined,
        status: filterStatus ? Number(filterStatus) : undefined,
        pageNumber,
        pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setRequests(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch {
      toast.error('Failed to load counselling requests');
    } finally {
      setIsLoading(false);
    }
  }, [search, filterStatus, pageNumber]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { setPageNumber(1); }, [search, filterStatus]);

  const handleAssign = async () => {
    if (!selected) return;
    if (!assignForm.assignedTo.trim() || !assignForm.assignedToEmail.trim()) {
      toast.error('Please fill in all assignment fields');
      return;
    }
    setIsAssigning(true);
    try {
      const res = await counsellingApi.assign(selected.id, assignForm);
      if (res.data.isSuccess && res.data.data) {
        const updated = res.data.data;
        setRequests(prev => prev.map(r => r.id === selected.id ? updated : r));
        setSelected(updated);
        setShowAssign(false);
        setAssignForm({ assignedTo: '', assignedToEmail: '' });
        toast.success('Counsellor assigned and notified by email');
      }
    } catch {
      toast.error('Failed to assign counsellor');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusUpdate = async (status: number) => {
    if (!selected) return;
    setIsUpdatingStatus(true);
    try {
      const res = await counsellingApi.updateStatus(selected.id, status);
      if (res.data.isSuccess && res.data.data) {
        const updated = res.data.data;
        setRequests(prev => prev.map(r => r.id === selected.id ? updated : r));
        setSelected(updated);
        toast.success('Status updated');
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* Header */}
      <div className={`px-8 pt-8 pb-6 border-b ${t.border}
        flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em]
            text-fuchsia-500 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-bold">Counselling Requests</h1>
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
      <div className={`px-8 py-4 border-b ${t.border} flex flex-wrap gap-3`}>
        <div className="relative flex-1 min-w-48">
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
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className={`px-4 py-2.5 border rounded-lg text-sm outline-none
            appearance-none cursor-pointer ${t.input}`}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
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
                <Heart className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
                <p className={`text-sm ${t.subtext}`}>
                  No counselling requests found
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
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm truncate">
                        {r.fullName}
                      </span>
                      <span className={`text-[10px] font-bold uppercase
                        px-2 py-0.5 rounded-full flex-shrink-0
                        ${statusBadgeClass(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className={`text-xs truncate mb-1.5 ${t.subtext}`}>
                      {r.topic}
                    </p>
                    <span className={`text-[10px] flex items-center gap-1
                      ${t.mutedtext}`}>
                      <Clock className="w-3 h-3" />
                      {formatDate(r.createdAt)}
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

            {/* Panel Header */}
            <div className={`px-8 py-5 border-b ${t.border} flex items-center
              justify-between`}>
              <div>
                <h2 className="font-bold text-lg">{selected.fullName}</h2>
                <p className={`text-xs ${t.subtext}`}>
                  {formatDate(selected.createdAt)} ·{' '}
                  <span className={`font-bold ${statusBadgeClass(selected.status)
                    .split(' ')[1]}`}>
                    {selected.status}
                  </span>
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

              {/* Contact Info */}
              <div className={`rounded-xl p-5 border ${t.card}`}>
                <p className={`text-xs uppercase tracking-widest mb-3
                  ${t.subtext}`}>
                  Contact Information
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={t.subtext}>Email</span>
                    
                      <a href={`mailto:${selected.email}`}
                      className="font-medium text-fuchsia-600
                        hover:text-fuchsia-800 transition-colors"
                    >
                      {selected.email}
                    </a>
                  </div>
                  {selected.phoneNumber && (
                    <div className="flex justify-between">
                      <span className={t.subtext}>Phone</span>
                      <span className="font-medium">{selected.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={t.subtext}>Preferred Contact</span>
                    <span className="font-medium">{selected.preferredContact}</span>
                  </div>
                </div>
              </div>

              {/* Topic + Message */}
              <div className={`rounded-xl p-5 border ${t.card}`}>
                <p className={`text-xs uppercase tracking-widest mb-1
                  ${t.subtext}`}>
                  Topic
                </p>
                <p className="font-bold mb-4">{selected.topic}</p>
                <p className={`text-xs uppercase tracking-widest mb-2
                  ${t.subtext}`}>
                  Message
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              {/* Assignment Info */}
              {selected.assignedTo && (
                <div className={`rounded-xl p-5 border ${t.card}`}>
                  <p className={`text-xs uppercase tracking-widest mb-3
                    ${t.subtext}`}>
                    Assigned To
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className="font-bold">{selected.assignedTo}</p>
                    <p className={t.subtext}>{selected.assignedToEmail}</p>
                  </div>
                </div>
              )}

              {/* Status Updates */}
              <div className={`rounded-xl p-5 border ${t.card}`}>
                <p className={`text-xs uppercase tracking-widest mb-3
                  ${t.subtext}`}>
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 3, label: 'In Progress' },
                    { value: 4, label: 'Completed'  },
                    { value: 5, label: 'Closed'     },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusUpdate(opt.value)}
                      disabled={isUpdatingStatus}
                      className={`px-4 py-2 rounded-lg text-xs font-bold
                        uppercase tracking-widest transition-colors
                        disabled:opacity-50 ${t.btnGhost} ${t.subtext}`}
                    >
                      {isUpdatingStatus ? '...' : opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={`px-8 py-5 border-t ${t.border} flex gap-3`}>
              <button
                onClick={() => {
                  setAssignForm({
                    assignedTo: selected.assignedTo ?? '',
                    assignedToEmail: selected.assignedToEmail ?? '',
                  });
                  setShowAssign(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600
                  hover:bg-fuchsia-500 text-white rounded-lg text-sm font-bold
                  uppercase tracking-widest transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                {selected.assignedTo ? 'Reassign' : 'Assign Counsellor'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAssign(false)}
          />
          <div className={`relative rounded-2xl w-full max-w-md border p-8
            ${t.modal}`}>
            <button
              onClick={() => setShowAssign(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-lg
                transition-colors ${t.btnGhost}`}
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-lg mb-6">Assign Counsellor</h3>

            <div className="space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest
                  block mb-1.5 ${t.subtext}`}>
                  Counsellor / Pastor Name
                </label>
                <input
                  type="text"
                  value={assignForm.assignedTo}
                  onChange={e => setAssignForm(p => ({
                    ...p, assignedTo: e.target.value
                  }))}
                  placeholder="Pastor John Doe"
                  className={`w-full px-4 py-3 border rounded-xl text-sm
                    outline-none ${t.input}`}
                />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest
                  block mb-1.5 ${t.subtext}`}>
                  Counsellor Email
                </label>
                <input
                  type="email"
                  value={assignForm.assignedToEmail}
                  onChange={e => setAssignForm(p => ({
                    ...p, assignedToEmail: e.target.value
                  }))}
                  placeholder="pastor@globalflame.org"
                  className={`w-full px-4 py-3 border rounded-xl text-sm
                    outline-none ${t.input}`}
                />
              </div>
              <p className={`text-xs ${t.subtext}`}>
                The counsellor will receive an email with the full details of
                this request.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssign(false)}
                className={`flex-1 py-2.5 rounded-lg text-sm
                  transition-colors ${t.btnGhost}`}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={isAssigning}
                className="flex-1 py-2.5 rounded-lg bg-fuchsia-600
                  hover:bg-fuchsia-500 disabled:opacity-50 text-sm font-bold
                  text-white flex items-center justify-center gap-2"
              >
                {isAssigning
                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  : <Check className="w-3.5 h-3.5" />
                }
                Assign & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCounselling;