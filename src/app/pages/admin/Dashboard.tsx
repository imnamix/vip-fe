import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, IndianRupee, MessageSquare,
  Calendar, Truck, ArrowUpRight, FileDown, Hash,
  ClipboardList, Package, AlertCircle, Clock,
} from 'lucide-react';
import { getDashboardSummary } from '../../services/DashboardService';
import { usePermission } from '../../hooks/usePermission';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { downloadDashboardReport } from '../../utils/dashboardReport';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalEnquiries: number;
  pendingEnquiries: number;
  inProgressEnquiries: number;
  deliveredEnquiries: number;
  dispatchedEnquiries: number;
  cancelledEnquiries: number;
  totalEvents: number;
  totalVipNumbers: number;
  totalGeneralInquiries: number;
  pendingGeneralInquiries: number;
}

interface MonthlyPoint { month: string; year: number; enquiries: number; }
interface StatusPoint  { status: string; count: number; }
interface RecentEnquiry {
  id: number; name: string; mobile: string;
  status: string; inquiryType: string; created_at: string;
}

interface Summary {
  stats: DashboardStats;
  monthlyTrend: MonthlyPoint[];
  inquiryStatusBreakdown: StatusPoint[];
  recentEnquiries: RecentEnquiry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Same palette as the Inquiries listing page's status filter chips, so a status
// always maps to the same color everywhere in the admin.
const STATUS_COLORS: Record<string, string> = {
  'Pending':           '#FF9800',
  'Number Suggested':  '#2196F3',
  'Number Confirmed':  '#4CAF50',
  'Awaiting Payment':  '#FBC02D',
  'Paid':              '#009688',
  'Dispatched':        '#9C27B0',
  'Delivered':         '#388E3C',
  'Cancelled':         '#D32F2F',
  'In Progress':       '#3F51B5',
};
const statusColor = (s: string) => STATUS_COLORS[s] ?? '#9E9E9E';

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Delivered:     'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    'In Progress': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    Pending:       'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    Cancelled:     'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };
  return map[s] ?? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400';
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1a1d26] rounded-2xl p-5 border border-gray-100 dark:border-white/6 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5" />
        <div className="w-12 h-4 bg-gray-100 dark:bg-white/5 rounded" />
      </div>
      <div className="w-20 h-6 bg-gray-200 dark:bg-white/10 rounded mb-1" />
      <div className="w-28 h-3 bg-gray-100 dark:bg-white/5 rounded" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { can } = usePermission();
  const canViewInquiry = can('Inquiry', 'read');
  const isDark = useAdminTheme();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDashboardSummary();
      setSummary(res?.data ?? res);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const s = summary?.stats;

  const handleDownloadReport = async () => {
    if (!summary) return;
    setGeneratingReport(true);
    try {
      await downloadDashboardReport(summary);
    } finally {
      setGeneratingReport(false);
    }
  };

  const statCards = s ? [
    { label: 'Total Enquiries',    value: s.totalEnquiries,        icon: MessageSquare, color: '#D32F2F', bg: '#FFF8E1' },
    { label: 'Pending Enquiries',  value: s.pendingEnquiries,      icon: ClipboardList, color: '#FF9800', bg: '#FFF3E0' },
    { label: 'Delivered',          value: s.deliveredEnquiries,    icon: Truck,         color: '#4CAF50', bg: '#E8F5E9' },
    { label: 'Dispatched',         value: s.dispatchedEnquiries,   icon: Package,       color: '#9C27B0', bg: '#F3E5F5' },
    { label: 'Total Events',       value: s.totalEvents,           icon: Calendar,      color: '#2196F3', bg: '#E3F2FD' },
    { label: 'VIP Numbers',        value: s.totalVipNumbers,       icon: Hash,          color: '#607D8B', bg: '#ECEFF1' },
    { label: 'General Inquiries',  value: s.totalGeneralInquiries, icon: IndianRupee,   color: '#009688', bg: '#E0F2F1' },
    { label: 'In Progress',        value: s.inProgressEnquiries,   icon: Clock,         color: '#FBC02D', bg: '#FFFDE7' },
  ] : [];

  const trendData: MonthlyPoint[] = summary?.monthlyTrend ?? [];

  const pieData = (summary?.inquiryStatusBreakdown ?? []).map(d => ({
    name:  d.status,
    value: d.count,
    color: statusColor(d.status),
  }));

  /* Recharts renders its own SVG/inline styles, so theme-dependent colors are computed here */
  const chartGrid   = isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
  const chartTick   = isDark ? '#9CA3AF' : '#616161';
  const tooltipStyle = {
    borderRadius: '12px',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
    fontSize: '12px',
    background: isDark ? '#1e2133' : '#fff',
    color: isDark ? '#fff' : '#212121',
  };
  const pieTooltipStyle = { ...tooltipStyle, borderRadius: '8px' };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-[#616161] dark:text-gray-400 text-sm">Welcome back. Here's what's happening today.</p>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={loading || !summary || generatingReport}
          className="flex items-center gap-1.5 text-sm text-[#616161] dark:text-gray-400 hover:text-[#D32F2F] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 disabled:opacity-50"
        >
          <FileDown size={13} className={generatingReport ? 'animate-pulse' : ''} />
          {generatingReport ? 'Generating…' : 'Report'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
          {error}
          <button onClick={fetchSummary} className="text-[#D32F2F] font-semibold ml-4 hover:underline">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map(sc => {
              const Icon = sc.icon;
              return (
                <div key={sc.label} className="bg-white dark:bg-[#1a1d26] rounded-2xl p-5 border border-gray-100 dark:border-white/6 hover:shadow-md dark:hover:shadow-black/30 transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: isDark ? `${sc.color}26` : sc.bg }}>
                      <Icon size={18} style={{ color: sc.color }} />
                    </div>
                    <ArrowUpRight size={14} className="text-green-500 dark:text-green-400 mt-0.5" />
                  </div>
                  <div className="text-xl font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {sc.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">{sc.label}</div>
                </div>
              );
            })
        }
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Monthly Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1d26] rounded-2xl p-6 border border-gray-100 dark:border-white/6">
          <h3 className="font-bold text-[#212121] dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Monthly Enquiry Trend
          </h3>
          {loading ? (
            <div className="h-[260px] bg-gray-50 dark:bg-white/5 rounded-xl animate-pulse" />
          ) : trendData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-[#616161] dark:text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="enqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#D32F2F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D32F2F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTick }} />
                <YAxis tick={{ fontSize: 11, fill: chartTick }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: isDark ? '#fff' : '#212121' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: chartTick }} />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  name="Enquiries"
                  stroke="#D32F2F"
                  fill="url(#enqGrad)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Enquiry Status Pie */}
        <div className="bg-white dark:bg-[#1a1d26] rounded-2xl p-6 border border-gray-100 dark:border-white/6">
          <h3 className="font-bold text-[#212121] dark:text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Enquiry Status
          </h3>
          {loading ? (
            <div className="h-[180px] bg-gray-50 dark:bg-white/5 rounded-xl animate-pulse mb-4" />
          ) : pieData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-[#616161] dark:text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3} stroke={isDark ? '#1a1d26' : '#fff'}>
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={pieTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-2 mt-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between animate-pulse">
                    <div className="w-24 h-3 bg-gray-100 dark:bg-white/5 rounded" />
                    <div className="w-10 h-3 bg-gray-100 dark:bg-white/5 rounded" />
                  </div>
                ))
              : pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-[#616161] dark:text-gray-400">{d.name}</span>
                    </div>
                    <span className="font-semibold text-[#212121] dark:text-white">{d.value.toLocaleString()}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white dark:bg-[#1a1d26] rounded-2xl p-6 border border-gray-100 dark:border-white/6">
        <h3 className="font-bold text-[#212121] dark:text-white mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Recent Enquiries
        </h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-32 h-3 bg-gray-100 dark:bg-white/5 rounded" />
                  <div className="w-24 h-2.5 bg-gray-50 dark:bg-white/5 rounded" />
                </div>
                <div className="w-16 h-5 bg-gray-100 dark:bg-white/5 rounded-full" />
                <div className="w-14 h-3 bg-gray-50 dark:bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (summary?.recentEnquiries ?? []).length === 0 ? (
          <p className="text-[#616161] dark:text-gray-400 text-sm text-center py-8">No recent enquiries</p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {(summary?.recentEnquiries ?? []).map(enq => (
              <div
                key={enq.id}
                onClick={canViewInquiry ? () => navigate(`/admin/inquiries/${enq.id}`) : undefined}
                className={`flex items-center gap-3 py-3 ${canViewInquiry ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 -mx-2 px-2 rounded-lg' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#D32F2F]">
                    {(enq.name ?? '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#212121] dark:text-white truncate">{enq.name}</p>
                  <p className="text-xs text-[#616161] dark:text-gray-400">{enq.mobile} · {enq.inquiryType ?? 'enquiry'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusBadge(enq.status)}`}>
                  {enq.status}
                </span>
                <span className="text-xs text-[#9E9E9E] dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                  {timeAgo(enq.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick derived stats */}
      {!loading && s && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl p-5 border border-gray-100 dark:border-white/6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-[#D32F2F]" />
              <span className="text-xs font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider">Delivery Rate</span>
            </div>
            <div className="text-2xl font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {s.totalEnquiries > 0
                ? `${Math.round((s.deliveredEnquiries / s.totalEnquiries) * 100)}%`
                : '—'}
            </div>
            <p className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">of all enquiries delivered</p>
          </div>

          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl p-5 border border-gray-100 dark:border-white/6">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={14} className="text-[#FF9800]" />
              <span className="text-xs font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider">General Pending</span>
            </div>
            <div className="text-2xl font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {s.totalGeneralInquiries > 0
                ? `${Math.round((s.pendingGeneralInquiries / s.totalGeneralInquiries) * 100)}%`
                : '—'}
            </div>
            <p className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">general inquiries awaiting reply</p>
          </div>

          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl p-5 border border-gray-100 dark:border-white/6 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-[#9C27B0]" />
              <span className="text-xs font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider">Inquiry Pending</span>
            </div>
            <div className="text-2xl font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {s.totalEnquiries > 0
                ? `${Math.round((s.pendingEnquiries / s.totalEnquiries) * 100)}%`
                : '—'}
            </div>
            <p className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">of all enquiries still pending</p>
          </div>
        </div>
      )}
    </div>
  );
}
