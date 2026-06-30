import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar, MapPin, Plus, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Search, Loader2, AlertCircle, ImageOff, LayoutTemplate,
} from 'lucide-react';
import { getAllEvents, deleteEvents } from '../../services/EventsService';
import { usePermission } from '../../hooks/usePermission';

const PAGE_SIZE = 8;

const STATUS_FILTERS = ['All', 'Upcoming', 'Completed', 'Draft', 'Cancelled'];

const statusColors: Record<string, string> = {
  Upcoming: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Draft: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-[#D32F2F]',
};

interface EventItem {
  id: number;
  title: string;
  eventDate: string;
  location: string;
  mainImage?: { media_url: string; media_type: string }[];
  eventStatus: string;
  eventType?: string;
  seats?: number;
  fees?: string;
}

interface Stats {
  total: number;
  upcoming: number;
  completed: number;
  draft: number;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  pages.push(1);
  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const { can }      = usePermission();
  const canView       = can('Events', 'read');
  const canEdit        = can('Events', 'update');
  const canDelete       = can('Events', 'delete');
  const showActions      = canView || canEdit || canDelete;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, upcoming: 0, completed: 0, draft: 0 });
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Stats (independent of table filters) ─────────────────────────────────

  const loadStats = useCallback(async () => {
    try {
      const [total, upcoming, completed, draft] = await Promise.all([
        getAllEvents(1, 1),
        getAllEvents(1, 1, '', 'Upcoming'),
        getAllEvents(1, 1, '', 'Completed'),
        getAllEvents(1, 1, '', 'Draft'),
      ]);
      setStats({
        total: total?.count ?? 0,
        upcoming: upcoming?.count ?? 0,
        completed: completed?.count ?? 0,
        draft: draft?.count ?? 0,
      });
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // ── Table data ────────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllEvents(page, PAGE_SIZE, debouncedSearch, filter);
      setEvents(res?.data ?? []);
      setTotalCount(res?.count ?? 0);
    } catch {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── Search debounce ───────────────────────────────────────────────────────

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleFilterChange = (f: string) => {
    setFilter(f);
    setPage(1);
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEvents({ ids: [deleteId] });
      setDeleteId(null);
      await Promise.all([fetchEvents(), loadStats()]);
    } catch {
      // silently ignore
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Events
          </h1>
          <p className="text-[#616161] text-xs">
            {totalCount} event{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {can('Events', 'write') && (
            <>
              <button
                onClick={() => navigate('/admin/events/banner')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
              >
                <LayoutTemplate size={13} /> Banner Slides
              </button>
              <button
                onClick={() => navigate('/admin/events/new')}
                className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
              >
                <Plus size={13} /> Create Event
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Events', value: stats.total, color: '#D32F2F' },
          { label: 'Upcoming', value: stats.upcoming, color: '#2196F3' },
          { label: 'Completed', value: stats.completed, color: '#4CAF50' },
          { label: 'Draft', value: stats.draft, color: '#9E9E9E' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
              style={{ backgroundColor: color + '18' }}
            >
              <Calendar size={15} style={{ color }} />
            </div>
            <div className="text-lg font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {value}
            </div>
            <div className="text-xs text-[#616161]">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === s ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 px-5 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Sr No', 'Event', 'Date', 'Venue', 'Seats', 'Fees', 'Type', 'Status', ...(showActions ? ['Actions'] : [])].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 9 : 8} className="px-4 py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#616161] text-sm">
                      <Loader2 size={16} className="animate-spin" /> Loading events…
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 9 : 8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#9E9E9E]">
                      <Calendar size={28} className="opacity-30" />
                      <span className="text-sm">No events found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((e, idx) => {
                  const imgUrl = e.mainImage?.[0]?.media_url ?? '';
                  const statusLabel = e.eventStatus ?? 'Draft';
                  return (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {/* Sr No */}
                      <td className="px-4 py-3 text-sm text-[#9E9E9E] font-medium">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>

                      {/* Event */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={e.title}
                              className="w-10 h-7 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <ImageOff size={11} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-[#212121] text-sm leading-tight max-w-40 truncate">
                              {e.title || '—'}
                            </div>
                            <div className="text-xs text-[#9E9E9E]">#{e.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-[#616161] whitespace-nowrap">
                          <Calendar size={11} className="text-[#D32F2F]" />
                          {formatDate(e.eventDate)}
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-[#616161]">
                          <MapPin size={11} className="text-[#D32F2F] flex-shrink-0" />
                          <span className="max-w-32 truncate">{e.location || '—'}</span>
                        </div>
                      </td>

                      {/* Seats */}
                      <td className="px-4 py-3 text-sm text-[#212121]">
                        {e.seats != null ? e.seats.toLocaleString() : '—'}
                      </td>

                      {/* Fees */}
                      <td className="px-4 py-3 text-sm font-semibold text-[#212121]">
                        {e.fees || '—'}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        {e.eventType ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 whitespace-nowrap">
                            {e.eventType}
                          </span>
                        ) : (
                          <span className="text-xs text-[#9E9E9E]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            statusColors[statusLabel] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      {showActions && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {canView && (
                              <button
                                onClick={() => navigate(`/admin/events/${e.id}`)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => navigate(`/admin/events/${e.id}/edit`)}
                                className="p-2 text-[#FBC02D] hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleteId(e.id)}
                                className="p-2 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
            <span className="text-xs text-[#616161]">
              {totalCount === 0
                ? '0 results'
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount}`}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors"
              >
                <ChevronLeft size={13} />
              </button>

              {getPageNumbers(page, totalPages).map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#9E9E9E]">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      page === p
                        ? 'bg-[#D32F2F] text-white'
                        : 'border border-gray-200 hover:border-[#D32F2F] text-[#616161]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={18} className="text-[#D32F2F]" />
            </div>
            <h3 className="font-bold text-[#212121] mb-2">Delete Event?</h3>
            <p className="text-sm text-[#616161] mb-5">
              This event and all its data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : null}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
