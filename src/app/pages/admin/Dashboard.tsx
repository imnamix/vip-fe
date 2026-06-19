import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, UserCheck, IndianRupee, MessageSquare, Calendar, Truck, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const monthlyRevenue = [
  { month: 'Jan', revenue: 8.2, inquiries: 142 },
  { month: 'Feb', revenue: 9.1, inquiries: 168 },
  { month: 'Mar', revenue: 11.4, inquiries: 195 },
  { month: 'Apr', revenue: 10.2, inquiries: 177 },
  { month: 'May', revenue: 13.5, inquiries: 224 },
  { month: 'Jun', revenue: 15.2, inquiries: 258 },
  { month: 'Jul', revenue: 12.8, inquiries: 214 },
  { month: 'Aug', revenue: 17.4, inquiries: 289 },
  { month: 'Sep', revenue: 16.1, inquiries: 267 },
  { month: 'Oct', revenue: 19.3, inquiries: 312 },
  { month: 'Nov', revenue: 18.7, inquiries: 298 },
  { month: 'Dec', revenue: 22.1, inquiries: 345 },
];

const inquiryStatus = [
  { name: 'Delivered', value: 3842, color: '#4CAF50' },
  { name: 'In Progress', value: 1245, color: '#FBC02D' },
  { name: 'Pending', value: 645, color: '#FF9800' },
  { name: 'Cancelled', value: 218, color: '#F44336' },
];

const topNumerologists = [
  { name: 'Dr. Arjun Sharma', city: 'Pune', sales: 342, commission: '₹1.2L', rating: 4.9, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop' },
  { name: 'Priya Mehta', city: 'Mumbai', sales: 289, commission: '₹98K', rating: 4.8, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop' },
  { name: 'Rahul Verma', city: 'Delhi', sales: 267, commission: '₹91K', rating: 4.7, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop' },
  { name: 'Sonal Gupta', city: 'Bangalore', sales: 241, commission: '₹84K', rating: 4.8, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop' },
  { name: 'Kiran Patel', city: 'Ahmedabad', sales: 218, commission: '₹76K', rating: 4.6, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop' },
];

const recentActivities = [
  { time: '2 min ago', action: 'New inquiry from Rohit Sharma, Pune', type: 'inquiry' },
  { time: '8 min ago', action: 'VIP Number 9999988888 booked by Ananya Reddy', type: 'booking' },
  { time: '15 min ago', action: 'Commission approved for Priya Mehta — ₹12,400', type: 'commission' },
  { time: '32 min ago', action: 'Delivery dispatched: Order #VIP-2847 to Mumbai', type: 'delivery' },
  { time: '1 hr ago', action: 'New numerologist registered: Deepak Joshi, Chennai', type: 'registration' },
  { time: '2 hrs ago', action: 'Event registration: Numerology Masterclass — 15 new signups', type: 'event' },
  { time: '3 hrs ago', action: 'Payment received: ₹4,99,000 for 9999999999 — Suresh Kumar', type: 'payment' },
];

const activityColors: Record<string, string> = {
  inquiry: '#FBC02D',
  booking: '#D32F2F',
  commission: '#4CAF50',
  delivery: '#2196F3',
  registration: '#9C27B0',
  event: '#FF9800',
  payment: '#4CAF50',
};

const statCards = [
  { label: 'Total Customers', value: '12,450', change: '+8.2%', up: true, icon: Users, color: '#D32F2F', bg: '#FFF8E1' },
  { label: 'Total Numerologists', value: '240', change: '+12.5%', up: true, icon: UserCheck, color: '#9C27B0', bg: '#F3E5F5' },
  { label: 'Total Revenue', value: '₹1.25 Cr', change: '+18.3%', up: true, icon: IndianRupee, color: '#4CAF50', bg: '#E8F5E9' },
  { label: 'Pending Inquiries', value: '145', change: '-4.1%', up: false, icon: MessageSquare, color: '#FF9800', bg: '#FFF3E0' },
  { label: 'Total Events', value: '32', change: '+6.7%', up: true, icon: Calendar, color: '#2196F3', bg: '#E3F2FD' },
  { label: 'Pending Deliveries', value: '78', change: '+2.3%', up: false, icon: Truck, color: '#F44336', bg: '#FFEBEE' },
  { label: 'Pending Commissions', value: '₹4.8L', change: '+9.1%', up: true, icon: DollarSign, color: '#009688', bg: '#E0F2F1' },
  { label: 'Avg. Revenue/Sale', value: '₹8,420', change: '+5.4%', up: true, icon: TrendingUp, color: '#FBC02D', bg: '#FFFDE7' },
];

export default function Dashboard() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Dashboard</h1>
        <p className="text-[#616161] text-sm">Welcome back, Super Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? 'text-green-500' : 'text-[#F44336]'}`}>
                  {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {s.change}
                </div>
              </div>
              <div className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</div>
              <div className="text-xs text-[#616161] mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-[#212121] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Monthly Revenue & Inquiries</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop key="rev-top" offset="5%" stopColor="#D32F2F" stopOpacity={0.3} />
                  <stop key="rev-bot" offset="95%" stopColor="#D32F2F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="inqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop key="inq-top" offset="5%" stopColor="#FBC02D" stopOpacity={0.3} />
                  <stop key="inq-bot" offset="95%" stopColor="#FBC02D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area key="area-revenue" type="monotone" dataKey="revenue" name="Revenue (Lakhs)" stroke="#D32F2F" fill="url(#revGrad)" strokeWidth={2} dot={false} />
              <Area key="area-inquiries" type="monotone" dataKey="inquiries" name="Inquiries" stroke="#FBC02D" fill="url(#inqGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Inquiry Status Pie */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-[#212121] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Inquiry Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={inquiryStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {inquiryStatus.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {inquiryStatus.map(s => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[#616161]">{s.name}</span>
                </div>
                <span className="font-semibold text-[#212121]">{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Commission Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-[#212121] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Commission Overview (₹L)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { month: 'Aug', pending: 1.2, approved: 3.4, paid: 8.2 },
              { month: 'Sep', pending: 1.8, approved: 4.1, paid: 9.6 },
              { month: 'Oct', pending: 2.1, approved: 3.8, paid: 11.3 },
              { month: 'Nov', pending: 1.6, approved: 5.2, paid: 10.8 },
              { month: 'Dec', pending: 4.8, approved: 6.4, paid: 12.1 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar key="bar-paid" dataKey="paid" name="Paid" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              <Bar key="bar-approved" dataKey="approved" name="Approved" fill="#FBC02D" radius={[4, 4, 0, 0]} />
              <Bar key="bar-pending" dataKey="pending" name="Pending" fill="#FF9800" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Numerologists */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-[#212121] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Top Performers</h3>
          <div className="space-y-4">
            {topNumerologists.map((n, i) => (
              <div key={n.name} className="flex items-center gap-3">
                <div className="text-[#D32F2F] font-bold text-sm w-5">{i + 1}</div>
                <img src={n.img} alt={n.name} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#212121] text-sm truncate">{n.name}</div>
                  <div className="text-[#616161] text-xs">{n.city} • ⭐ {n.rating}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#212121] font-bold text-sm">{n.commission}</div>
                  <div className="text-[#616161] text-xs">{n.sales} sales</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="font-bold text-[#212121] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: activityColors[a.type] }} />
              <div className="flex-1">
                <p className="text-sm text-[#212121]">{a.action}</p>
              </div>
              <div className="text-xs text-[#616161] whitespace-nowrap">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
