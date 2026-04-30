import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, Clock, RefreshCw, Search, Filter,
  Users, CheckCircle, XCircle, X,
  Calendar, Trash2, AlertCircle
} from 'lucide-react';
import { bulkEmailApi } from '../../api/bulkEmailApi';
import type {
  BulkEmailResponseDto,
  BulkEmailStatsDto,
  SendBulkEmailDto,
} from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TARGET_GROUPS = ['All', 'Ministry', 'Youth', 'Custom'] as const;
type TargetGroup = typeof TARGET_GROUPS[number];

const STATUS_FILTERS = ['', 'Sent', 'Scheduled', 'Sending', 'Failed', 'Cancelled'];

const emptyForm = (): SendBulkEmailDto => ({
  subject:     '',
  htmlBody:    '',
  targetGroup: 'All',
  customEmails: '',
  scheduledAt: null,
});

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const AdminBulkEmail = () => {
  const { isDark } = useAdminTheme();

  // ── THEME ──────────────────────────────────────────────────────────────────
  const t = {
    bg:         isDark ? 'bg-[#0d0d0d] text-white'              : 'bg-slate-50 text-slate-900',
    border:     isDark ? 'border-white/5'                        : 'border-slate-200',
    subtext:    isDark ? 'text-zinc-400'                         : 'text-slate-500',
    mutedtext:  isDark ? 'text-zinc-600'                         : 'text-slate-400',
    input: isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-fuchsia-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    card:       isDark ? 'bg-white/5 border-white/10'            : 'bg-white border-slate-200',
    row:        isDark ? 'bg-white/3 hover:bg-white/5 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200',
    btnGhost:   isDark ? 'bg-white/5 hover:bg-white/10'          : 'bg-slate-100 hover:bg-slate-200',
    modal:      isDark ? 'bg-[#161616] border-white/10 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900',
    modalInput: isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-fuchsia-500'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500',
    label:      isDark ? 'text-zinc-400'                         : 'text-slate-600',
    skeleton:   isDark ? 'bg-white/5'                            : 'bg-slate-200',
  };

  // ── STATE ──────────────────────────────────────────────────────────────────
  const [history, setHistory]           = useState<BulkEmailResponseDto[]>([]);
  const [stats, setStats]               = useState<BulkEmailStatsDto | null>(null);
  const [totalCount, setTotalCount]     = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingStats, setIsLoadingStats]     = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pageNumber, setPageNumber]     = useState(1);
  const pageSize = 10;

  // Compose modal
  const [showCompose, setShowCompose]   = useState(false);
  const [form, setForm]                 = useState<SendBulkEmailDto>(emptyForm());
  const [isScheduled, setIsScheduled]   = useState(false);
  const [isSending, setIsSending]       = useState(false);
  const [charCount, setCharCount]       = useState(0);

  // Delete confirm
  const [cancelTarget, setCancelTarget] = useState<BulkEmailResponseDto | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Preview modal
  const [previewOpen, setPreviewOpen]   = useState(false);

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await bulkEmailApi.getHistory({
        subject:    search || undefined,
        status:     filterStatus || undefined,
        pageNumber,
        pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setHistory(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch {
      toast.error('Failed to load email history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [search, filterStatus, pageNumber]);

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await bulkEmailApi.getStats();
      if (res.data.isSuccess && res.data.data) {
        setStats(res.data.data);
      }
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { fetchStats();   }, [fetchStats]);
  useEffect(() => { setPageNumber(1); }, [search, filterStatus]);

  // ── SEND / SCHEDULE ────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!form.subject.trim()) { toast.error('Subject is required');      return; }
    if (!form.htmlBody.trim()) { toast.error('Message body is required'); return; }
    if (form.targetGroup === 'Custom' && !form.customEmails?.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }
    if (isScheduled && !form.scheduledAt) {
      toast.error('Please select a scheduled date and time');
      return;
    }

    setIsSending(true);
    try {
      if (isScheduled) {
        const res = await bulkEmailApi.schedule(form);
        if (res.data.isSuccess) {
          toast.success('Email scheduled successfully');
          setShowCompose(false);
          setForm(emptyForm());
          setIsScheduled(false);
          fetchHistory();
          fetchStats();
        }
      } else {
        const res = await bulkEmailApi.sendNow({ ...form, scheduledAt: null });
        if (res.data.isSuccess) {
          toast.success('Email is being sent to recipients');
          setShowCompose(false);
          setForm(emptyForm());
          fetchHistory();
          fetchStats();
        }
      }
    } catch {
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  // ── CANCEL SCHEDULED ───────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await bulkEmailApi.cancel(cancelTarget.id);
      setHistory(prev => prev.filter(e => e.id !== cancelTarget.id));
      setTotalCount(n => n - 1);
      setCancelTarget(null);
      toast.success('Scheduled email cancelled');
      fetchStats();
    } catch {
      toast.error('Failed to cancel email');
    } finally {
      setIsCancelling(false);
    }
  };

  // ── HELPERS ────────────────────────────────────────────────────────────────
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Sent':       return 'bg-emerald-500/20 text-emerald-600';
      case 'Scheduled':  return 'bg-blue-500/20 text-blue-600';
      case 'Sending':    return 'bg-amber-500/20 text-amber-600';
      case 'Failed':     return 'bg-red-500/20 text-red-500';
      case 'Cancelled':  return 'bg-slate-500/20 text-slate-500';
      default:           return 'bg-slate-200 text-slate-500';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className={`px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-bold">Bulk Email</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{totalCount} total</span>
          <button
            onClick={() => { fetchHistory(); fetchStats(); }}
            className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}
          >
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
          <button
            onClick={() => { setShowCompose(true); setForm(emptyForm()); setIsScheduled(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500
              rounded-lg text-sm font-bold uppercase tracking-widest transition-colors text-white"
          >
            <Mail className="w-4 h-4" /> Compose
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ─────────────────────────────────────────────────── */}
      <div className="px-8 pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        {[
          {
            icon: <Send className="w-4 h-4 text-fuchsia-500" />,
            bg:   isDark ? 'bg-fuchsia-500/10' : 'bg-fuchsia-50',
            label: 'Emails Sent',
            value: isLoadingStats ? null : stats?.totalEmailsSent ?? 0,
          },
          {
            icon: <Users className="w-4 h-4 text-blue-500" />,
            bg:   isDark ? 'bg-blue-500/10' : 'bg-blue-50',
            label: 'Recipients Reached',
            value: isLoadingStats ? null : stats?.totalRecipientsReached ?? 0,
          },
          {
            icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
            bg:   isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
            label: 'Success Rate',
            value: isLoadingStats ? null : `${stats?.successRate ?? 0}%`,
          },
          {
            icon: <Clock className="w-4 h-4 text-amber-500" />,
            bg:   isDark ? 'bg-amber-500/10' : 'bg-amber-50',
            label: 'Scheduled',
            value: isLoadingStats ? null : stats?.totalScheduled ?? 0,
          },
        ].map((card, i) => (
          <div key={i} className={`border rounded-2xl p-5 ${t.card}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${card.bg}`}>{card.icon}</div>
              <span className={`text-xs font-bold uppercase tracking-widest ${t.subtext}`}>
                {card.label}
              </span>
            </div>
            {card.value === null ? (
              <div className={`h-7 w-20 rounded animate-pulse ${t.skeleton}`} />
            ) : (
              <p className="text-2xl font-black">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── FILTERS ─────────────────────────────────────────────────────── */}
      <div className={`px-8 py-4 border-b ${t.border} flex flex-wrap gap-3`}>
        <div className="relative flex-1 min-w-48">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <input
            type="text"
            placeholder="Search by subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${t.input}`}
          />
        </div>
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={`pl-9 pr-8 py-2.5 border rounded-lg text-sm outline-none
              appearance-none cursor-pointer ${t.input}`}
          >
            {STATUS_FILTERS.map(s => (
              <option key={s} value={s}>{s || 'All Statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── HISTORY LIST ────────────────────────────────────────────────── */}
      <div className="px-8 py-6">
        {isLoadingHistory ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`animate-pulse h-20 rounded-xl ${t.skeleton}`} />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Mail className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
            <p className={t.subtext}>No emails sent yet</p>
            <button
              onClick={() => setShowCompose(true)}
              className="mt-4 text-fuchsia-600 text-sm font-bold uppercase tracking-widest"
            >
              Compose your first email
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map(email => (
              <div
                key={email.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${t.row}`}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  isDark ? 'bg-fuchsia-500/10' : 'bg-fuchsia-50'
                }`}>
                  <Mail className="w-4 h-4 text-fuchsia-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm truncate">{email.subject}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5
                      rounded-full ${statusBadge(email.status)}`}>
                      {email.status}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5
                      rounded-full ${isDark
                        ? 'bg-white/10 text-zinc-400'
                        : 'bg-slate-100 text-slate-500'}`}>
                      {email.targetGroup}
                    </span>
                  </div>
                  <div className={`flex items-center gap-4 text-xs ${t.subtext} flex-wrap`}>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {email.totalRecipients} recipients
                    </span>
                    {email.successCount > 0 && (
                      <>
                        <span className={t.mutedtext}>·</span>
                        <span className="text-emerald-500 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {email.successCount} delivered
                        </span>
                      </>
                    )}
                    {email.failedCount > 0 && (
                      <>
                        <span className={t.mutedtext}>·</span>
                        <span className="text-red-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {email.failedCount} failed
                        </span>
                      </>
                    )}
                    <span className={t.mutedtext}>·</span>
                    <span>
                      {email.sentAt
                        ? `Sent ${formatDate(email.sentAt)}`
                        : email.scheduledAt
                          ? `Scheduled for ${formatDate(email.scheduledAt)}`
                          : formatDate(email.createdOn)
                      }
                    </span>
                    {email.createdByName && (
                      <>
                        <span className={t.mutedtext}>·</span>
                        <span>by {email.createdByName}</span>
                      </>
                    )}
                  </div>
                  {email.errorMessage && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {email.errorMessage}
                    </p>
                  )}
                </div>

                {/* Cancel button — only for scheduled */}
                {email.status === 'Scheduled' && (
                  <button
                    onClick={() => setCancelTarget(email)}
                    className={`p-2 rounded-lg transition-colors shrink-0
                      ${t.btnGhost} hover:bg-red-500/20`}
                    title="Cancel scheduled email"
                  >
                    <Trash2 className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className={`text-xs ${t.mutedtext}`}>
              Page {pageNumber} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs
                  transition-colors ${t.btnGhost}`}
              >
                Prev
              </button>
              <button
                onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                disabled={pageNumber === totalPages}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs
                  transition-colors ${t.btnGhost}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── COMPOSE MODAL ───────────────────────────────────────────────── */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCompose(false)}
          />
          <div className={`relative rounded-2xl w-full max-w-2xl shadow-2xl
            max-h-[90vh] overflow-y-auto border ${t.modal}`}>

            {/* Modal header */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b
                ${t.border} sticky top-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}
            >
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-fuchsia-500" />
                Compose Email
              </h3>
              <button
                onClick={() => setShowCompose(false)}
                className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Subject */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest
                  mb-1.5 block ${t.label}`}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Sunday Service Reminder"
                  className={`w-full px-4 py-3 border rounded-xl text-sm
                    outline-none ${t.modalInput}`}
                />
              </div>

              {/* Target Group */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest
                  mb-1.5 block ${t.label}`}>
                  Send To *
                </label>
                <div className="relative flex bg-slate-100 rounded-2xl p-1"
                  style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                  <div
                    className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm
                      border border-gray-200 transition-all duration-300"
                    style={{
                      width:     `calc(${100 / TARGET_GROUPS.length}% - 4px)`,
                      transform: `translateX(calc(${
                        TARGET_GROUPS.indexOf(
                          form.targetGroup as TargetGroup) * 100}% + ${
                        TARGET_GROUPS.indexOf(
                          form.targetGroup as TargetGroup) * 4}px))`,
                      background: isDark ? '#2a2a2a' : 'white',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    }}
                  />
                  {TARGET_GROUPS.map(group => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, targetGroup: group }))}
                      className={`relative z-10 flex-1 py-2.5 text-xs font-semibold
                        rounded-xl transition-colors duration-300
                        ${form.targetGroup === group
                          ? isDark ? 'text-white' : 'text-slate-900'
                          : isDark ? 'text-zinc-500' : 'text-slate-400'
                        }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom emails — only when Custom is selected */}
              {form.targetGroup === 'Custom' && (
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest
                    mb-1.5 block ${t.label}`}>
                    Email Addresses *
                  </label>
                  <textarea
                    rows={3}
                    value={form.customEmails}
                    onChange={e =>
                      setForm(p => ({ ...p, customEmails: e.target.value }))}
                    placeholder="Paste comma-separated emails e.g. john@example.com, jane@example.com"
                    className={`w-full px-4 py-3 border rounded-xl text-sm
                      outline-none resize-none ${t.modalInput}`}
                  />
                  <p className={`text-xs mt-1 ${t.label}`}>
                    Separate multiple emails with commas
                  </p>
                </div>
              )}

              {/* Message body */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-xs font-bold uppercase tracking-widest ${t.label}`}>
                    Message *
                  </label>
                  <span className={`text-xs ${
                    charCount > 5000 ? 'text-red-500' : t.label
                  }`}>
                    {charCount} characters
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={form.htmlBody}
                  onChange={e => {
                    setForm(p => ({ ...p, htmlBody: e.target.value }));
                    setCharCount(e.target.value.length);
                  }}
                  placeholder="Write your message here. Line breaks will be preserved in the email."
                  className={`w-full px-4 py-3 border rounded-xl text-sm
                    outline-none resize-none ${t.modalInput}`}
                />
                <p className={`text-xs mt-1 ${t.label}`}>
                  Your message will be wrapped in the GFM branded email template automatically.
                </p>
              </div>

              {/* Schedule toggle */}
              <div>
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsScheduled(p => !p)}
                >
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    isScheduled ? 'bg-fuchsia-600' : isDark ? 'bg-white/10' : 'bg-slate-200'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full mt-0.5
                      transition-transform ${
                      isScheduled ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                  <span className={`text-sm flex items-center gap-2 ${t.subtext}`}>
                    <Calendar className="w-4 h-4 text-fuchsia-500" />
                    Schedule for later
                  </span>
                </div>

                {isScheduled && (
                  <div className="mt-3">
                    <label className={`text-xs font-bold uppercase tracking-widest
                      mb-1.5 block ${t.label}`}>
                      Send Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={form.scheduledAt ?? ''}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                      onChange={e =>
                        setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-xl text-sm
                        outline-none ${t.modalInput}`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div
                className={`px-6 py-4 border-t ${t.border} flex gap-3
                    justify-end sticky bottom-0 z-10`}
                style={{ background: isDark ? '#161616' : 'white' }}>

                {/* Cancel */}
                <button
                    onClick={() => setShowCompose(false)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${t.btnGhost}`}>
                        Cancel
                </button>

                {/* Preview Button */}
                <button
                    onClick={() => setPreviewOpen(true)} // Opens preview modal
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${t.btnGhost}`}>
                    Preview
                </button>

                {/* Send */}
                <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500
                    disabled:opacity-50 text-sm font-bold text-white
                    flex items-center gap-2">
                    {isSending && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    )}
                    {isScheduled
                    ? <><Clock className="w-3.5 h-3.5" /> Schedule Email</>
                    : <><Send className="w-3.5 h-3.5" /> Send Now</>
                    }
                </button>
                </div>
            </div>
        </div>
      )}

      {/* ── CANCEL CONFIRM MODAL ────────────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setCancelTarget(null)}
          />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm
            text-center border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Cancel scheduled email?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>
              "{cancelTarget.subject}" will be cancelled and not sent.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className={`flex-1 py-2.5 rounded-lg text-sm
                  transition-colors ${t.btnGhost}`}
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600
                  disabled:opacity-50 text-sm font-bold text-white
                  flex items-center justify-center gap-2"
              >
                {isCancelling && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                )}
                Cancel Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ───────────────────────────────────────────── */}
        {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

            {/* Overlay */}
            <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)} // Close when clicking outside
            />

            {/* Modal Container */}
            <div className={`relative rounded-2xl w-full max-w-2xl shadow-2xl border ${t.modal}`}>

            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border}`}>
                <h3 className="font-bold text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-fuchsia-500" />
                Email Preview
                </h3>

                <button
                onClick={() => setPreviewOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}
                >
                <X className="w-4 h-4" />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

                {/* Subject */}
                <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${t.label}`}>
                    Subject
                </p>
                <h2 className="text-xl font-bold mt-1">
                    {form.subject || 'No Subject'}
                </h2>
                </div>

                {/* Divider */}
                <div className={`border-t ${t.border}`} />

                {/* Simulated Email Card */}
                <div className={`rounded-xl p-5 ${
                isDark ? 'bg-white/5' : 'bg-white shadow'
                }`}>

                {/* Email Content */}
                <div
                    className="prose max-w-none text-sm"
                    dangerouslySetInnerHTML={{
                    __html: form.htmlBody || '<p>No content</p>'
                    }}
                />

                </div>

            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${t.border} flex justify-end`}>
                <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500
                    text-white text-sm font-bold"
                >
                Close Preview
                </button>
            </div>

            </div>
        </div>
        )}
    </div>
  );
};

export default AdminBulkEmail;