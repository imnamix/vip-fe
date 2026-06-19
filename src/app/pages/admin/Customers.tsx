import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X, Phone, Mail, MapPin, Hash, Calendar } from 'lucide-react';

const STATUSES = ['Active', 'Inactive', 'Pending', 'Blocked'];
const SOURCES = ['Website', 'WhatsApp', 'Referral', 'Event', 'Social Media'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Kochi'];

function makeCustomers() {
  const names = ['Priya Sharma', 'Rajesh Patel', 'Ananya Reddy', 'Vikram Singh', 'Meena Iyer', 'Suresh Kumar', 'Deepa Nair', 'Karan Mehta', 'Pooja Verma', 'Amit Joshi'];
  return Array.from({ length: 50 }, (_, i) => ({
    id: `VIP-C${String(1001 + i).padStart(5, '0')}`,
    name: names[i % 10],
    mobile: `+91 ${9800000000 + i}`,
    email: names[i % 10].split(' ')[0].toLowerCase() + `${i}@email.com`,
    dob: `${(i % 28) + 1}/${(i % 12) + 1}/198${i % 10}`,
    city: CITIES[i % 8],
    preferredNumber: ['9999988888', '8888877777', '7777766666', '6666655555'][i % 4],
    status: STATUSES[i % 4] as typeof STATUSES[number],
    source: SOURCES[i % 5],
    date: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i % 6]} ${(i % 28) + 1}, 2024`,
    totalSpent: `₹${((i + 1) * 4999).toLocaleString()}`,
    notes: 'Interested in premium 9-series numbers for business purposes.',
  }));
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-600',
  Pending: 'bg-yellow-100 text-yellow-700',
  Blocked: 'bg-red-100 text-[#D32F2F]',
};

const PAGE_SIZE = 10;

export default function Customers() {
  const navigate = useNavigate();
  const [allCustomers, setAllCustomers] = useState(makeCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [viewCustomer, setViewCustomer] = useState<typeof allCustomers[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = allCustomers.filter(c =>
    (statusFilter === 'All' || c.status === statusFilter) &&
    (sourceFilter === 'All' || c.source === sourceFilter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      c.id.includes(search.toUpperCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (id: string) => {
    setAllCustomers(cs => cs.filter(c => c.id !== id));
    setDeleteId(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Customers</h1>
          <p className="text-[#616161] text-xs">{filtered.length} customers</p>
        </div>
        <button
          onClick={() => navigate('/admin/customers/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
        >
          <Plus size={14} /> Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, mobile, ID, city..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white text-[#616161]">
          <option value="All">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white text-[#616161]">
          <option value="All">All Sources</option>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || statusFilter !== 'All' || sourceFilter !== 'All') && (
          <button onClick={() => { setSearch(''); setStatusFilter('All'); setSourceFilter('All'); setPage(1); }}
            className="text-xs text-[#D32F2F] hover:underline font-medium">Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Customer ID', 'Name', 'Mobile', 'City', 'Source', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[#616161] text-sm">No customers found.</td></tr>
              ) : paginated.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.name[0]}
                      </div>
                      <span className="text-sm font-medium text-[#212121] whitespace-nowrap">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#616161] whitespace-nowrap">{c.mobile}</td>
                  <td className="px-4 py-3 text-sm text-[#616161]">{c.city}</td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{c.source}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">{c.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewCustomer(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye size={13} /></button>
                      <button onClick={() => navigate(`/admin/customers/${c.id}/edit`)} className="p-1.5 text-[#FBC02D] hover:bg-yellow-50 rounded-lg transition-colors" title="Edit"><Edit size={13} /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
          <span className="text-xs text-[#616161]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#616161] disabled:opacity-40 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-[#D32F2F] text-white' : 'border border-gray-200 text-[#616161] hover:border-[#D32F2F]'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#616161] disabled:opacity-40 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* View Popup */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewCustomer(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Customer Details</h3>
              <button onClick={() => setViewCustomer(null)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={14} />
              </button>
            </div>
            {/* Body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white text-xl font-bold shadow">
                  {viewCustomer.name[0]}
                </div>
                <div>
                  <div className="font-bold text-lg text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{viewCustomer.name}</div>
                  <div className="text-xs font-mono text-[#D32F2F]">{viewCustomer.id}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${statusColors[viewCustomer.status]}`}>{viewCustomer.status}</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  [<Phone size={13} />, viewCustomer.mobile],
                  [<Mail size={13} />, viewCustomer.email],
                  [<MapPin size={13} />, viewCustomer.city],
                  [<Calendar size={13} />, `DOB: ${viewCustomer.dob}`],
                  [<Hash size={13} />, `Preferred: ${viewCustomer.preferredNumber}`],
                ].map(([icon, val], i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-[#616161]">
                    <span className="text-[#D32F2F]">{icon as React.ReactNode}</span>{val as string}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                <div className="bg-[#FFF8E1] rounded-xl p-3 text-center">
                  <div className="font-bold text-[#D32F2F] text-base">{viewCustomer.totalSpent}</div>
                  <div className="text-xs text-[#616161]">Total Spent</div>
                </div>
                <div className="bg-[#FFF8E1] rounded-xl p-3 text-center">
                  <div className="font-bold text-[#212121] text-sm">{viewCustomer.source}</div>
                  <div className="text-xs text-[#616161]">Source</div>
                </div>
              </div>
              {viewCustomer.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-[#616161]">{viewCustomer.notes}</div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => { setViewCustomer(null); navigate(`/admin/customers/${viewCustomer.id}/edit`); }}
                className="flex-1 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors">
                Edit Customer
              </button>
              <button onClick={() => setViewCustomer(null)}
                className="flex-1 py-2 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-[#D32F2F]" />
            </div>
            <h3 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Delete Customer?</h3>
            <p className="text-sm text-[#616161] mb-5">This action cannot be undone. The customer and all related data will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
