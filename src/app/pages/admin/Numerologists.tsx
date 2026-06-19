import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Star, Eye, Edit, Trash2, Plus, Award, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

const rawList = Array.from({ length: 30 }, (_, i) => ({
  id: `NUM-${String(100 + i).padStart(4, '0')}`,
  name: ['Dr. Arjun Sharma', 'Priya Mehta', 'Rahul Verma', 'Sonal Gupta', 'Kiran Patel', 'Divya Nair', 'Suresh Iyer', 'Kavita Reddy', 'Anil Bhatt', 'Neha Kapoor'][i % 10],
  referralCode: `VIP-${String(10001 + i).padStart(5, '0')}`,
  mobile: `+91 ${9900000000 + i}`,
  email: ['arjun', 'priya', 'rahul', 'sonal', 'kiran', 'divya', 'suresh', 'kavita', 'anil', 'neha'][i % 10] + `${i}@numerology.com`,
  city: ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Kochi'][i % 8],
  customers: 120 + (i * 15) % 280,
  totalSales: `₹${((i + 1) * 45000).toLocaleString()}`,
  rating: parseFloat((4.2 + (i % 8) * 0.1).toFixed(1)),
  status: ['Active', 'Active', 'Active', 'Inactive'][i % 4] as 'Active' | 'Inactive',
  img: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop'][i % 5],
  experience: `${5 + (i % 15)} yrs`,
  specialisation: ['Vedic Numerology', 'Business Numerology', 'Name Correction', 'Mobile Numerology', 'Relationship Numerology'][i % 5],
}));

export default function Numerologists() {
  const navigate = useNavigate();
  const [allData, setAllData] = useState(rawList);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = allData.filter(n =>
    (statusFilter === 'All' || n.status === statusFilter) &&
    (n.name.toLowerCase().includes(search.toLowerCase()) || n.referralCode.includes(search.toUpperCase()) || n.city.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const topThree = [...allData].sort((a, b) => b.customers - a.customers).slice(0, 3);

  const handleDelete = (id: string) => { setAllData(d => d.filter(x => x.id !== id)); setDeleteId(null); };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Numerologists</h1>
          <p className="text-[#616161] text-xs">{filtered.length} in network</p>
        </div>
        <button onClick={() => navigate('/admin/numerologists/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors">
          <Plus size={13} /> Add Numerologist
        </button>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {topThree.map((n, i) => (
          <div key={n.id} onClick={() => navigate(`/admin/numerologists/${n.id}`)}
            className={`rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow ${i === 0 ? 'bg-gradient-to-br from-[#D32F2F] to-[#B71C1C]' : 'bg-white border border-gray-100'}`}>
            <div className="flex items-center gap-1 mb-2">
              <Award size={12} className="text-[#FBC02D]" />
              <span className="text-xs font-bold text-[#FBC02D]">#{i + 1}</span>
            </div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src={n.img} alt={n.name} className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
              <div>
                <div className={`font-bold text-sm ${i === 0 ? 'text-white' : 'text-[#212121]'}`}>{n.name}</div>
                <div className={`text-xs ${i === 0 ? 'text-red-200' : 'text-[#616161]'}`}>{n.city}</div>
              </div>
            </div>
            <div className="flex justify-between text-center">
              {[['Clients', n.customers], ['Sales', n.totalSales], [`⭐ ${n.rating}`, 'Rating']].map(([v, l]) => (
                <div key={String(l)}>
                  <div className={`font-bold text-xs ${i === 0 ? 'text-white' : 'text-[#212121]'}`}>{v}</div>
                  <div className={`text-[10px] ${i === 0 ? 'text-red-200' : 'text-[#616161]'}`}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Name, code, city..."
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white text-[#616161]">
          <option value="All">All Status</option>
          <option>Active</option><option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Numerologist', 'Code', 'Specialisation', 'Clients', 'Sales', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(n => (
                <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/numerologists/${n.id}`)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={n.img} alt={n.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-[#212121] text-sm whitespace-nowrap">{n.name}</div>
                        <div className="text-xs text-[#616161]">{n.city} · {n.experience}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">{n.referralCode}</td>
                  <td className="px-4 py-3"><span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full">{n.specialisation}</span></td>
                  <td className="px-4 py-3 text-sm font-bold text-[#212121]">{n.customers}</td>
                  <td className="px-4 py-3 text-sm font-bold text-[#212121]">{n.totalSales}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5"><Star size={11} className="text-[#FBC02D] fill-current" /><span className="text-sm font-semibold">{n.rating}</span></div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${n.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{n.status}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button onClick={() => navigate(`/admin/numerologists/${n.id}`)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={13} /></button>
                      <button onClick={() => navigate(`/admin/numerologists/${n.id}/edit`)} className="p-1.5 text-[#FBC02D] hover:bg-yellow-50 rounded-lg"><Edit size={13} /></button>
                      <button onClick={() => setDeleteId(n.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
          <span className="text-xs text-[#616161]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors">
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium ${page === p ? 'bg-[#D32F2F] text-white' : 'border border-gray-200 text-[#616161] hover:border-[#D32F2F]'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-[#D32F2F]" /></div>
            <h3 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Remove Numerologist?</h3>
            <p className="text-sm text-[#616161] mb-5">This will permanently remove the numerologist from the network.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C]">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
