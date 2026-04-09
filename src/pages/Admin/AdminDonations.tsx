import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Search, Filter, Heart,
  TrendingUp, DollarSign, Clock
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { DonationResponseDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';

const STATUS_OPTIONS   = ['', 'Completed', 'Pending', 'Failed'];
const METHOD_OPTIONS   = ['', 'Paystack', 'Flutterwave'];
const CURRENCY_OPTIONS = ['', 'NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES'];

const DONATION_TYPES = [
  '', 'Tithe & Offering', 'Building Projects',
  'Children Ministry', 'Global & Community Outreach', 'Event', 'General'
];

const AdminDonations = () => {
  const { isDark } = useAdminTheme();

  const t = {
    bg:        isDark ? 'bg-[#0d0d0d] text-white'     : 'bg-slate-50 text-slate-900',
    border:    isDark ? 'border-white/5'               : 'border-slate-200',
    subtext:   isDark ? 'text-zinc-400'                : 'text-slate-500',
    mutedtext: isDark ? 'text-zinc-600'                : 'text-slate-400',
    input: isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-fuchsia-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    row:       isDark ? 'bg-white/3 hover:bg-white/5 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200',
    btnGhost:  isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
    skeleton:  isDark ? 'bg-white/3'   : 'bg-slate-200',
    card:      isDark ? 'bg-white/5 border-white/10'   : 'bg-white border-slate-200',
  };

  const [donations, setDonations]     = useState<DonationResponseDto[]>([]);
  const [totalCount, setTotalCount]   = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterMethod, setFilterMethod]     = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterType, setFilterType]         = useState('');
  const [pageNumber, setPageNumber]   = useState(1);
  const pageSize = 10;

  const [summary, setSummary] = useState({
    totalAmountReceived: 0,
    completedDonations: 0,
    pendingDonations: 0,
  });

  const fetchDonations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getDonations({
        donorName:     search || undefined,
        status:        filterStatus   || undefined,
        paymentMethod: filterMethod   || undefined,
        currency:      filterCurrency || undefined,
        donationType:  filterType     || undefined,
        pageNumber,
        pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        const payload = res.data.data as unknown as {
          items: DonationResponseDto[];
          totalCount: number;
          pageNumber: number;
          pageSize: number;
          summary?: typeof summary;
        };
        setDonations(payload.items ?? []);
        setTotalCount(payload.totalCount ?? 0);
      }
    } catch { toast.error('Failed to load donations'); }
    finally { setIsLoading(false); }
  }, [search, filterStatus, filterMethod, filterCurrency, filterType, pageNumber]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await adminApi.getDashboardStats();
        if (res.data.isSuccess && res.data.data) {
          setSummary({
            totalAmountReceived: res.data.data.totalAmountReceived,
            completedDonations:  res.data.data.completedDonations,
            pendingDonations:    res.data.data.pendingDonations,
          });
        }
      } catch { /* silent */ }
    };
    fetchSummary();
  }, []);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);
  useEffect(() => { setPageNumber(1); }, [search, filterStatus, filterMethod, filterCurrency, filterType]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/20 text-emerald-600';
      case 'Pending':   return 'bg-amber-500/20 text-amber-600';
      case 'Failed':    return 'bg-red-500/20 text-red-500';
      default:          return 'bg-slate-200 text-slate-500';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      {/* Header */}
      <div className={`px-4 sm:px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Donations</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{totalCount} total</span>
          <button onClick={fetchDonations} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 sm:px-8 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <div className={`border rounded-2xl p-5 ${t.card}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${t.subtext}`}>Total Received</span>
          </div>
          <p className="text-2xl font-black">₦{summary.totalAmountReceived.toLocaleString()}</p>
        </div>
        <div className={`border rounded-2xl p-5 ${t.card}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-fuchsia-500/10 rounded-lg">
              <DollarSign className="w-4 h-4 text-fuchsia-600" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${t.subtext}`}>Completed</span>
          </div>
          <p className="text-2xl font-black">{summary.completedDonations}</p>
        </div>
        <div className={`border rounded-2xl p-5 ${t.card}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${t.subtext}`}>Pending</span>
          </div>
          <p className="text-2xl font-black">{summary.pendingDonations}</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`px-4 sm:px-8 py-4 border-b ${t.border} flex flex-wrap gap-3`}>
        <div className="relative flex-1 min-w-48">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <input
            type="text"
            placeholder="Search by donor name..."
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
            className={`pl-9 pr-8 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s || 'All Statuses'}</option>
            ))}
          </select>
        </div>
        <select
          value={filterMethod}
          onChange={e => setFilterMethod(e.target.value)}
          className={`px-4 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}
        >
          {METHOD_OPTIONS.map(m => (
            <option key={m} value={m}>{m || 'All Methods'}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className={`px-4 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}
        >
          {DONATION_TYPES.map(d => (
            <option key={d} value={d}>{d || 'All Types'}</option>
          ))}
        </select>
        <select
          value={filterCurrency}
          onChange={e => setFilterCurrency(e.target.value)}
          className={`px-4 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}
        >
          {CURRENCY_OPTIONS.map(c => (
            <option key={c} value={c}>{c || 'All Currencies'}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="px-4 sm:px-8 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`animate-pulse h-20 rounded-xl ${t.skeleton}`} />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
            <p className={t.subtext}>No donations found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {donations.map(d => (
              <div
                key={d.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all ${t.row}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-fuchsia-100 text-fuchsia-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {d.donorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-sm">{d.donorName}</p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadge(d.status)}`}>
                            {d.status}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            {d.paymentMethod}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${t.subtext}`}>{d.donorEmail}</p>
                      </div>
                      <p className={`font-black text-base sm:text-lg shrink-0 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {d.currency} {d.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs mt-1.5 ${t.mutedtext}`}>
                      <span>{d.donationType}</span>
                      <span>·</span>
                      <span>{formatDate(d.createdAt)}</span>
                    </div>
                    {d.transactionReference && (
                      <p className={`text-[10px] mt-1 font-mono truncate ${t.mutedtext}`}>
                        {d.transactionReference}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className={`text-xs ${t.mutedtext}`}>Page {pageNumber} of {totalPages}</span>
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
    </div>
  );
};

export default AdminDonations;