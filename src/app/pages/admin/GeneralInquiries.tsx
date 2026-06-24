import { useState, useEffect, useRef } from 'react';
import {
  Search, Eye, Trash2, X, RefreshCw, ChevronLeft, ChevronRight,
  MessageSquarePlus, Clock, CheckCircle, Calendar,
} from 'lucide-react';
import {
  getAllGeneralInquiries,
  deleteGeneralInquiries,
  updateGeneralInquiry,
} from '../../services/GeneralInquiryService';

const LIMIT = 10;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Pending:   { bg: 'bg-orange-50', text: 'text-orange-600' },
  Resolved:  { bg: 'bg-green-50',  text: 'text-green-600'  },
  Closed:    { bg: 'bg-gray-100',  text: 'text-gray-500'   },
};

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  pages.push(1);
  if (left > 2)          pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── View Popup ─────────────────────────────────────────────────────────── */
function ViewPopup({ inquiry, onClose, onStatusUpdate }: {
  inquiry: any;
  onClose: () => void;
  onStatusUpdate: (id: number, status: string) => Promise<void>;
}) {
  const [currentStatus, setCurrentStatus] = useState<string>(inquiry.status || 'Pending');
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status: string) => {
    if (status === currentStatus) return;
    setUpdating(true);
    try {
      await onStatusUpdate(inquiry.id, status);
      setCurrentStatus(status);
    } finally {
      setUpdating(false);
    }
  };

  const sc = STATUS_COLORS[currentStatus] ?? STATUS_COLORS['Pending'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1e2133] rounded-2xl w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h2 className="text-base font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Inquiry Details
            </h2>
            <p className="text-xs text-[#9E9E9E] mt-0.5">#{inquiry.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
          >
            <X size={15} className="text-[#616161] dark:text-gray-300" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {(inquiry.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-[#212121] dark:text-white">{inquiry.name || '—'}</div>
              <div className="text-sm text-[#616161] dark:text-gray-400">{inquiry.mobile || '—'}</div>
            </div>
          </div>

          <div className="space-y-3">
            <Row label="Looking For" value={inquiry.lookingFor || '—'} />
            <Row label="Message"     value={inquiry.message    || '—'} multiline />
            <Row
              label="Status"
              value={
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sc.bg} ${sc.text}`}>
                  {currentStatus}
                </span>
              }
            />
            <Row label="Submitted"   value={formatDate(inquiry.created_at)} />
          </div>

          {/* Status update */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/10">
            <p className="text-xs font-semibold text-[#9E9E9E] dark:text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
            <div className="flex gap-2">
              {(['Pending', 'Resolved'] as const).map(s => (
                <button
                  key={s}
                  disabled={updating || currentStatus === s}
                  onClick={() => handleStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                    currentStatus === s
                      ? s === 'Pending'
                        ? 'bg-orange-100 text-orange-600 border-2 border-orange-400'
                        : 'bg-green-100 text-green-600 border-2 border-green-500'
                      : 'border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {updating && currentStatus !== s ? 'Updating…' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-[#616161] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: React.ReactNode; multiline?: boolean }) {
  return (
    <div className={`flex ${multiline ? 'flex-col gap-1' : 'items-start justify-between gap-4'}`}>
      <span className="text-xs font-semibold text-[#9E9E9E] dark:text-gray-500 uppercase tracking-wider flex-shrink-0">{label}</span>
      <span className={`text-sm text-[#212121] dark:text-gray-200 ${multiline ? '' : 'text-right'}`}>{value}</span>
    </div>
  );
}

/* ── Delete Confirmation ─────────────────────────────────────────────────── */
function DeleteConfirm({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white dark:bg-[#1e2133] rounded-2xl w-full max-w-sm shadow-xl p-6" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-[#D32F2F]" />
        </div>
        <h3 className="text-center font-bold text-[#212121] dark:text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Delete Inquiry?
        </h3>
        <p className="text-center text-sm text-[#616161] dark:text-gray-400 mb-6">
          This will permanently delete <span className="font-semibold">{name}</span>'s inquiry. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-[#616161] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] disabled:opacity-60 transition-colors"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function GeneralInquiries() {
  const [rows,        setRows]        = useState<any[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState('');
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [viewItem,    setViewItem]    = useState<any | null>(null);
  const [deleteItem,  setDeleteItem]  = useState<any | null>(null);
  const [deleting,    setDeleting]    = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [stats, setStats] = useState({ total: 0, pending: 0, today: 0 });

  const fetchData = async (p: number, q: string) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getAllGeneralInquiries(p, LIMIT, q || undefined);
      const data: any[] = res?.data ?? [];
      const count: number = res?.count ?? 0;
      setRows(data);
      setTotal(count);

      // compute stats from full first-page context when on page 1 with no search
      if (p === 1 && !q) {
        const todayStr = new Date().toDateString();
        const pendingCount = data.filter((r: any) => r.status === 'Pending').length;
        const todayCount   = data.filter((r: any) => new Date(r.created_at).toDateString() === todayStr).length;
        setStats({ total: count, pending: pendingCount, today: todayCount });
      }
    } catch {
      setFetchError('Failed to load inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(1, ''); }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    await updateGeneralInquiry(id, { status });
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchData(1, q); }, 350);
  };

  const handlePage = (p: number) => { setPage(p); fetchData(p, search); };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await deleteGeneralInquiries([deleteItem.id]);
      setDeleteItem(null);
      fetchData(page, search);
    } catch {
      // keep modal open, user can retry
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const statCards = [
    {
      label: 'Total Enquiries',
      value: stats.total,
      icon: MessageSquarePlus,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-500',
    },
    {
      label: "Today's Enquiries",
      value: stats.today,
      icon: Calendar,
      bg: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-500',
    },
    {
      label: 'Resolved',
      value: stats.total - stats.pending,
      icon: CheckCircle,
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            General Enquiries
          </h1>
          <p className="text-[#616161] dark:text-gray-400 text-xs mt-0.5">
            {loading ? 'Loading…' : `${total} enquier${total !== 1 ? 'ies' : 'y'} total`}
          </p>
        </div>
        <button
          onClick={() => fetchData(page, search)}
          title="Refresh"
          className="p-2 border border-gray-200 dark:border-white/10 rounded-xl text-[#616161] dark:text-gray-400 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                <Icon size={18} className={c.iconColor} />
              </div>
              <div>
                <div className="text-xl font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {loading ? '—' : c.value}
                </div>
                <div className="text-xs text-[#9E9E9E] dark:text-gray-500 leading-tight">{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/5 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative w-full md:w-1/2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name or mobile…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white dark:bg-white/5 text-[#212121] dark:text-white placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
          {fetchError}
          <button onClick={() => fetchData(page, search)} className="text-[#D32F2F] font-semibold text-xs hover:underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {[...Array(LIMIT)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="w-6 h-3 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
                <div className="w-32 h-3 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-100 dark:bg-white/10 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-100 dark:bg-white/10 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                    {['#', 'Name', 'Mobile', 'Looking For', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#9E9E9E]">
                          <MessageSquarePlus size={28} className="opacity-30" />
                          <span className="text-sm">{search ? 'No results found' : 'No enquiries yet'}</span>
                          {search && <span className="text-xs">Try a different search term.</span>}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => {
                      const sc = STATUS_COLORS[row.status] ?? STATUS_COLORS['Pending'];
                      return (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">
                            {(page - 1) * LIMIT + idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(row.name || '?')[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-[#212121] dark:text-white whitespace-nowrap">
                                {row.name || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#616161] dark:text-gray-400 whitespace-nowrap">
                            {row.mobile || '—'}
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            <span className="text-sm text-[#616161] dark:text-gray-400 line-clamp-1">
                              {row.lookingFor || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${sc.bg} ${sc.text}`}>
                              {row.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#616161] dark:text-gray-400 whitespace-nowrap">
                            {formatDate(row.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setViewItem(row)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteItem(row)}
                                className="p-1.5 text-[#D32F2F] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-white/5">
                <span className="text-xs text-[#616161] dark:text-gray-400">
                  {total === 0
                    ? '0 results'
                    : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePage(page - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors text-[#616161] dark:text-gray-400"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  {getPageNumbers(page, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#9E9E9E]">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePage(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          page === p
                            ? 'bg-[#D32F2F] text-white'
                            : 'border border-gray-200 dark:border-white/10 hover:border-[#D32F2F] text-[#616161] dark:text-gray-400'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePage(page + 1)}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors text-[#616161] dark:text-gray-400"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Popup */}
      {viewItem && (
        <ViewPopup
          inquiry={viewItem}
          onClose={() => setViewItem(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Delete Confirm */}
      {deleteItem && (
        <DeleteConfirm
          name={deleteItem.name || 'this'}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteItem(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
