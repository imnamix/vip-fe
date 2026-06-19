import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Edit, Users, Calendar, MapPin, IndianRupee, Search } from 'lucide-react';
import { useState } from 'react';

const registrations = Array.from({ length: 24 }, (_, i) => ({
  id: `REG-${String(1001 + i).padStart(5, '0')}`,
  name: ['Rohit Sharma', 'Kavita Desai', 'Anil Bhatt', 'Sunita Rao', 'Nikhil Jain', 'Divya Nair', 'Ravi Gupta', 'Leena Mehta'][i % 8],
  mobile: `+91 970000${String(i).padStart(4, '0')}`,
  email: `user${i}@email.com`,
  city: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'][i % 5],
  registeredAt: `Aug ${(i % 14) + 1}, 2024`,
  paymentStatus: ['Paid', 'Paid', 'Paid', 'Pending'][i % 4] as 'Paid' | 'Pending',
  ticketType: ['Standard', 'VIP'][i % 2],
}));

const mockEvent = {
  id: 'EVT-001',
  title: 'Numerology Masterclass 2024',
  date: 'Aug 15, 2024',
  time: '10:00 AM – 5:00 PM',
  venue: 'The Westin, Pune',
  capacity: 200,
  registered: 153,
  fee: '₹4,999',
  status: 'Upcoming',
  img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=300&fit=crop',
  description: 'A full-day intensive masterclass covering Vedic numerology fundamentals, VIP number selection, business applications, and live case studies.',
};

const PAGE_SIZE = 10;

export default function EventView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [payFilter, setPayFilter] = useState('All');

  const filtered = registrations.filter(r =>
    (payFilter === 'All' || r.paymentStatus === payFilter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) || r.mobile.includes(search))
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const revenue = registrations.filter(r => r.paymentStatus === 'Paid').length * 4999;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button onClick={() => navigate('/admin/events')} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium">
          <ChevronLeft size={15} /> Events
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-[#212121] font-semibold">{id}</span>
        <button onClick={() => navigate(`/admin/events/${id}/edit`)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-[#616161] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:text-[#D32F2F]">
          <Edit size={13} /> Edit Event
        </button>
      </div>

      {/* Hero */}
      <div className="relative h-44 rounded-2xl overflow-hidden mb-5">
        <img src={mockEvent.img} alt={mockEvent.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-5">
          <div className="inline-block bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-1">{mockEvent.status}</div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{mockEvent.title}</h1>
        </div>
      </div>

      {/* Details + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#212121] mb-3 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Event Info</h3>
          <div className="space-y-2.5">
            {[[<Calendar size={13} />, mockEvent.date + ' · ' + mockEvent.time], [<MapPin size={13} />, mockEvent.venue], [<IndianRupee size={13} />, `Fee: ${mockEvent.fee}`], [<Users size={13} />, `${mockEvent.registered} / ${mockEvent.capacity} registered`]].map(([icon, val], i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#616161]">
                <span className="text-[#D32F2F]">{icon as React.ReactNode}</span>{val as string}
              </div>
            ))}
          </div>
          <p className="text-sm text-[#616161] mt-4 leading-relaxed">{mockEvent.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            ['Registered', mockEvent.registered, '#2196F3'],
            ['Seats Left', mockEvent.capacity - mockEvent.registered, '#4CAF50'],
            ['Revenue', `₹${revenue.toLocaleString()}`, '#D32F2F'],
            ['Paid', registrations.filter(r => r.paymentStatus === 'Paid').length, '#009688'],
          ].map(([label, value, color]) => (
            <div key={label as string} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: color as string }}>{value}</div>
              <div className="text-xs text-[#616161] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <h3 className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Registrations</h3>
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..."
              className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] w-44" />
          </div>
          <div className="flex gap-2">
            {['All', 'Paid', 'Pending'].map(s => (
              <button key={s} onClick={() => { setPayFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${payFilter === s ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Reg ID', 'Name', 'Mobile', 'City', 'Ticket', 'Registered', 'Payment'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">{r.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#212121] whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-[#616161]">{r.mobile}</td>
                  <td className="px-4 py-3 text-sm text-[#616161]">{r.city}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.ticketType === 'VIP' ? 'bg-[#FFF8E1] text-[#FBC02D]' : 'bg-gray-100 text-gray-600'}`}>{r.ticketType}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#616161]">{r.registeredAt}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{r.paymentStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
          <span className="text-xs text-[#616161]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:border-[#D32F2F]">Prev</button>
            <span className="px-3 py-1.5 text-xs text-[#616161]">{page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:border-[#D32F2F]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
