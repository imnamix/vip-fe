import { useState } from 'react';
import { Mail, MessageCircle, Send, CheckCircle, XCircle, Clock, BarChart3, RefreshCw } from 'lucide-react';

type NotifType = 'Email' | 'WhatsApp';
type NotifStatus = 'Sent' | 'Delivered' | 'Read' | 'Failed';

const statusColors: Record<NotifStatus, { bg: string; text: string; icon: typeof CheckCircle }> = {
  Sent: { bg: '#E3F2FD', text: '#2196F3', icon: Send },
  Delivered: { bg: '#E8F5E9', text: '#4CAF50', icon: CheckCircle },
  Read: { bg: '#E0F2F1', text: '#009688', icon: CheckCircle },
  Failed: { bg: '#FFEBEE', text: '#F44336', icon: XCircle },
};

const notificationTypes = [
  'Booking Confirmation',
  'Payment Received',
  'Delivery Update',
  'Commission Approved',
  'Event Reminder',
  'Consultation Scheduled',
  'OTP Verification',
  'Welcome Message',
];

const logs = Array.from({ length: 40 }, (_, i) => ({
  id: `MSG-${String(9001 + i).padStart(5, '0')}`,
  type: (['Email', 'WhatsApp'] as NotifType[])[i % 2],
  recipient: ['Rohit Sharma', 'Kavita Singh', 'Anil Bhatt', 'Sunita Rao', 'Nikhil Jain'][i % 5],
  contact: i % 2 === 0 ? `user${i}@gmail.com` : `+91 ${9600000000 + i}`,
  subject: notificationTypes[i % notificationTypes.length],
  status: (['Sent', 'Delivered', 'Read', 'Failed', 'Delivered', 'Read'] as NotifStatus[])[i % 6],
  sentAt: `Nov ${(i % 28) + 1}, 2024 ${9 + (i % 12)}:${String(i % 60).padStart(2, '0')} ${i % 2 === 0 ? 'AM' : 'PM'}`,
  template: notificationTypes[i % notificationTypes.length],
}));

const analytics = [
  { label: 'Total Sent', value: '8,245', change: '+12%', color: '#2196F3', icon: Send },
  { label: 'Delivered', value: '7,891', change: '+8%', color: '#4CAF50', icon: CheckCircle },
  { label: 'Read', value: '6,234', change: '+15%', color: '#009688', icon: CheckCircle },
  { label: 'Failed', value: '354', change: '-3%', color: '#F44336', icon: XCircle },
  { label: 'Email Rate', value: '95.7%', change: '+1.2%', color: '#9C27B0', icon: Mail },
  { label: 'WhatsApp Rate', value: '98.2%', change: '+0.8%', color: '#25D366', icon: MessageCircle },
];

const PAGE_SIZE = 12;

export default function Notifications() {
  const [tab, setTab] = useState<'All' | NotifType>('All');
  const [statusFilter, setStatusFilter] = useState<NotifStatus | 'All'>('All');
  const [page, setPage] = useState(1);

  const filtered = logs.filter(l =>
    (tab === 'All' || l.type === tab) &&
    (statusFilter === 'All' || l.status === statusFilter)
  );

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Notifications Centre</h1>
          <p className="text-[#616161] text-sm">Email and WhatsApp communication logs</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[#616161] rounded-xl text-sm hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {analytics.map(a => {
          const Icon = a.icon;
          return (
            <div key={a.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: a.color + '15' }}>
                <Icon size={16} style={{ color: a.color }} />
              </div>
              <div className="font-bold text-[#212121] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{a.value}</div>
              <div className="text-xs text-[#616161] mt-0.5">{a.label}</div>
              <div className={`text-xs font-medium mt-0.5 ${a.change.startsWith('+') ? 'text-green-500' : 'text-[#D32F2F]'}`}>{a.change}</div>
            </div>
          );
        })}
      </div>

      {/* Delivery Rate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { type: 'Email', icon: Mail, color: '#2196F3', stats: [{ l: 'Sent', v: '4,120' }, { l: 'Delivered', v: '3,938' }, { l: 'Read', v: '2,847' }, { l: 'Failed', v: '182' }] },
          { type: 'WhatsApp', icon: MessageCircle, color: '#25D366', stats: [{ l: 'Sent', v: '4,125' }, { l: 'Delivered', v: '3,953' }, { l: 'Read', v: '3,387' }, { l: 'Failed', v: '172' }] },
        ].map(ch => {
          const Icon = ch.icon;
          return (
            <div key={ch.type} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: ch.color + '15' }}>
                  <Icon size={18} style={{ color: ch.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{ch.type} Analytics</h3>
                  <p className="text-xs text-[#616161]">Last 30 days</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {ch.stats.map(s => (
                  <div key={s.l} className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="font-bold text-[#212121] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.v}</div>
                    <div className="text-xs text-[#616161]">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {(['All', 'Email', 'WhatsApp'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${tab === t ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'}`}
              >
                {t === 'Email' && <Mail size={12} />}
                {t === 'WhatsApp' && <MessageCircle size={12} />}
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {(['All', 'Sent', 'Delivered', 'Read', 'Failed'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#212121] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID', 'Type', 'Recipient', 'Subject', 'Status', 'Sent At'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(l => {
                const c = statusColors[l.status];
                const StatusIcon = c.icon;
                return (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">{l.id}</td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-lg ${l.type === 'Email' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-700'}`}>
                        {l.type === 'Email' ? <Mail size={11} /> : <MessageCircle size={11} />}
                        {l.type}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#212121]">{l.recipient}</div>
                      <div className="text-xs text-[#616161]">{l.contact}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#616161]">{l.subject}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg w-fit" style={{ background: c.bg, color: c.text }}>
                        <StatusIcon size={11} />
                        {l.status}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">{l.sentAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-4 flex items-center justify-between border-t border-gray-100">
          <span className="text-sm text-[#616161]">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">Prev</button>
            <span className="px-3 py-1.5 text-sm text-[#616161]">{page} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
