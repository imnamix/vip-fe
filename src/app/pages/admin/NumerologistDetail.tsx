import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, Star, Phone, Mail, MapPin, Award, TrendingUp, Users, DollarSign, CheckCircle, Clock, Edit, Save, Plus, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jun', sales: 12, commission: 1.2 },
  { month: 'Jul', sales: 18, commission: 1.8 },
  { month: 'Aug', sales: 22, commission: 2.4 },
  { month: 'Sep', sales: 19, commission: 2.0 },
  { month: 'Oct', sales: 28, commission: 3.1 },
  { month: 'Nov', sales: 31, commission: 3.4 },
];

const recentLeads = [
  { id: 'INQ-02001', name: 'Rohit Sharma', city: 'Mumbai', amount: '₹1,89,999', status: 'Delivered', date: 'Nov 12' },
  { id: 'INQ-02005', name: 'Sunita Rao', city: 'Delhi', amount: '₹49,999', status: 'Paid', date: 'Nov 10' },
  { id: 'INQ-02009', name: 'Nikhil Jain', city: 'Pune', amount: '₹2,49,000', status: 'Number Confirmed', date: 'Nov 9' },
  { id: 'INQ-02013', name: 'Ajay Singh', city: 'Chennai', amount: '₹99,000', status: 'Pending', date: 'Nov 8' },
  { id: 'INQ-02017', name: 'Priti Patel', city: 'Bangalore', amount: '₹3,99,000', status: 'Dispatched', date: 'Nov 7' },
];

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700',
  Paid: 'bg-teal-100 text-teal-700',
  Dispatched: 'bg-purple-100 text-purple-700',
  'Number Confirmed': 'bg-blue-100 text-blue-700',
  Pending: 'bg-orange-100 text-orange-700',
};

function getMockNumerologist(id: string) {
  const names = ['Dr. Arjun Sharma', 'Priya Mehta', 'Rahul Verma', 'Sonal Gupta', 'Kiran Patel'];
  const i = parseInt(id.replace('NUM-', '')) - 100;
  const n = Math.abs(i % names.length);
  return {
    id,
    name: names[n],
    referralCode: `VIP-${String(10001 + Math.abs(i)).padStart(5, '0')}`,
    mobile: `+91 ${9900000000 + Math.abs(i)}`,
    email: names[n].split(' ')[0].toLowerCase() + `${Math.abs(i)}@numerology.com`,
    city: ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'][Math.abs(i % 5)],
    specialisation: 'Vedic Numerology & Business Numbers',
    experience: '12 years',
    certification: 'Certified Vedic Numerologist — AIN, 2014',
    status: 'Active',
    rating: 4.9,
    totalSales: 342,
    totalRevenue: '₹12.4L',
    pendingCommission: '₹28,400',
    totalCommission: '₹1.2L',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    joinedDate: 'Jan 15, 2021',
    notes: [
      { author: 'Admin', text: 'Top performer Q3 2024. Awarded Star Numerologist badge.', time: '1 month ago' },
      { author: 'HR', text: 'Annual performance review completed. Rating: Exceptional.', time: '3 months ago' },
    ],
    timeline: [
      { date: 'Jan 15, 2021', action: 'Joined VIP Numerology as certified numerologist', user: 'System' },
      { date: 'Mar 2021', action: 'First client consultation completed successfully', user: '' },
      { date: 'Dec 2021', action: 'Reached 50 clients milestone — Gold tier unlocked', user: 'System' },
      { date: 'Jun 2023', action: 'Promoted to Senior Numerologist', user: 'Admin' },
      { date: 'Sep 2024', action: 'Top performer for Q3 2024', user: 'System' },
    ],
  };
}

export default function NumerologistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [num, setNum] = useState(() => getMockNumerologist(id || 'NUM-0100'));
  const [newNote, setNewNote] = useState('');
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const addNote = () => {
    if (!newNote.trim()) return;
    setNum(n => ({ ...n, notes: [...n.notes, { author: 'Admin', text: newNote, time: 'Just now' }] }));
    setNewNote('');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/numerologists')} className="flex items-center gap-2 text-[#616161] hover:text-[#D32F2F] text-sm font-medium">
          <ChevronLeft size={16} /> Back to Numerologists
        </button>
        <div className="ml-auto flex gap-2">
          <button className="px-4 py-2 border border-gray-200 text-[#616161] rounded-xl text-sm hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">Edit Profile</button>
          <button className={`px-4 py-2 rounded-xl text-sm font-semibold ${num.status === 'Active' ? 'bg-red-50 text-[#D32F2F] hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
            {num.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-5 mb-6">
              <img src={num.img} alt={num.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-[#FFF8E1]" />
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{num.name}</h2>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{num.status}</span>
                </div>
                <div className="text-[#616161] text-sm mb-2">{num.specialisation}</div>
                <div className="flex items-center gap-3 flex-wrap text-sm">
                  <div className="flex items-center gap-1"><Star size={13} className="text-[#FBC02D] fill-current" /><span className="font-semibold">{num.rating} Rating</span></div>
                  <div className="text-[#616161]">·</div>
                  <span className="font-mono text-[#D32F2F] text-xs font-bold">{num.referralCode}</span>
                  <div className="text-[#616161]">·</div>
                  <span className="text-[#616161] text-xs">{num.experience} experience</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                [<Phone size={13} />, 'Mobile', num.mobile],
                [<Mail size={13} />, 'Email', num.email],
                [<MapPin size={13} />, 'City', num.city],
                [<Award size={13} />, 'Certification', num.certification],
                [<Clock size={13} />, 'Joined', num.joinedDate],
              ].map(([icon, label, value], i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#616161] mb-1"><span className="text-[#D32F2F]">{icon as React.ReactNode}</span>{label as string}</div>
                  <div className="font-semibold text-[#212121] text-xs truncate">{value as string}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              [TrendingUp, 'Total Sales', num.totalSales.toString(), '#D32F2F'],
              [DollarSign, 'Total Revenue', num.totalRevenue, '#4CAF50'],
              [Users, 'Pending Commission', num.pendingCommission, '#FF9800'],
              [Award, 'Total Commission', num.totalCommission, '#9C27B0'],
            ] as [React.ElementType, string, string, string][]).map(([StatIcon, label, value, color], i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: color + '15' }}>
                  <StatIcon size={16} style={{ color }} />
                </div>
                <div className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</div>
                <div className="text-xs text-[#616161]">{label}</div>
              </div>
            ))}
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#212121] mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Monthly Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="sales" name="Sales" fill="#D32F2F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" name="Commission (L)" fill="#FBC02D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Recent Leads</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 rounded-xl">
                    {['ID', 'Client', 'City', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[#616161] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map(l => (
                    <tr key={l.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/inquiries/${l.id}`)}>
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F]">{l.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{l.name}</td>
                      <td className="px-4 py-3 text-sm text-[#616161]">{l.city}</td>
                      <td className="px-4 py-3 text-sm font-bold">{l.amount}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[l.status] || 'bg-gray-100 text-gray-600'}`}>{l.status}</span></td>
                      <td className="px-4 py-3 text-xs text-[#616161]">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Notes</h3>
            <div className="space-y-3 mb-4">
              {num.notes.map((n, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-[#D32F2F]">{n.author}</span>
                    <span className="text-xs text-[#616161]">{n.time}</span>
                  </div>
                  <p className="text-sm text-[#616161]">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                onKeyDown={e => e.key === 'Enter' && addNote()} />
              <button onClick={addNote} className="px-3 py-2 bg-[#D32F2F] text-white rounded-xl"><Plus size={14} /></button>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Career Timeline</h3>
            <div className="space-y-4">
              {num.timeline.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] mt-1.5" />
                    {i < num.timeline.length - 1 && <div className="absolute top-4 left-1 w-0.5 h-8 bg-gray-200" />}
                  </div>
                  <div>
                    <p className="text-sm text-[#212121]">{t.action}</p>
                    <div className="text-xs text-[#616161] mt-0.5">{t.date}{t.user && ` · ${t.user}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                [<Phone size={13} />, 'Call Numerologist', 'bg-blue-50 text-blue-600 hover:bg-blue-100'],
                [<MessageSquare size={13} />, 'Send WhatsApp', 'bg-green-50 text-green-700 hover:bg-green-100'],
                [<DollarSign size={13} />, 'Pay Commission', 'bg-[#FFF8E1] text-[#FBC02D] hover:bg-yellow-100'],
                [<CheckCircle size={13} />, 'View All Leads', 'bg-red-50 text-[#D32F2F] hover:bg-red-100'],
              ].map(([icon, label, cls], i) => (
                <button key={i} className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${cls}`}>
                  {icon as React.ReactNode}{label as string}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
