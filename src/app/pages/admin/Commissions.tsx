import { useState } from 'react';
import { Search, Check, X, Eye, ArrowUpRight } from 'lucide-react';

type CommStatus = 'Pending' | 'Approved' | 'Paid';
const statusColors: Record<CommStatus, string> = {
  Pending: 'bg-orange-100 text-orange-700',
  Approved: 'bg-blue-100 text-blue-700',
  Paid: 'bg-green-100 text-green-700',
};

const names = ['Dr. Arjun Sharma', 'Priya Mehta', 'Rahul Verma', 'Sonal Gupta', 'Kiran Patel', 'Divya Nair', 'Suresh Iyer', 'Kavita Reddy', 'Anil Bhatt', 'Neha Kapoor'];
const imgs = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
];

const commissions = Array.from({ length: 50 }, (_, i) => ({
  id: `COM-${String(5001 + i).padStart(5, '0')}`,
  numerologist: names[i % names.length],
  img: imgs[i % imgs.length],
  referralCode: `VIP-${String(10001 + i).padStart(5, '0')}`,
  customerId: `VIP-C${String(1001 + i).padStart(5, '0')}`,
  customerName: ['Rohit Sharma', 'Kavita Singh', 'Anil Bhatt', 'Sunita Rao'][i % 4],
  saleAmount: `₹${((i + 1) * 9999).toLocaleString()}`,
  commissionRate: `${8 + (i % 5)}%`,
  commissionAmount: `₹${((i + 1) * 9999 * (8 + i % 5) / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
  status: (['Pending', 'Pending', 'Approved', 'Paid', 'Paid'] as CommStatus[])[i % 5],
  date: `${['Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i % 5]} ${(i % 28) + 1}, 2024`,
}));

const PAGE_SIZE = 15;

export default function Commissions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommStatus | 'All'>('All');
  const [page, setPage] = useState(1);

  const filtered = commissions.filter(c =>
    (statusFilter === 'All' || c.status === statusFilter) &&
    c.numerologist.toLowerCase().includes(search.toLowerCase())
  );

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = {
    Pending: commissions.filter(c => c.status === 'Pending').length,
    Approved: commissions.filter(c => c.status === 'Approved').length,
    Paid: commissions.filter(c => c.status === 'Paid').length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Commissions</h1>
        <p className="text-[#616161] text-sm">Track and manage numerologist commission payouts</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Commission', amount: '₹4,80,000', count: totals.Pending, color: '#FF9800', bg: '#FFF3E0', icon: '⏳' },
          { label: 'Approved Commission', amount: '₹2,14,000', count: totals.Approved, color: '#2196F3', bg: '#E3F2FD', icon: '✅' },
          { label: 'Paid Commission', amount: '₹18,92,000', count: totals.Paid, color: '#4CAF50', bg: '#E8F5E9', icon: '💰' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="text-2xl">{card.icon}</div>
              <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                <ArrowUpRight size={12} />8.4%
              </div>
            </div>
            <div className="text-2xl font-bold text-[#212121] mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: card.color }}>{card.amount}</div>
            <div className="text-sm font-medium text-[#212121] mb-0.5">{card.label}</div>
            <div className="text-xs text-[#616161]">{card.count} records</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search numerologist..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Pending', 'Approved', 'Paid'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Commission ID', 'Numerologist', 'Customer', 'Sale Amount', 'Rate', 'Commission', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={c.img} alt={c.numerologist} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="text-sm font-medium text-[#212121] whitespace-nowrap">{c.numerologist}</div>
                        <div className="text-xs text-[#616161]">{c.referralCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[#212121]">{c.customerName}</div>
                    <div className="text-xs text-[#616161]">{c.customerId}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#212121]">{c.saleAmount}</td>
                  <td className="px-4 py-3 text-sm text-[#616161]">{c.commissionRate}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#4CAF50]">{c.commissionAmount}</td>
                  <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">{c.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={14} /></button>
                      {c.status === 'Pending' && (
                        <button className="p-1.5 text-[#4CAF50] hover:bg-green-50 rounded-lg"><Check size={14} /></button>
                      )}
                      {c.status !== 'Paid' && (
                        <button className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg"><X size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-4 flex items-center justify-between border-t border-gray-100">
          <span className="text-sm text-[#616161]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-[#D32F2F]">Prev</button>
            <span className="px-3 py-1.5 text-sm">{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:border-[#D32F2F]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
