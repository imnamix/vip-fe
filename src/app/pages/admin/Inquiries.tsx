import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, LayoutGrid, List, Eye, Edit, Clock, Plus, X } from 'lucide-react';

type Status = 'Pending' | 'Number Suggested' | 'Number Confirmed' | 'Awaiting Payment' | 'Paid' | 'Dispatched' | 'Delivered';

const statuses: Status[] = ['Pending', 'Number Suggested', 'Number Confirmed', 'Awaiting Payment', 'Paid', 'Dispatched', 'Delivered'];

const statusColors: Record<Status, { bg: string; text: string; border: string }> = {
  'Pending': { bg: '#FFF3E0', text: '#FF9800', border: '#FFE0B2' },
  'Number Suggested': { bg: '#E3F2FD', text: '#2196F3', border: '#BBDEFB' },
  'Number Confirmed': { bg: '#E8F5E9', text: '#4CAF50', border: '#C8E6C9' },
  'Awaiting Payment': { bg: '#FFF8E1', text: '#FBC02D', border: '#FFF9C4' },
  'Paid': { bg: '#E0F2F1', text: '#009688', border: '#B2DFDB' },
  'Dispatched': { bg: '#F3E5F5', text: '#9C27B0', border: '#E1BEE7' },
  'Delivered': { bg: '#E8F5E9', text: '#388E3C', border: '#C8E6C9' },
};

const names = ['Rohit Sharma', 'Kavita Desai', 'Anil Bhatt', 'Sunita Rao', 'Nikhil Jain', 'Divya Nair', 'Ravi Gupta', 'Leena Mehta', 'Prakash Iyer', 'Neha Kapoor', 'Ajay Singh', 'Swati Kumar', 'Manoj Verma', 'Priti Patel', 'Sanjay Reddy'];

const inquiries = Array.from({ length: 30 }, (_, i) => ({
  id: `INQ-${String(2001 + i).padStart(5, '0')}`,
  name: names[i % names.length],
  mobile: `+91 ${9700000000 + i}`,
  email: names[i % names.length].split(' ')[0].toLowerCase() + `${i}@gmail.com`,
  status: statuses[i % statuses.length],
  vipNumber: ['9999988888', '8888877777', '7777766666', '6666655555', '5555544444'][i % 5],
  date: `${['Jul', 'Aug', 'Sep', 'Oct', 'Nov'][i % 5]} ${(i % 28) + 1}, 2024`,
  amount: `₹${((i + 1) * 9999).toLocaleString()}`,
  city: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'][i % 5],
  source: ['Website', 'WhatsApp', 'Referral', 'Event'][i % 4],
  note: 'Wants premium 9-series number for business expansion.',
}));

const emptyForm = { name: '', mobile: '', email: '', city: '', vipNumber: '', amount: '', source: 'Website', note: '' };

export default function Inquiries() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [leads, setLeads] = useState(inquiries);
  const navigate = useNavigate();

  const filtered = leads.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.id.includes(search.toUpperCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead = {
      ...form,
      id: `INQ-${String(3001 + leads.length).padStart(5, '0')}`,
      status: 'Pending' as Status,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setLeads(p => [newLead, ...p]);
    setForm(emptyForm);
    setAddOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Inquiries</h1>
          <p className="text-[#616161] text-sm">{filtered.length} inquiries total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] w-44" />
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button onClick={() => setView('kanban')} className={`p-1.5 rounded-lg transition-colors ${view === 'kanban' ? 'bg-white text-[#D32F2F] shadow-sm' : 'text-[#616161]'}`}><LayoutGrid size={15} /></button>
            <button onClick={() => setView('table')} className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-white text-[#D32F2F] shadow-sm' : 'text-[#616161]'}`}><List size={15} /></button>
          </div>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors">
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map(s => {
          const count = filtered.filter(i => i.status === s).length;
          const c = statusColors[s];
          return (
            <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
              {s} <span className="font-bold">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map(s => {
            const cards = filtered.filter(i => i.status === s);
            const c = statusColors[s];
            return (
              <div key={s} className="flex-shrink-0 w-60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{s}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>{cards.length}</span>
                </div>
                <div className="space-y-3">
                  {cards.map(inq => (
                    <div key={inq.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/admin/inquiries/${inq.id}`)}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-semibold text-[#D32F2F]">{inq.id}</span>
                        <button className="p-1 text-blue-500 hover:bg-blue-50 rounded" onClick={e => { e.stopPropagation(); navigate(`/admin/inquiries/${inq.id}`); }}>
                          <Eye size={11} />
                        </button>
                      </div>
                      <div className="font-semibold text-[#212121] text-sm mb-1">{inq.name}</div>
                      <div className="text-xs text-[#616161] mb-2">{inq.city} · {inq.mobile}</div>
                      <div className="font-mono text-xs font-bold text-[#D32F2F] bg-red-50 px-2 py-1 rounded-lg mb-2">{inq.vipNumber}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#212121] font-bold text-sm">{inq.amount}</span>
                        <div className="flex items-center gap-1 text-xs text-[#616161]"><Clock size={10} />{inq.date}</div>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-400 border-2 border-dashed border-gray-200">No inquiries</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {view === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID', 'Name', 'Mobile', 'City', 'VIP Number', 'Amount', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inq => {
                  const c = statusColors[inq.status];
                  return (
                    <tr key={inq.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/inquiries/${inq.id}`)}>
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">{inq.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[#212121] whitespace-nowrap">{inq.name}</td>
                      <td className="px-4 py-3 text-sm text-[#616161]">{inq.mobile}</td>
                      <td className="px-4 py-3 text-sm text-[#616161]">{inq.city}</td>
                      <td className="px-4 py-3 text-xs font-mono font-bold">{inq.vipNumber}</td>
                      <td className="px-4 py-3 text-sm font-bold">{inq.amount}</td>
                      <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">{inq.date}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ background: c.bg, color: c.text }}>{inq.status}</span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" onClick={() => navigate(`/admin/inquiries/${inq.id}`)}><Eye size={13} /></button>
                          <button className="p-1.5 text-[#FBC02D] hover:bg-yellow-50 rounded-lg"><Edit size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setAddOpen(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Add New Lead</h3>
              <button onClick={() => setAddOpen(false)} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200"><X size={15} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[['Full Name *', 'name', 'text'], ['Mobile Number *', 'mobile', 'tel'], ['Email *', 'email', 'email'], ['City *', 'city', 'text'], ['VIP Number Interest', 'vipNumber', 'text'], ['Expected Amount', 'amount', 'text']].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">{label}</label>
                    <input type={type} required={label.includes('*')} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#212121] mb-1">Source</label>
                <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                  {['Website', 'WhatsApp', 'Referral', 'Event', 'Social Media', 'Cold Call'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#212121] mb-1">Notes</label>
                <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:border-[#D32F2F]">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C]">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
