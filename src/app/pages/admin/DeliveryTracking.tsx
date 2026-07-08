import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Truck, CheckCircle, XCircle, Search, Edit, X, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import { getAllEnquires, updateEnquiry, getStatusCounts } from '../../services/EnquiresService';
import { usePermission } from '../../hooks/usePermission';
import { useAdminTheme } from '../../context/AdminThemeContext';
import type { RootState } from '../../store/Store';

type DeliveryStatus = 'Dispatched' | 'Delivered' | 'Cancelled';
const ALL_STATUS: DeliveryStatus[] = ['Dispatched', 'Delivered', 'Cancelled'];

/* Relative order of the "normal" flow — used to detect forward vs. reverted status changes */
const STATUS_ORDER: Record<DeliveryStatus, number> = { Dispatched: 1, Delivered: 2, Cancelled: 0 };

const STATUS_META: Record<DeliveryStatus, { bg: string; text: string; border: string; darkBg: string; darkBorder: string; darkText: string; icon: typeof Truck }> = {
  Dispatched: { bg: '#F3E5F5', text: '#9C27B0', border: '#E1BEE7', darkBg: 'rgba(156,39,176,0.12)', darkBorder: 'rgba(156,39,176,0.3)', darkText: '#CE93D8', icon: Truck },
  Delivered:  { bg: '#E8F5E9', text: '#388E3C', border: '#C8E6C9', darkBg: 'rgba(56,142,60,0.12)',  darkBorder: 'rgba(56,142,60,0.3)',  darkText: '#A5D6A7', icon: CheckCircle },
  Cancelled:  { bg: '#FFEBEE', text: '#D32F2F', border: '#FFCDD2', darkBg: 'rgba(211,47,47,0.12)',  darkBorder: 'rgba(211,47,47,0.3)',  darkText: '#EF9A9A', icon: XCircle },
};

const LIMIT = 10;

const nowStr = () => new Date().toLocaleString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
});

/* Today's date in IST (Asia/Kolkata), formatted as YYYY-MM-DD for <input type="date"> */
const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* Builds a human-readable activity-log line for a status transition, calling out reverts/cancellations */
function describeStatusChange(oldStatus: DeliveryStatus, newStatus: DeliveryStatus, reason?: string): string {
  if (newStatus === 'Cancelled') {
    return `Delivery cancelled${reason ? ` — reason: ${reason}` : ''}`;
  }
  if (oldStatus === 'Cancelled') {
    return `Delivery reactivated — status reverted from "Cancelled" to "${newStatus}"`;
  }
  if (STATUS_ORDER[newStatus] < STATUS_ORDER[oldStatus]) {
    return `Status reverted from "${oldStatus}" to "${newStatus}"`;
  }
  return `Status changed to "${newStatus}"`;
}

/* ── Status Badge ──────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: DeliveryStatus }) {
  const isDark = useAdminTheme();
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit border"
      style={isDark
        ? { background: m.darkBg, color: m.darkText, borderColor: m.darkBorder }
        : { background: m.bg, color: m.text, borderColor: m.border }}>
      <Icon size={11} /> {status}
    </span>
  );
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  pages.push(1);
  if (left > 2)           pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1)  pages.push('...');
  pages.push(total);
  return pages;
}

function Pagination({ page, total, limit, onChange }: {
  page: number; total: number; limit: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-white/10">
      <span className="text-xs text-[#616161] dark:text-gray-400">
        {total === 0 ? '0 results' : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
      </span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors">
          <ChevronLeft size={13} />
        </button>
        {getPageNumbers(page, totalPages).map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#9E9E9E] dark:text-gray-600">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p as number)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                page === p ? 'bg-[#D32F2F] text-white' : 'border border-gray-200 dark:border-white/10 hover:border-[#D32F2F] text-[#616161] dark:text-gray-400'
              }`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages || totalPages === 0}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors">
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ── Edit Popup ─────────────────────────────────────────────────────────── */
function DeliveryEditPopup({ delivery, onClose, onSaved }: {
  delivery: any; onClose: () => void; onSaved: () => void;
}) {
  const isDark = useAdminTheme();
  const [status,        setStatus]        = useState<DeliveryStatus>((delivery.status as DeliveryStatus) || 'Dispatched');
  const [deliveredDate, setDeliveredDate] = useState(delivery.deliveredDate || '');
  const [notes,         setNotes]         = useState(delivery.deliveryNotes || '');
  const [cancelReason,  setCancelReason]  = useState(delivery.cancelReason || '');
  const [saving,        setSaving]        = useState(false);
  const [fieldErrors,   setFieldErrors]   = useState<{ deliveredDate?: string; cancelReason?: string }>({});
  const [apiError,      setApiError]      = useState('');
  const currentUserName = useSelector((state: RootState) => state.permission.user?.name) || 'Admin';

  const clearFieldError = (field: 'deliveredDate' | 'cancelReason') =>
    setFieldErrors(fe => (fe[field] ? { ...fe, [field]: undefined } : fe));

  const handleStatusChange = (s: DeliveryStatus) => {
    setStatus(s);
    setFieldErrors({});
    setApiError('');
    if (s === 'Delivered' && !deliveredDate) setDeliveredDate(todayIST());
  };

  const save = async () => {
    const errs: typeof fieldErrors = {};
    if (status === 'Delivered' && !deliveredDate) {
      errs.deliveredDate = 'Delivered date is required to mark this order as Delivered.';
    }
    if (status === 'Cancelled' && !cancelReason.trim()) {
      errs.cancelReason = 'Cancellation reason is required to mark this order as Cancelled.';
    }
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setFieldErrors({}); setApiError(''); setSaving(true);
    try {
      let timeline: any[] = [];
      if (delivery.activityLog) { try { timeline = JSON.parse(delivery.activityLog); } catch {} }

      const notesChanged = notes.trim() !== (delivery.deliveryNotes || '').trim();

      const parts: string[] = [];
      if (status !== delivery.status) {
        parts.push(describeStatusChange(delivery.status, status, status === 'Cancelled' ? cancelReason.trim() : undefined));
      }
      if (deliveredDate && deliveredDate !== (delivery.deliveredDate || '')) parts.push(`delivered date set to ${fmtDate(deliveredDate)}`);
      if (notesChanged) parts.push('delivery notes updated');

      const newTimeline = parts.length
        ? [...timeline, { date: nowStr(), action: parts.join(' · '), user: currentUserName, status }]
        : timeline;

      // Mirror the delivery note into the inquiry's general Notes panel so it shows up there too
      let generalNotes: any[] = [];
      if (delivery.enquiryNotes) { try { generalNotes = JSON.parse(delivery.enquiryNotes); } catch {} }
      const newGeneralNotes = notesChanged && notes.trim()
        ? [...generalNotes, { author: `${currentUserName} (Delivery)`, text: notes.trim(), time: nowStr() }]
        : generalNotes;

      await updateEnquiry(delivery.id, {
        status,
        deliveredDate: deliveredDate || null,
        deliveryNotes: notes,
        cancelReason: status === 'Cancelled' ? cancelReason.trim() : null,
        activityLog: JSON.stringify(newTimeline),
        enquiryNotes: JSON.stringify(newGeneralNotes),
      });
      onSaved();
      onClose();
    } catch (e: any) {
      setApiError(e?.response?.data?.message || 'Failed to update delivery. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fieldCls = (hasError?: string) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none bg-white dark:bg-white/5 text-[#212121] dark:text-white ${
      hasError ? 'border-red-400 dark:border-red-500/60 focus:border-red-500' : 'border-gray-200 dark:border-white/10 focus:border-[#D32F2F]'
    }`;

  const roField = (label: string, value: string, mono?: boolean) => (
    <div>
      <label className="block text-[10px] font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider mb-1">{label}</label>
      <div className={`px-3 py-2.5 bg-gray-50 dark:bg-white/4 rounded-xl text-sm text-[#212121] dark:text-white ${mono ? 'font-mono font-semibold' : ''}`}>{value || '—'}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e2133] rounded-2xl max-w-lg w-full my-4 shadow-2xl dark:shadow-black/50 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Update Delivery</h3>
              <p className="text-red-200 text-xs mt-0.5 font-mono">{delivery.deliveryId}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[72vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {roField('Customer Name', delivery.name)}
            {roField('Customer Mobile', delivery.mobile, true)}
            {roField('Delivery ID', delivery.deliveryId, true)}
            {roField('Expected Delivery', fmtDate(delivery.expectedDeliveryDate))}
            {roField('Partner Name', delivery.deliveryPartnerName)}
            {roField('Partner Mobile', delivery.deliveryPartnerMobile)}
          </div>
          {roField('Delivery Address', delivery.deliveryAddress)}

          {/* Status */}
          <div>
            <label className="block text-[10px] font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_STATUS.map(s => {
                const m = STATUS_META[s];
                const Icon = m.icon;
                const active = status === s;
                return (
                  <button key={s} onClick={() => handleStatusChange(s)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border-2 ${active ? 'border-current' : 'border-transparent'}`}
                    style={isDark ? { background: m.darkBg, color: m.darkText } : { background: m.bg, color: m.text }}>
                    <Icon size={12} /> {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cancellation Reason — only when status is Cancelled */}
          {status === 'Cancelled' && (
            <div>
              <label className="block text-[10px] font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea value={cancelReason} onChange={e => { setCancelReason(e.target.value); clearFieldError('cancelReason'); }} rows={2}
                placeholder="Why is this delivery being cancelled?"
                className={`${fieldCls(fieldErrors.cancelReason)} resize-none`} />
              {fieldErrors.cancelReason && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.cancelReason}</p>}
            </div>
          )}

          {/* Delivered Date */}
          <div>
            <label className="block text-[10px] font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Delivered Date {status === 'Delivered' && <span className="text-red-500">*</span>}
            </label>
            <input type="date" value={deliveredDate} onChange={e => { setDeliveredDate(e.target.value); clearFieldError('deliveredDate'); }}
              className={fieldCls(fieldErrors.deliveredDate)} />
            {fieldErrors.deliveredDate && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{fieldErrors.deliveredDate}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Delivery notes / remarks…"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none bg-white dark:bg-white/5 text-[#212121] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500" />
          </div>

          {apiError && <p className="text-xs text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/15 py-2 px-3 rounded-xl border border-red-100 dark:border-red-500/25">{apiError}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 border-2 border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-400 rounded-xl text-sm font-semibold hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white rounded-xl text-sm font-semibold hover:from-[#B71C1C] hover:to-[#C62828] disabled:opacity-50 transition-all shadow-sm">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────── */
export default function DeliveryTracking() {
  const [deliveries,   setDeliveries]   = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState('');
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState<DeliveryStatus | null>(null);
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [editing,      setEditing]      = useState<any | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { can }     = usePermission();
  const isDark      = useAdminTheme();
  const canEdit     = can('Delivery', 'update');

  const fetchDeliveries = async (p: number, q: string, s: DeliveryStatus | null) => {
    setLoading(true); setFetchError('');
    try {
      const statusParam = s || 'Dispatched,Delivered,Cancelled';
      const res = await getAllEnquires(p, LIMIT, q || undefined, statusParam);
      setDeliveries(res?.data ?? []);
      setTotal(res?.count ?? 0);
    } catch {
      setFetchError('Failed to load deliveries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await getStatusCounts();
      setStatusCounts(res?.data ?? {});
    } catch {}
  };

  useEffect(() => { fetchDeliveries(1, '', null); fetchCounts(); }, []);

  const handleSearchChange = (q: string) => {
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchDeliveries(1, q, filter); }, 350);
  };

  const handleFilter = (s: DeliveryStatus | null) => {
    const next = s === filter ? null : s;
    setFilter(next);
    setPage(1);
    fetchDeliveries(1, search, next);
  };

  const handlePageChange = (p: number) => { setPage(p); fetchDeliveries(p, search, filter); };

  const refresh = () => { fetchDeliveries(page, search, filter); fetchCounts(); };

  const onSaved = () => { fetchDeliveries(page, search, filter); fetchCounts(); };

  const allDeliveryCount = ALL_STATUS.reduce((sum, s) => sum + (statusCounts[s] ?? 0), 0);

  return (
    <div>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Delivery</h1>
          <p className="text-[#616161] dark:text-gray-400 text-sm">
            {loading ? 'Loading…' : `${total} ${filter ? `"${filter}"` : ''} ${total === 1 ? 'delivery' : 'deliveries'}`}
          </p>
        </div>
        <button onClick={refresh} title="Refresh" className="p-2 border border-gray-200 dark:border-white/10 rounded-xl text-[#616161] dark:text-gray-400 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Search + status filter pills (search left, filters aligned to end) ── */}
      <div className="flex items-center flex-wrap justify-between gap-2 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Delivery ID, customer, VIP number, partner…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-8 pr-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] w-full bg-white dark:bg-white/5 text-[#212121] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          {search && (
            <button onClick={() => handleSearchChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => handleFilter(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filter === null ? 'bg-[#D32F2F] text-white border-[#D32F2F]' : 'bg-white dark:bg-white/5 text-[#616161] dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20'
            }`}
          >
            All
            <span className={`font-bold px-1.5 py-0.5 rounded-full text-[10px] ${filter === null ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>
              {allDeliveryCount}
            </span>
          </button>
          {ALL_STATUS.map(s => {
            const m = STATUS_META[s];
            const active = filter === s;
            const count = statusCounts[s] ?? 0;
            return (
              <button
                key={s}
                onClick={() => handleFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${active ? 'text-white' : 'hover:opacity-90'}`}
                style={
                  active
                    ? { backgroundColor: m.text, borderColor: m.text, color: '#fff' }
                    : isDark
                      ? { background: m.darkBg, color: m.darkText, borderColor: m.darkBorder }
                      : { background: m.bg, color: m.text, borderColor: m.border }
                }
              >
                {s}
                <span className={`font-bold px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/25' : isDark ? 'bg-black/30' : 'bg-white/60'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-500/25 rounded-2xl px-4 py-3 text-sm text-red-600 dark:text-red-400 mb-4 flex items-center justify-between">
          {fetchError}
          <button onClick={refresh} className="text-[#D32F2F] font-semibold text-xs hover:underline">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 overflow-hidden">
          {[...Array(LIMIT)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 dark:border-white/5 last:border-0">
              <div className="w-6 h-3 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="w-24 h-3 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="w-32 h-3 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              <div className="w-20 h-3 bg-gray-100 dark:bg-white/5 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      {!loading && (
        <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 overflow-hidden">
          {deliveries.length === 0 ? (
            <div className="text-center py-16 text-[#616161] dark:text-gray-400">
              <Truck size={28} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="font-medium text-sm">{search || filter ? 'No results found' : 'No deliveries yet'}</p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                {search || filter ? 'Try a different search or filter.' : 'Orders marked as Dispatched will appear here.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                      {[
                        'Sr No', 'Delivery ID', 'Customer Name', 'Customer Mobile', 'VIP Number', 'Partner Name',
                        'Partner Mobile', 'Status', 'Expected Date', 'Delivered Date',
                        ...(canEdit ? ['Action'] : []),
                      ].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d, i) => (
                      <tr key={d.id}
                        onClick={() => canEdit && setEditing(d)}
                        className={`border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${canEdit ? 'cursor-pointer' : ''}`}>
                        <td className="px-4 py-3 text-xs text-[#616161] dark:text-gray-400">{(page - 1) * LIMIT + i + 1}</td>
                        <td className="px-4 py-3 text-xs font-mono font-bold text-[#D32F2F] whitespace-nowrap">{d.deliveryId || '—'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#212121] dark:text-white whitespace-nowrap">{d.name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#616161] dark:text-gray-400 whitespace-nowrap">{d.mobile || '—'}</td>
                        <td className="px-4 py-3 text-xs font-mono font-bold text-[#D32F2F] whitespace-nowrap">{d.confirmedNumber || d.vipNumber || '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#212121] dark:text-white whitespace-nowrap">{d.deliveryPartnerName || '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#616161] dark:text-gray-400 whitespace-nowrap">{d.deliveryPartnerMobile || '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={(d.status as DeliveryStatus) || 'Dispatched'} /></td>
                        <td className="px-4 py-3 text-xs text-[#616161] dark:text-gray-400 whitespace-nowrap">{fmtDate(d.expectedDeliveryDate)}</td>
                        <td className="px-4 py-3 text-xs text-[#616161] dark:text-gray-400 whitespace-nowrap">{fmtDate(d.deliveredDate)}</td>
                        {canEdit && (
                          <td className="px-4 py-3">
                            <button onClick={e => { e.stopPropagation(); setEditing(d); }} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg" title="Edit">
                              <Edit size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} total={total} limit={LIMIT} onChange={handlePageChange} />
            </>
          )}
        </div>
      )}

      {/* ── Edit Popup ── */}
      {editing && (
        <DeliveryEditPopup delivery={editing} onClose={() => setEditing(null)} onSaved={onSaved} />
      )}
    </div>
  );
}
