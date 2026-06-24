import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, Eye, ChevronLeft, ChevronRight, X, RefreshCw, Users } from 'lucide-react';
import { getAllEnquires } from '../../services/EnquiresService';

const LIMIT = 10;

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

export default function Customers() {
  const navigate = useNavigate();

  const [leads,      setLeads]      = useState<any[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLeads = async (p: number, q: string) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getAllEnquires(p, LIMIT, q || undefined, 'Delivered');
      setLeads(res?.data ?? []);
      setTotal(res?.count ?? 0);
    } catch {
      setFetchError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1, '');
  }, []);

  const handleSearchChange = (q: string) => {
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchLeads(1, q);
    }, 350);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchLeads(p, search);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Customers</h1>
          <p className="text-[#616161] text-xs">
            {loading ? 'Loading…' : `${total} delivered customer${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => fetchLeads(page, search)}
          title="Refresh"
          className="p-2 border border-gray-200 rounded-xl text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, mobile…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
          />
          {search && (
            <button onClick={() => handleSearchChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
          {fetchError}
          <button onClick={() => fetchLeads(page, search)} className="text-[#D32F2F] font-semibold text-xs hover:underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(LIMIT)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="w-6 h-3 bg-gray-100 rounded animate-pulse" />
                <div className="w-32 h-3 bg-gray-100 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
                <div className="w-20 h-3 bg-gray-100 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['#', 'Name', 'Mobile', 'Location', 'Source', 'Type', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#9E9E9E]">
                          <Users size={28} className="opacity-30" />
                          <span className="text-sm">{search ? 'No results found' : 'No delivered customers yet'}</span>
                          {search && <span className="text-xs">Try a different search term.</span>}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leads.map((inq, idx) => {
                      const location = [inq.district, inq.state].filter(Boolean).join(', ') || '—';
                      const date = inq.created_at
                        ? new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—';
                      return (
                        <tr key={inq.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">
                            {(page - 1) * LIMIT + idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(inq.name || '?')[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-[#212121] whitespace-nowrap">{inq.name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#616161] whitespace-nowrap">{inq.mobile || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[#616161] whitespace-nowrap">{location}</td>
                          <td className="px-4 py-3">
                            {inq.source
                              ? <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{inq.source}</span>
                              : <span className="text-xs text-[#9E9E9E]">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                              inq.inquiryType === 'numerologist' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {inq.inquiryType || 'customer'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">{date}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/admin/inquiries/${inq.id}`)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Inquiry"
                            >
                              <Eye size={13} />
                            </button>
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
              <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                <span className="text-xs text-[#616161]">
                  {total === 0
                    ? '0 results'
                    : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  {getPageNumbers(page, totalPages).map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#9E9E9E]">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p as number)}
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
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
