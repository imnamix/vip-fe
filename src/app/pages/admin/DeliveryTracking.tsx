import { useState } from 'react';
import { Package, Truck, MapPin, CheckCircle, Clock, Search, Edit, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

type DeliveryStatus = 'Pending' | 'Packed' | 'Dispatched' | 'In Transit' | 'Delivered';
const ALL_STATUS: DeliveryStatus[] = ['Pending', 'Packed', 'Dispatched', 'In Transit', 'Delivered'];

const statusMeta: Record<DeliveryStatus, { bg: string; text: string; icon: typeof Package }> = {
  Pending: { bg: '#FFF3E0', text: '#FF9800', icon: Clock },
  Packed: { bg: '#E3F2FD', text: '#2196F3', icon: Package },
  Dispatched: { bg: '#F3E5F5', text: '#9C27B0', icon: Truck },
  'In Transit': { bg: '#FFF8E1', text: '#FBC02D', icon: Truck },
  Delivered: { bg: '#E8F5E9', text: '#388E3C', icon: CheckCircle },
};

const carriers = ['Bluedart', 'Delhivery', 'FedEx', 'DTDC', 'Ecom Express'];

const initDeliveries = Array.from({ length: 20 }, (_, i) => ({
  id: `DEL-${String(3001 + i).padStart(5, '0')}`,
  orderId: `ORD-${String(7001 + i).padStart(5, '0')}`,
  customer: ['Rohit Sharma', 'Kavita Singh', 'Anil Bhatt', 'Sunita Rao', 'Nikhil Jain', 'Divya Nair', 'Ravi Gupta'][i % 7],
  mobile: `+91 ${9600000000 + i}`,
  vipNumber: ['9999988888', '8888877777', '7777766666'][i % 3],
  address: ['402, Serenity Apts, Baner, Pune 411045', 'B-12, Andheri West, Mumbai 400058', '301, Green Park, New Delhi 110016'][i % 3],
  carrier: carriers[i % carriers.length],
  trackingNo: `BD${String(100000000 + i * 12345)}`,
  status: ALL_STATUS[i % ALL_STATUS.length] as DeliveryStatus,
  orderDate: `Nov ${(i % 28) + 1}, 2024`,
  estimatedDelivery: `Nov ${(i % 28) + 5}, 2024`,
  notes: '',
}));

const PAGE_SIZE = 8;

export default function DeliveryTracking() {
  const [deliveries, setDeliveries] = useState(initDeliveries);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DeliveryStatus | 'All'>('All');
  const [page, setPage] = useState(1);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<typeof initDeliveries[0]>>({});

  const filtered = deliveries.filter(d =>
    (filter === 'All' || d.status === filter) &&
    (d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.id.includes(search.toUpperCase()) ||
      d.trackingNo.includes(search))
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (d: typeof initDeliveries[0]) => { setEditId(d.id); setEditForm({ ...d }); };
  const saveEdit = () => {
    setDeliveries(ds => ds.map(d => d.id === editId ? { ...d, ...editForm } as typeof d : d));
    setEditId(null);
  };

  const summary = ALL_STATUS.map(s => ({ status: s, count: deliveries.filter(d => d.status === s).length }));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Delivery Tracking</h1>
        <p className="text-[#616161] text-xs">Track and update all VIP number deliveries</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[{ status: 'All' as const, count: deliveries.length }, ...summary].map(s => {
          const meta = s.status === 'All' ? null : statusMeta[s.status];
          const active = filter === s.status;
          return (
            <button key={s.status}
              onClick={() => { setFilter(s.status as typeof filter); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${active ? 'border-current shadow-sm' : 'border-transparent'}`}
              style={meta ? { background: meta.bg, color: meta.text } : { background: active ? '#212121' : '#f3f4f6', color: active ? '#fff' : '#616161' }}
            >
              {s.status} <span className="font-bold">{s.count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4">
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Customer, ID, tracking number..."
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Delivery ID', 'Customer', 'VIP Number', 'Carrier / Tracking', 'Status', 'Est. Delivery', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(d => {
                const meta = statusMeta[d.status];
                const StatusIcon = meta.icon;
                return (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-xs font-mono font-bold text-[#D32F2F]">{d.id}</div>
                      <div className="text-xs text-[#616161]">{d.orderId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#212121] whitespace-nowrap">{d.customer}</div>
                      <div className="text-xs text-[#616161] flex items-center gap-1"><MapPin size={10} /><span className="max-w-32 truncate">{d.address}</span></div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-[#D32F2F]">{d.vipNumber}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#212121]">{d.carrier}</div>
                      <div className="text-xs text-[#616161] font-mono">{d.trackingNo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-xl w-fit" style={{ background: meta.bg, color: meta.text }}>
                        <StatusIcon size={11} />{d.status}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#616161]">{d.estimatedDelivery}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(d)} className="p-1.5 text-[#FBC02D] hover:bg-yellow-50 rounded-lg"><Edit size={13} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
          <span className="text-xs text-[#616161]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F]"><ChevronLeft size={12} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs ${page === p ? 'bg-[#D32F2F] text-white' : 'border border-gray-200 hover:border-[#D32F2F]'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F]"><ChevronRight size={12} /></button>
          </div>
        </div>
      </div>

      {/* Edit Drawer / Modal */}
      {editId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Update Delivery</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#D32F2F]">{editId}</span>
                <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X size={14} /></button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_STATUS.map(s => {
                    const m = statusMeta[s];
                    const active = editForm.status === s;
                    return (
                      <button key={s} onClick={() => setEditForm(f => ({ ...f, status: s }))}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border-2 ${active ? 'border-current' : 'border-transparent'}`}
                        style={{ background: m.bg, color: m.text }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Carrier */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Carrier</label>
                <select value={editForm.carrier || ''} onChange={e => setEditForm(f => ({ ...f, carrier: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                  {carriers.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Tracking */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Tracking Number</label>
                <input value={editForm.trackingNo || ''} onChange={e => setEditForm(f => ({ ...f, trackingNo: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] font-mono" />
              </div>

              {/* Est. Delivery */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Estimated Delivery Date</label>
                <input type="date" value={editForm.estimatedDelivery || ''} onChange={e => setEditForm(f => ({ ...f, estimatedDelivery: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Notes</label>
                <textarea value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" placeholder="Delivery notes..." />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditId(null)} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C]">
                <Save size={13} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
