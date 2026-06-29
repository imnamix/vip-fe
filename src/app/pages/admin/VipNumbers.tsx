import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Search, Loader2, AlertCircle, Hash,
  TrendingUp, Users, Building2, Award, Star, Target, BarChart2, Clock, Globe,
  Shield, Zap, Heart, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench,
  DollarSign, Phone, Crown,
} from 'lucide-react';

const VIP_ICONS: Record<string, React.ElementType> = {
  Star, Crown, Gem, Trophy, Phone, Hash, DollarSign, Zap, Heart, Shield,
  Award, Rocket, Target, TrendingUp, Globe, Users, Building2, BarChart2,
  Clock, ThumbsUp, Lightbulb, Wrench,
};

function renderIcon(name: string) {
  const Comp = VIP_ICONS[name];
  return Comp ? <Comp size={16} /> : <Hash size={16} />;
}
import { getAllVipNumbers, deleteVipNumber } from '../../services/VipNumbersService';

const PAGE_SIZE = 10;
const CATEGORIES = ['All', 'Premium', 'Gold', 'Silver', 'Platinum', 'Diamond', 'Bronze'];

interface VipNumberItem {
  id: number;
  icon: string;
  vipNumber: string;
  category: string;
  description: string;
  price: number;
  tag: string | null;
  rating: number | null;
  status: number;
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

export default function VipNumbers() {
  const navigate = useNavigate();

  const [items, setItems] = useState<VipNumberItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchItems = useCallback(async (pg: number, q: string, cat: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllVipNumbers(pg, PAGE_SIZE, q, cat);
      setItems(res?.data ?? []);
      setTotalCount(res?.count ?? 0);
    } catch {
      setError('Failed to load VIP numbers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(page, debouncedSearch, filter);
  }, [fetchItems, page, debouncedSearch, filter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  const handleFilterChange = (cat: string) => {
    setFilter(cat);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteVipNumber(deleteId);
      setDeleteId(null);
      fetchItems(page, debouncedSearch, filter);
    } catch {
      setError('Failed to delete VIP number.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Top VIP Numbers
          </h1>
          <p className="text-xs text-[#9E9E9E] mt-0.5">{totalCount} numbers total</p>
        </div>
        <button
          onClick={() => navigate('/admin/vip-numbers/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
        >
          <Plus size={13} /> Add VIP Number
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center gap-4">
          {/* Search — full width on left */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search VIP number..."
              className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] transition-colors text-[#212121] placeholder:text-gray-400"
            />
          </div>
          {/* Category filters — right */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filter === cat
                    ? 'bg-[#D32F2F] text-white'
                    : 'bg-gray-100 text-[#616161] hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Sr No', 'Icon', 'VIP Number', 'Category', 'Tag', 'Price', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#9E9E9E] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#9E9E9E] text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Loading…
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#9E9E9E] text-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Hash size={28} className="text-gray-300" />
                      <span>No VIP numbers found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[#9E9E9E] text-xs font-medium">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-[#D32F2F]">
                        {renderIcon(item.icon)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#212121] tracking-wide">
                      {item.vipNumber || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {item.category ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                          {item.category}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {item.tag ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.tag === 'HOT' ? 'bg-[#D32F2F] text-white'
                          : item.tag === 'NEW' ? 'bg-[#FBC02D] text-black'
                          : 'bg-gray-200 text-gray-500'
                        }`}>
                          {item.tag}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#212121]">
                      {item.price != null ? `₹${Number(item.price).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {item.rating != null ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#D32F2F] text-xs font-bold">
                          {parseFloat(Number(item.rating).toFixed(1))}<span className="text-[#9E9E9E] font-normal">/10</span>
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        item.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/admin/vip-numbers/${item.id}`)}
                          className="p-2 rounded-lg text-[#9E9E9E] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/vip-numbers/${item.id}/edit`)}
                          className="p-2 rounded-lg text-[#9E9E9E] hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-2 rounded-lg text-[#9E9E9E] hover:bg-red-50 hover:text-[#D32F2F] transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-[#9E9E9E]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg text-[#9E9E9E] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`e${i}`} className="px-2 text-[#9E9E9E] text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                      page === p
                        ? 'bg-[#D32F2F] text-white'
                        : 'text-[#616161] hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg text-[#9E9E9E] hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Delete VIP Number?
            </h3>
            <p className="text-sm text-[#616161] mb-5">This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
