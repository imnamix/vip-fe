import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, MapPin, Users, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const PAGE_SIZE = 8;

const initEvents = [
  { id: 'EVT-001', title: 'Numerology Masterclass 2024', date: 'Aug 15, 2024', venue: 'The Westin, Pune', capacity: 200, registered: 153, fee: '₹4,999', status: 'Upcoming', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=60&h=40&fit=crop' },
  { id: 'EVT-002', title: 'VIP Number Expo Mumbai', date: 'Sep 7–8, 2024', venue: 'Bombay Exhibition Centre', capacity: 5000, registered: 3742, fee: 'Free', status: 'Upcoming', img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=60&h=40&fit=crop' },
  { id: 'EVT-003', title: 'Spiritual Growth Seminar', date: 'Sep 22, 2024', venue: 'Taj Vivanta, Bangalore', capacity: 150, registered: 118, fee: '₹2,499', status: 'Upcoming', img: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=60&h=40&fit=crop' },
  { id: 'EVT-004', title: 'Business Numerology Workshop', date: 'Oct 5, 2024', venue: 'Hilton, Hyderabad', capacity: 80, registered: 62, fee: '₹8,999', status: 'Upcoming', img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=60&h=40&fit=crop' },
  { id: 'EVT-005', title: 'Annual Numerology Summit', date: 'Jul 10, 2024', venue: 'Grand Hyatt, Mumbai', capacity: 500, registered: 498, fee: '₹12,000', status: 'Completed', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=60&h=40&fit=crop' },
  { id: 'EVT-006', title: 'South India Numerology Expo', date: 'Jun 5, 2024', venue: 'Chennai Trade Centre', capacity: 2000, registered: 1876, fee: 'Free', status: 'Completed', img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=60&h=40&fit=crop' },
  { id: 'EVT-007', title: 'VIP Number Auction Night', date: 'May 20, 2024', venue: 'ITC Maratha, Mumbai', capacity: 100, registered: 100, fee: '₹5,000', status: 'Completed', img: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=60&h=40&fit=crop' },
  { id: 'EVT-008', title: 'Business Webinar Series', date: 'Apr 15, 2024', venue: 'Online (Zoom)', capacity: 1000, registered: 847, fee: '₹499', status: 'Completed', img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=60&h=40&fit=crop' },
  { id: 'EVT-009', title: 'North India Masterclass', date: 'Nov 12, 2024', venue: 'Le Meridien, Delhi', capacity: 300, registered: 0, fee: '₹6,999', status: 'Draft', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=60&h=40&fit=crop' },
  { id: 'EVT-010', title: 'Corporate Numerology Summit', date: 'Dec 8, 2024', venue: 'Taj Lands End, Mumbai', capacity: 250, registered: 0, fee: '₹15,000', status: 'Draft', img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=60&h=40&fit=crop' },
];

const statusColors: Record<string, string> = {
  Upcoming: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Draft: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-[#D32F2F]',
};

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState(initEvents);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = events.filter(e =>
    (filter === 'All' || e.status === filter) &&
    e.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (id: string) => { setEvents(es => es.filter(e => e.id !== id)); setDeleteId(null); };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Events</h1>
          <p className="text-[#616161] text-xs">{filtered.length} events</p>
        </div>
        <button onClick={() => navigate('/admin/events/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors">
          <Plus size={13} /> Create Event
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          ['Total Events', events.length, Calendar, '#D32F2F'],
          ['Total Registrations', events.reduce((s, e) => s + e.registered, 0).toLocaleString(), Users, '#4CAF50'],
          ['Upcoming', events.filter(e => e.status === 'Upcoming').length, Calendar, '#2196F3'],
          ['Completed', events.filter(e => e.status === 'Completed').length, Calendar, '#9C27B0'],
        ].map(([label, value, Icon, color]) => {
          const StatIcon = Icon as typeof Calendar;
          return (
            <div key={label as string} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: (color as string) + '15' }}>
                <StatIcon size={15} style={{ color: color as string }} />
              </div>
              <div className="text-lg font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</div>
              <div className="text-xs text-[#616161]">{label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search events..."
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Upcoming', 'Completed', 'Draft', 'Cancelled'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filter === s ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Event', 'Date', 'Venue', 'Registrations', 'Fee', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(e => {
                const pct = e.capacity ? Math.round((e.registered / e.capacity) * 100) : 0;
                return (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={e.img} alt={e.title} className="w-10 h-7 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-[#212121] text-sm">{e.title}</div>
                          <div className="text-xs text-[#616161]">{e.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-[#616161] whitespace-nowrap"><Calendar size={11} className="text-[#D32F2F]" />{e.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-[#616161]"><MapPin size={11} className="text-[#D32F2F]" /><span className="max-w-28 truncate">{e.venue}</span></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-[#212121]">{e.registered}/{e.capacity}</div>
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1"><div className="h-full bg-[#D32F2F] rounded-full" style={{ width: `${pct}%` }} /></div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#212121]">{e.fee}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[e.status]}`}>{e.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/admin/events/${e.id}`)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={13} /></button>
                        <button onClick={() => navigate(`/admin/events/${e.id}/edit`)} className="p-1.5 text-[#FBC02D] hover:bg-yellow-50 rounded-lg"><Edit size={13} /></button>
                        <button onClick={() => setDeleteId(e.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
          <span className="text-xs text-[#616161]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F]"><ChevronLeft size={13} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium ${page === p ? 'bg-[#D32F2F] text-white' : 'border border-gray-200 hover:border-[#D32F2F]'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F]"><ChevronRight size={13} /></button>
          </div>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={18} className="text-[#D32F2F]" /></div>
            <h3 className="font-bold text-[#212121] mb-2">Delete Event?</h3>
            <p className="text-sm text-[#616161] mb-5">All registrations and data for this event will be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
