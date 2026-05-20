import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Home, Users, MessageSquare, HeartHandshake, Sparkles,
  TrendingUp, Heart, Library, RefreshCw, WifiOff, ServerCrash, ShieldAlert
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import type { DashboardStatsDto } from "../../types";
import { useAdminTheme } from "../../context/AdminThemeContext";

// ── ERROR TYPE ─────────────────────────────────────────────
type ErrorType = "network" | "auth" | "forbidden" | "server" | "unknown";

interface DashboardError {
  type: ErrorType;
  message: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isDark } = useAdminTheme();

  const [stats, setStats]         = useState<DashboardStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<DashboardError | null>(null);

  const [chartData] = useState([
    { day: "Mon", activity: 20 },
    { day: "Tue", activity: 35 },
    { day: "Wed", activity: 28 },
    { day: "Thu", activity: 50 },
    { day: "Fri", activity: 44 },
    { day: "Sat", activity: 60 },
    { day: "Sun", activity: 75 },
  ]);

  // ── FETCH STATS ────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminApi.getDashboardStats();
      if (res.data.isSuccess && res.data.data) {
        setStats(res.data.data);
      } else {
        setError({
          type: "unknown",
          message: res.data.message || "Failed to load dashboard stats.",
        });
      }
    } catch (err: unknown) {
      const isApiError = (value: unknown): value is {
        response?: { status?: number; data?: { message?: string } };
        request?: unknown;
      } => typeof value === 'object' && value !== null && ('response' in value || 'request' in value);

      if (isApiError(err) && err.response) {
        // Server responded with an error status
        switch (err.response.status) {
          case 401:
            setError({
              type: "auth",
              message: "Your session has expired. Please log in again.",
            });
            break;
          case 403:
            setError({
              type: "forbidden",
              message: "You do not have permission to view this dashboard.",
            });
            break;
          case 500:
            setError({
              type: "server",
              message: "A server error occurred. Please try again later.",
            });
            break;
          default:
            setError({
              type: "server",
              message:
                err.response.data?.message ||
                `Server error (${err.response.status}). Please try again.`,
            });
        }
      } else if (isApiError(err) && err.request) {
        // No response received — actual network/connection issue
        setError({
          type: "network",
          message:
            "Could not reach the server. Please check your connection and ensure the API is running.",
        });
      } else {
        setError({
          type: "unknown",
          message: "An unexpected error occurred. Please try again.",
        });
      }
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ── THEME CLASSES ──────────────────────────────────────────
  const t = {
    page:     isDark ? 'bg-[#0d0d0d] text-white'                : 'bg-gray-100 text-gray-900',
    card:     isDark ? 'bg-[#161616] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900',
    subtext:  isDark ? 'text-zinc-400'                          : 'text-gray-500',
    row:      isDark ? 'bg-white/5'                             : 'bg-gray-50',
    skeleton: isDark ? 'bg-white/10'                            : 'bg-gray-200',
    minicard: isDark ? 'bg-white/5 text-white'                  : 'bg-gray-50 text-gray-800',
  };

  // ── ERROR CONFIG ───────────────────────────────────────────
  const errorConfig: Record<ErrorType, {
    icon: React.ComponentType<{ size: number; className: string }>;
    title: string;
    action?: { label: string; onClick: () => void };
  }> = {
    network: {
      icon: WifiOff,
      title: "Connection Failed",
      action: { label: "Retry", onClick: fetchStats },
    },
    auth: {
      icon: ShieldAlert,
      title: "Session Expired",
      action: { label: "Log In Again", onClick: () => navigate("/login") },
    },
    forbidden: {
      icon: ShieldAlert,
      title: "Access Denied",
    },
    server: {
      icon: ServerCrash,
      title: "Server Error",
      action: { label: "Try Again", onClick: fetchStats },
    },
    unknown: {
      icon: ServerCrash,
      title: "Something Went Wrong",
      action: { label: "Try Again", onClick: fetchStats },
    },
  };

  // ── STAT CARD ──────────────────────────────────────────────
  const StatCard = ({
    icon: Icon, title, value, growth,
  }: {
    icon: React.ComponentType<{ className: string; size: number }>;
    title: string;
    value: number | undefined;
    growth: string;
  }) => (
    <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition ${t.card}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0 pr-3">
          <p className={`text-sm truncate ${t.subtext}`}>{title}</p>
          {isLoading ? (
            <div className={`h-8 w-20 animate-pulse rounded mt-1 ${t.skeleton}`} />
          ) : (
            <h2 className="text-2xl font-bold mt-1">{value ?? 0}</h2>
          )}
          <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
            <TrendingUp size={14} />
            <span className="truncate">{growth}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
          <Icon className="text-indigo-500" size={22} />
        </div>
      </div>
    </div>
  );

  // ── SIDE STAT ROW ──────────────────────────────────────────
  const SideStat = ({
    icon: Icon, label, value, color,
  }: {
    icon: React.ComponentType<{ className: string }>;
    label: string;
    value: number | undefined;
    color: string;
  }) => (
    <div className={`flex justify-between items-center p-3 sm:p-4 rounded-xl ${t.row}`}>
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`${color} shrink-0`} />
        <span className="font-medium text-sm truncate">{label}</span>
      </div>
      {isLoading ? (
        <div className={`h-6 w-10 animate-pulse rounded ${t.skeleton} shrink-0`} />
      ) : (
        <span className="text-xl font-bold shrink-0 ml-2">{value ?? 0}</span>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen p-4 sm:p-6 ${t.page}`}>

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className={`text-sm mt-0.5 ${t.subtext}`}>Monitor platform activity & engagement</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500
            text-white px-4 py-2.5 rounded-xl shadow transition text-sm font-semibold
            w-full sm:w-auto"
        >
          <Home size={18} />
          Back to Home
        </button>
      </div>

      {/* ── ERROR BANNER ──────────────────────────────────── */}
      {error && (() => {
        const cfg = errorConfig[error.type];
        const Icon = cfg.icon;
        return (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-4
            ${isDark
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0
              ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <Icon size={20} className={isDark ? 'text-red-400' : 'text-red-600'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{cfg.title}</p>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-red-400/80' : 'text-red-600/80'}`}>
                {error.message}
              </p>
            </div>
            {cfg.action && (
              <button
                onClick={cfg.action.onClick}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5
                  rounded-lg shrink-0 transition
                  ${isDark
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
              >
                <RefreshCw size={13} />
                {cfg.action.label}
              </button>
            )}
          </div>
        );
      })()}

      {/* ── KPI CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatCard icon={Users}         title="Total Users"       value={stats?.totalUsers}         growth="+12% this month"  />
        <StatCard icon={MessageSquare} title="Contacts"          value={stats?.totalContacts}       growth="+8% engagement"   />
        <StatCard icon={HeartHandshake} title="Prayer Requests"  value={stats?.totalPrayerRequests} growth="+5% increase"     />
        <StatCard icon={Sparkles}      title="Testimonies"       value={stats?.totalTestimonies}    growth="+18% growth"      />
      </div>

      {/* ── DONATIONS + BOOKS ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

        {/* DONATIONS */}
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition ${t.card}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <p className={`text-sm ${t.subtext}`}>Donations</p>
              {isLoading ? (
                <div className={`h-8 w-32 animate-pulse rounded mt-1 ${t.skeleton}`} />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold mt-1 break-all">
                  ₦{(stats?.totalAmountReceived ?? 0).toLocaleString()}
                </h2>
              )}
              <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
                <TrendingUp size={14} /> Total amount received
              </div>
            </div>
            <div className={`p-3 rounded-xl shrink-0 ${isDark ? 'bg-pink-500/10' : 'bg-pink-50'}`}>
              <Heart className="text-pink-500" size={22} />
            </div>
          </div>
          {!isLoading && stats && (
            <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
              <div className={`rounded-xl p-2 ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'}`}>
                <p className="text-lg font-bold">{stats.completedDonations}</p>
                <p className={t.subtext}>Completed</p>
              </div>
              <div className={`rounded-xl p-2 ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                <p className="text-lg font-bold">{stats.pendingDonations}</p>
                <p className={t.subtext}>Pending</p>
              </div>
            </div>
          )}
        </div>

        {/* BOOKS */}
        <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition ${t.card}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <p className={`text-sm ${t.subtext}`}>Books</p>
              {isLoading ? (
                <div className={`h-8 w-20 animate-pulse rounded mt-1 ${t.skeleton}`} />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold mt-1">{stats?.totalBooks ?? 0}</h2>
              )}
              <div className="flex items-center gap-1 text-green-500 text-xs mt-1">
                <TrendingUp size={14} /> Total in library
              </div>
            </div>
            <div className={`p-3 rounded-xl shrink-0 ${isDark ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
              <Library className="text-violet-500" size={22} />
            </div>
          </div>
          {!isLoading && stats && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
              {[
                { label: 'Published', value: stats.publishedBooks },
                { label: 'Drafts',    value: stats.draftBooks     },
                { label: 'Featured',  value: stats.featuredBooks  },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-2 ${t.minicard}`}>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className={`text-xs ${t.subtext}`}>{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CHART + SIDE PANEL ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* CHART */}
        <div className={`lg:col-span-2 border rounded-2xl shadow-sm p-4 sm:p-6 ${t.card}`}>
          <h2 className="text-base sm:text-lg font-semibold mb-4">Weekly Activity Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#ffffff10' : '#e5e7eb'}
              />
              <XAxis
                dataKey="day"
                stroke={isDark ? '#71717a' : '#9ca3af'}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke={isDark ? '#71717a' : '#9ca3af'}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background:   isDark ? '#161616' : '#fff',
                  border:       isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  color:        isDark ? '#fff' : '#111',
                }}
              />
              <Line
                type="monotone"
                dataKey="activity"
                stroke="#a21caf"
                strokeWidth={3}
                dot={{ fill: '#a21caf' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* SIDE STATS */}
        <div className={`border rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-3 ${t.card}`}>
          <h2 className="text-base sm:text-lg font-semibold">Live Statistics</h2>

          <SideStat icon={MessageSquare}  label="Contacts"        value={stats?.totalContacts}       color="text-indigo-500" />
          <SideStat icon={HeartHandshake} label="Prayer Requests" value={stats?.totalPrayerRequests} color="text-pink-500"   />
          <SideStat icon={Sparkles}       label="Testimonies"     value={stats?.totalTestimonies}    color="text-yellow-500" />
          <SideStat icon={Heart}          label="Donations"       value={stats?.completedDonations}  color="text-rose-500"   />
          <SideStat icon={Library}        label="Books"           value={stats?.totalBooks}          color="text-violet-500" />

          {!isLoading && stats && (
            <div className="grid grid-cols-2 gap-2 text-center text-xs mt-1">
              {[
                { label: 'Events',          value: stats.totalEvents           },
                { label: 'Sermons',         value: stats.totalSermons          },
                { label: 'Announcements',   value: stats.totalAnnouncements    },
                { label: 'Pending Prayers', value: stats.pendingPrayerRequests },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-2 ${t.minicard}`}>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className={`text-xs ${t.subtext}`}>{item.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className={`rounded-xl p-3 sm:p-4 mt-auto ${isDark ? 'bg-fuchsia-500/10' : 'bg-indigo-50'}`}>
            <p className={`font-semibold text-sm ${isDark ? 'text-fuchsia-400' : 'text-indigo-700'}`}>
              Platform Insight
            </p>
            <p className={`text-sm mt-2 ${t.subtext}`}>
              Community engagement is growing steadily. Prayer requests and
              testimonies indicate increasing participation this week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}