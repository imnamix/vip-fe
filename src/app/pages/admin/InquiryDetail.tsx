import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ChevronLeft, CheckCircle, Clock, Phone, Mail, MapPin, Hash, MessageSquare,
  Truck, Package, User, Plus, AlertCircle, Upload, X, ArrowRight,
  Star, Send, Edit2, IndianRupee, Calendar, ExternalLink, Check
} from 'lucide-react';
import { useAdminTheme } from '../../context/AdminThemeContext';

type Status = 'Pending' | 'Number Suggested' | 'Number Confirmed' | 'Awaiting Payment' | 'Paid' | 'Dispatched' | 'Delivered';

const ALL_STATUSES: Status[] = ['Pending', 'Number Suggested', 'Number Confirmed', 'Awaiting Payment', 'Paid', 'Dispatched', 'Delivered'];

const STATUS_META: Record<Status, {
  color: string; bg: string; border: string; darkBg: string; darkBorder: string; darkText: string;
  icon: React.ElementType; label: string;
}> = {
  'Pending':           { color: '#FF9800', bg: '#FFF3E0', border: '#FFE0B2', darkBg: 'rgba(255,152,0,0.12)',   darkBorder: 'rgba(255,152,0,0.25)',  darkText: '#FFAD42', icon: Clock,        label: 'Lead Received'    },
  'Number Suggested':  { color: '#2196F3', bg: '#E3F2FD', border: '#BBDEFB', darkBg: 'rgba(33,150,243,0.12)',  darkBorder: 'rgba(33,150,243,0.25)', darkText: '#64B5F6', icon: Hash,         label: 'Numbers Suggested'},
  'Number Confirmed':  { color: '#4CAF50', bg: '#E8F5E9', border: '#C8E6C9', darkBg: 'rgba(76,175,80,0.12)',   darkBorder: 'rgba(76,175,80,0.25)',  darkText: '#81C784', icon: CheckCircle,  label: 'Number Confirmed' },
  'Awaiting Payment':  { color: '#FBC02D', bg: '#FFF8E1', border: '#FFF176', darkBg: 'rgba(251,192,45,0.12)',  darkBorder: 'rgba(251,192,45,0.25)', darkText: '#FFD54F', icon: AlertCircle,  label: 'Awaiting Payment' },
  'Paid':              { color: '#009688', bg: '#E0F2F1', border: '#B2DFDB', darkBg: 'rgba(0,150,136,0.12)',   darkBorder: 'rgba(0,150,136,0.25)',  darkText: '#4DB6AC', icon: IndianRupee,  label: 'Payment Received' },
  'Dispatched':        { color: '#9C27B0', bg: '#F3E5F5', border: '#E1BEE7', darkBg: 'rgba(156,39,176,0.12)', darkBorder: 'rgba(156,39,176,0.25)', darkText: '#CE93D8', icon: Package,      label: 'Dispatched'       },
  'Delivered':         { color: '#388E3C', bg: '#E8F5E9', border: '#C8E6C9', darkBg: 'rgba(56,142,60,0.12)',  darkBorder: 'rgba(56,142,60,0.25)',  darkText: '#A5D6A7', icon: Truck,        label: 'Delivered'        },
};

interface SuggestedNumber { number: string; category: string; price: string }
interface Note { author: string; text: string; time: string; type?: 'system' | 'suggested' | 'admin' }
interface TimelineEvent { date: string; action: string; user: string; status?: Status }

function getMockLead(id: string) {
  const names = ['Rohit Sharma', 'Kavita Desai', 'Anil Bhatt', 'Sunita Rao', 'Nikhil Jain'];
  const i = Math.abs(parseInt(id.replace('INQ-', '')) % names.length);
  return {
    id,
    name: names[i],
    mobile: `+919700000${i}0${i}`,
    mobileDisplay: `+91 9700000${i}0${i}`,
    email: names[i].split(' ')[0].toLowerCase() + `@gmail.com`,
    city: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'][i % 5],
    dob: '15 Aug 1988',
    lifePathNumber: 6,
    status: ALL_STATUSES[i % ALL_STATUSES.length] as Status,
    vipNumber: '',
    confirmedNumber: '',
    suggestedNumbers: [] as SuggestedNumber[],
    amount: '₹1,89,999',
    source: 'Website',
    assignedTo: 'Dr. Arjun Sharma',
    createdAt: 'Oct 12, 2024 at 10:30 AM',
    paymentProof: null as null | { text: string; file: string },
    notes: [
      { author: 'System', text: 'Lead auto-assigned based on city proximity.', time: 'Oct 12, 2024', type: 'system' as const },
    ] as Note[],
    timeline: [
      { date: 'Oct 12, 2024', action: 'Lead received from website inquiry form', user: 'System', status: 'Pending' as Status },
    ] as TimelineEvent[],
  };
}

/* ── Confirm Dialog ── */
function ConfirmDialog({ title, message, confirmLabel, confirmColor, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1e2133] rounded-2xl shadow-2xl dark:shadow-black/60 w-full max-w-md overflow-hidden border border-gray-100 dark:border-white/10">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-bold text-[#212121] dark:text-white text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
          <p className="text-sm text-[#616161] dark:text-gray-400 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 px-6 py-4">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: confirmColor }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Suggest Number Popup ── */
function SuggestNumberPopup({ mobile, mobileDisplay, onClose, onSend }: {
  mobile: string; mobileDisplay: string;
  onClose: () => void;
  onSend: (numbers: SuggestedNumber[]) => void;
}) {
  const [rows, setRows] = useState<SuggestedNumber[]>([
    { number: '', category: '', price: '' },
    { number: '', category: '', price: '' },
    { number: '', category: '', price: '' },
  ]);

  const update = (i: number, field: keyof SuggestedNumber, val: string) =>
    setRows(r => r.map((x, j) => j === i ? { ...x, [field]: val } : x));

  const filled = rows.filter(r => r.number.trim());

  const buildWhatsAppText = () => {
    const lines = filled.map((n, i) =>
      `*Option ${i + 1}:* ${n.number}${n.category ? ` (${n.category})` : ''}${n.price ? ` — ${n.price}` : ''}`
    ).join('\n');
    return encodeURIComponent(`Hello! Here are the VIP numbers we've selected for you:\n\n${lines}\n\nPlease confirm your preferred number. 🙏`);
  };

  const handleSend = () => {
    if (filled.length === 0) return;
    onSend(filled);
    window.open(`https://wa.me/${mobile.replace(/\D/g, '')}?text=${buildWhatsAppText()}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1e2133] rounded-2xl shadow-2xl dark:shadow-black/60 w-full max-w-lg overflow-hidden border border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Suggest VIP Numbers</h3>
            <p className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">Add up to 3 numerologically compatible numbers</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-[#616161] dark:text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {rows.map((n, i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-white/10 rounded-xl hover:border-[#D32F2F]/40 dark:hover:border-[#D32F2F]/50 transition-colors bg-gray-50/50 dark:bg-white/3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#D32F2F] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                <span className="text-xs font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider">Option {i + 1}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'VIP Number', field: 'number' as const, placeholder: '9999988888', mono: true },
                  { label: 'Category',   field: 'category' as const, placeholder: 'Wealth Magnet', mono: false },
                  { label: 'Price',      field: 'price' as const,    placeholder: '₹1,99,000', mono: false },
                ].map(({ label, field, placeholder, mono }) => (
                  <div key={field}>
                    <label className="text-[10px] font-semibold text-[#616161] dark:text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
                    <input value={n[field]} onChange={e => update(i, field, e.target.value)}
                      placeholder={placeholder}
                      className={`w-full px-2.5 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#D32F2F] bg-white dark:bg-[#13151e] text-[#212121] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 ${mono ? 'font-mono' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/25 rounded-xl px-3 py-2">
            <MessageSquare size={13} className="flex-shrink-0" />
            <span>Will open WhatsApp for <strong>{mobileDisplay}</strong> with the suggested numbers</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button onClick={handleSend} disabled={filled.length === 0}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40">
              <Send size={14} /> Send on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDark = useAdminTheme();
  const [lead, setLead] = useState(() => getMockLead(id || 'INQ-02001'));
  const [newNote, setNewNote] = useState('');
  const [showSuggestPopup, setShowSuggestPopup] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentText, setPaymentText] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingStatus, setPendingStatus] = useState<{ status: Status; label: string; extra?: Partial<typeof lead> } | null>(null);
  const [editingConfirmed, setEditingConfirmed] = useState(false);
  const [editConfirmedVal, setEditConfirmedVal] = useState('');

  const currentIdx = ALL_STATUSES.indexOf(lead.status);

  const requestStatusChange = (newStatus: Status, label: string, extra?: Partial<typeof lead>) =>
    setPendingStatus({ status: newStatus, label, extra });

  const confirmStatusChange = () => {
    if (!pendingStatus) return;
    const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setLead(l => ({
      ...l, status: pendingStatus.status, ...(pendingStatus.extra || {}),
      timeline: [...l.timeline, { date: now, action: `Status changed to "${STATUS_META[pendingStatus.status].label}"`, user: 'Admin', status: pendingStatus.status }],
    }));
    setPendingStatus(null);
  };

  const handleSuggestSend = (numbers: SuggestedNumber[]) => {
    const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setLead(l => ({
      ...l, status: 'Number Suggested', suggestedNumbers: numbers,
      timeline: [...l.timeline, { date: now, action: 'Numbers suggested and sent via WhatsApp', user: 'Admin', status: 'Number Suggested' as Status }],
      notes: [...l.notes, { author: 'Admin', text: `Suggested ${numbers.length} VIP number(s): ${numbers.map(n => n.number).join(', ')} — sent via WhatsApp.`, time: now, type: 'suggested' as const }],
    }));
  };

  const handleConfirmNumber = (num: string) =>
    requestStatusChange('Number Confirmed', `Confirm "${num}" as the customer's chosen VIP number?`, { confirmedNumber: num, vipNumber: num });

  const handleUpdateConfirmedNumber = () => {
    if (!editConfirmedVal.trim()) return;
    const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setLead(l => ({
      ...l, confirmedNumber: editConfirmedVal, vipNumber: editConfirmedVal,
      notes: [...l.notes, { author: 'Admin', text: `Confirmed number updated to ${editConfirmedVal}`, time: now, type: 'admin' as const }],
    }));
    setEditingConfirmed(false);
    setEditConfirmedVal('');
  };

  const handlePaymentSubmit = () => {
    requestStatusChange('Paid', 'Mark this inquiry as Paid?', { paymentProof: { text: paymentText, file: paymentFile?.name || '' } });
    setShowPaymentForm(false);
    setPaymentText('');
    setPaymentFile(null);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setLead(l => ({ ...l, notes: [...l.notes, { author: 'Admin', text: newNote, time: now, type: 'admin' as const }] }));
    setNewNote('');
  };

  const meta = STATUS_META[lead.status];
  const StatusIcon = meta.icon;

  return (
    <div className="min-h-screen">
      {/* ── Header bar ── */}
      <div className="bg-white dark:bg-[#1a1d26] border border-gray-100 dark:border-white/6 px-5 py-3.5 mb-5 rounded-2xl flex flex-wrap items-center gap-3">
        <button onClick={() => navigate('/admin/inquiries')}
          className="flex items-center gap-1.5 text-[#616161] dark:text-gray-400 hover:text-[#D32F2F] dark:hover:text-[#D32F2F] text-sm font-medium transition-colors">
          <ChevronLeft size={15} /> Inquiries
        </button>
        <span className="text-gray-300 dark:text-white/15">/</span>
        <span className="text-sm text-[#212121] dark:text-white font-mono font-bold">{lead.id}</span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Status badge — dark-aware inline style */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={isDark
              ? { background: meta.darkBg, color: meta.darkText, borderColor: meta.darkBorder }
              : { background: meta.bg,     color: meta.color,    borderColor: meta.border }
            }>
            <StatusIcon size={12} /> {meta.label}
          </div>
          <button onClick={() => window.open(`https://wa.me/${lead.mobile.replace(/\D/g, '')}`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors">
            <MessageSquare size={12} /> WhatsApp
          </button>
          <button onClick={() => window.open(`tel:${lead.mobile}`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
            <Phone size={12} /> Call
          </button>
        </div>
      </div>

      {/* ── Journey Stepper ── */}
      <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 px-6 py-5 mb-5 overflow-x-auto">
        <p className="text-[10px] font-bold text-[#616161] dark:text-gray-500 uppercase tracking-widest mb-4">Customer Journey</p>
        <div className="flex items-start min-w-max gap-0">
          {ALL_STATUSES.map((s, idx) => {
            const m = STATUS_META[s];
            const Icon = m.icon;
            const done = idx < currentIdx;
            const active = idx === currentIdx;

            const timelineEvent = lead.timeline.find(t => t.status === s);

            return (
              <div key={s} className="flex items-start">
                <div className="flex flex-col items-center gap-1.5 w-24">
                  {/* Dot */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done    ? 'text-white' :
                      active  ? 'text-white shadow-lg' :
                                'bg-white dark:bg-[#252836] border-gray-200 dark:border-white/10 text-gray-300 dark:text-gray-600'
                    }`}
                    style={
                      done   ? { backgroundColor: '#4CAF50', borderColor: '#4CAF50' } :
                      active ? {
                        backgroundColor: m.color,
                        borderColor:     m.color,
                        boxShadow: `0 0 0 4px ${isDark ? m.darkBg : m.bg}`,
                      } : {}
                    }
                  >
                    {done ? <Check size={16} strokeWidth={3} /> : <Icon size={15} />}
                  </div>
                  {/* Label */}
                  <div className={`text-center text-[10px] leading-tight font-semibold ${
                    done ? 'text-[#4CAF50]' : active ? 'font-bold' : 'text-gray-400 dark:text-gray-600'
                  }`} style={active ? { color: m.color } : {}}>
                    {m.label}
                  </div>
                  {/* Date */}
                  {timelineEvent
                    ? <div className="text-[9px] text-gray-400 dark:text-gray-600 text-center leading-tight">{timelineEvent.date}</div>
                    : <div className="text-[9px] text-gray-300 dark:text-gray-700 text-center">Pending</div>
                  }
                </div>
                {idx < ALL_STATUSES.length - 1 && (
                  <div className={`w-8 h-0.5 mt-5 mx-1 flex-shrink-0 transition-colors ${done ? 'bg-[#4CAF50]' : 'bg-gray-200 dark:bg-white/8'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* ── LEFT COL ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Customer card */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Customer Info</h3>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100 dark:border-white/6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                {lead.name[0]}
              </div>
              <div>
                <div className="font-bold text-[#212121] dark:text-white text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{lead.name}</div>
                <div className="text-xs text-[#616161] dark:text-gray-400 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Star size={10} className="text-[#FBC02D]" fill="#FBC02D" /> Life Path #{lead.lifePathNumber}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> DOB: {lead.dob}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                [<Phone size={12} />, lead.mobileDisplay],
                [<Mail size={12} />, lead.email],
                [<MapPin size={12} />, lead.city],
                [<User size={12} />, `Assigned: ${lead.assignedTo}`],
              ] as [React.ReactNode, string][]).map(([icon, val], i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#616161] dark:text-gray-400 bg-gray-50 dark:bg-white/4 rounded-xl px-3 py-2.5">
                  <span className="text-[#D32F2F] flex-shrink-0">{icon}</span>
                  <span className="truncate">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Suggested Numbers ── */}
          {lead.suggestedNumbers.length > 0 && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121] dark:text-white text-xs uppercase tracking-widest">Suggested VIP Numbers</h3>
                {lead.confirmedNumber && (
                  <span className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/25 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle size={11} /> Confirmed
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                {lead.suggestedNumbers.filter(n => n.number).map((n, i) => {
                  const isConfirmed = lead.confirmedNumber === n.number;
                  return (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isConfirmed
                        ? 'border-green-400 dark:border-green-500/40 bg-green-50 dark:bg-green-900/15'
                        : 'border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/3 hover:border-[#D32F2F]/30 dark:hover:border-[#D32F2F]/40'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isConfirmed ? 'bg-green-500 text-white' : 'bg-[#D32F2F]/10 dark:bg-[#D32F2F]/15 text-[#D32F2F]'
                        }`}>{i + 1}</div>
                        <div>
                          <div className="font-mono font-bold text-[#212121] dark:text-white text-base tracking-wide">{n.number}</div>
                          <div className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">
                            {n.category && <span className="mr-2">{n.category}</span>}
                            {n.price && <span className="font-semibold text-[#D32F2F]">{n.price}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(`https://wa.me/${lead.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(`Your chosen VIP number: ${n.number}`)}`, '_blank')}
                          className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                          <ExternalLink size={14} />
                        </button>
                        {isConfirmed ? (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 border border-green-200 dark:border-green-500/25">
                            <Check size={11} strokeWidth={3} /> Confirmed
                          </span>
                        ) : (
                          <button onClick={() => handleConfirmNumber(n.number)}
                            className="text-xs bg-[#D32F2F] text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors">
                            Customer Confirmed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Edit confirmed number */}
              {lead.confirmedNumber && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#616161] dark:text-gray-500 uppercase tracking-wider">Confirmed Number</div>
                      <div className="font-mono font-bold text-[#D32F2F] text-lg mt-0.5">{lead.confirmedNumber}</div>
                    </div>
                    {!editingConfirmed ? (
                      <button onClick={() => { setEditingConfirmed(true); setEditConfirmedVal(lead.confirmedNumber); }}
                        className="flex items-center gap-1.5 text-xs text-[#616161] dark:text-gray-400 hover:text-[#D32F2F] dark:hover:text-[#D32F2F] px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-[#D32F2F]/40 transition-colors">
                        <Edit2 size={11} /> Update Number
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input value={editConfirmedVal} onChange={e => setEditConfirmedVal(e.target.value)}
                          className="w-36 px-2.5 py-1.5 border border-[#D32F2F] rounded-xl text-sm font-mono focus:outline-none bg-white dark:bg-[#13151e] text-[#212121] dark:text-white"
                          placeholder="New number" />
                        <button onClick={handleUpdateConfirmedNumber}
                          className="px-3 py-1.5 bg-[#D32F2F] text-white rounded-xl text-xs font-semibold hover:bg-[#B71C1C] transition-colors">Save</button>
                        <button onClick={() => setEditingConfirmed(false)}
                          className="px-3 py-1.5 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-400 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Action Cards per status ── */}
          {lead.status === 'Pending' && (
            <div className="rounded-2xl border p-5"
              style={isDark
                ? { background: 'rgba(251,192,45,0.07)', borderColor: 'rgba(251,192,45,0.2)' }
                : { background: 'linear-gradient(135deg, #FFF8E1, #FFFDE7)', borderColor: '#FFE082' }
              }>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isDark ? 'rgba(251,192,45,0.15)' : '#FFF3CD' }}>
                  <Hash size={18} style={{ color: '#FBC02D' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#212121] dark:text-white text-sm mb-0.5">Suggest Numbers</h3>
                  <p className="text-xs text-[#616161] dark:text-gray-400 mb-3">Suggest numerologically compatible VIP numbers. They will be sent via WhatsApp.</p>
                  <button onClick={() => setShowSuggestPopup(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl font-semibold text-sm transition-colors">
                    <Hash size={13} /> Suggest VIP Numbers
                  </button>
                </div>
              </div>
            </div>
          )}

          {lead.status === 'Number Confirmed' && (
            <div className="rounded-2xl border p-5"
              style={isDark
                ? { background: 'rgba(251,192,45,0.07)', borderColor: 'rgba(251,192,45,0.2)' }
                : { background: 'linear-gradient(135deg, #FFF8E1, #FFFDE7)', borderColor: '#FFE082' }
              }>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: isDark ? 'rgba(251,192,45,0.15)' : '#FFF3CD' }}>
                  <AlertCircle size={18} style={{ color: '#FBC02D' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#212121] dark:text-white text-sm mb-0.5">Request Payment</h3>
                  <p className="text-xs text-[#616161] dark:text-gray-400 mb-3">Send payment request to the customer for the confirmed number.</p>
                  <button onClick={() => requestStatusChange('Awaiting Payment', 'Send payment request to customer and mark as Awaiting Payment?')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FBC02D] hover:bg-yellow-400 text-black rounded-xl font-semibold text-sm transition-colors">
                    <AlertCircle size={13} /> Request Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {lead.status === 'Awaiting Payment' && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Record Payment</h3>
              {!showPaymentForm ? (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
                    <IndianRupee size={18} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[#616161] dark:text-gray-400 mb-3">Upload payment proof and mark this inquiry as paid.</p>
                    <button onClick={() => setShowPaymentForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#009688] hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors">
                      <Upload size={13} /> Upload Payment Proof
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider mb-1.5">Payment Reference</label>
                    <input value={paymentText} onChange={e => setPaymentText(e.target.value)}
                      placeholder="UTR number, transaction ID..."
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white dark:bg-[#13151e] text-[#212121] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] dark:text-gray-400 uppercase tracking-wider mb-1.5">Upload Proof</label>
                    <div onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-[#D32F2F]/50 dark:hover:border-[#D32F2F]/50 transition-colors bg-gray-50/50 dark:bg-white/2">
                      {paymentFile ? (
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#212121] dark:text-white">
                          <CheckCircle size={16} className="text-green-500" />{paymentFile.name}
                          <button onClick={e => { e.stopPropagation(); setPaymentFile(null); }} className="text-[#D32F2F]"><X size={13} /></button>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-[#616161] dark:text-gray-400">Click to upload</p>
                          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">PNG, JPG, PDF up to 10MB</p>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden"
                      onChange={e => setPaymentFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPaymentForm(false)}
                      className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                    <button onClick={handlePaymentSubmit} disabled={!paymentText && !paymentFile}
                      className="flex-1 py-2.5 bg-[#009688] hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                      Confirm Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {lead.status === 'Paid' && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121] dark:text-white text-xs uppercase tracking-widest">Payment</h3>
                <span className="text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/25 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle size={11} /> Paid
                </span>
              </div>
              {lead.paymentProof && (
                <div className="bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-500/25 rounded-xl p-4 mb-4">
                  {lead.paymentProof.text && <p className="text-sm text-[#212121] dark:text-green-100"><span className="font-semibold">Ref:</span> {lead.paymentProof.text}</p>}
                  {lead.paymentProof.file && <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5 mt-1"><CheckCircle size={12} /> {lead.paymentProof.file}</p>}
                </div>
              )}
              <button onClick={() => requestStatusChange('Dispatched', 'Mark this order as Dispatched?')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#9C27B0] hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors">
                <Package size={13} /> Mark Dispatched <ArrowRight size={13} />
              </button>
            </div>
          )}

          {lead.status === 'Dispatched' && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <Truck size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212121] dark:text-white text-sm mb-1">Delivery</h3>
                  <p className="text-xs text-[#616161] dark:text-gray-400 mb-3">Confirm delivery once the customer has received the VIP number.</p>
                  <button onClick={() => requestStatusChange('Delivered', 'Mark this order as Delivered? This is the final step.')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#388E3C] hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors">
                    <Truck size={13} /> Mark as Delivered
                  </button>
                </div>
              </div>
            </div>
          )}

          {lead.status === 'Delivered' && (
            <div className="rounded-2xl overflow-hidden border border-green-300 dark:border-green-500/30">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={26} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Successfully Delivered</div>
                  <div className="text-green-100 text-xs mt-0.5">
                    VIP Number <span className="font-mono font-bold">{lead.confirmedNumber || lead.vipNumber}</span> has been activated.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Notes ── */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Notes</h3>

            {/* Customer confirmation pending in notes */}
            {lead.suggestedNumbers.length > 0 && !lead.confirmedNumber && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-500/25 rounded-xl">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wider">Customer Confirmation Pending</p>
                <p className="text-xs text-blue-600 dark:text-blue-400/80 mb-3">Select the number the customer confirmed:</p>
                <div className="space-y-2">
                  {lead.suggestedNumbers.filter(n => n.number).map((n, i) => (
                    <div key={i} className="flex items-center justify-between bg-white dark:bg-[#13151e] rounded-lg px-3 py-2 border border-blue-200 dark:border-blue-500/20">
                      <div>
                        <span className="font-mono font-bold text-[#212121] dark:text-white">{n.number}</span>
                        {n.category && <span className="text-xs text-[#616161] dark:text-gray-400 ml-2">{n.category}</span>}
                      </div>
                      <button onClick={() => handleConfirmNumber(n.number)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Mark Confirmed
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
              {lead.notes.map((n, i) => {
                const typeStyles: Record<string, string> = {
                  system:    'border-l-2 border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/15',
                  suggested: 'border-l-2 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/15',
                  admin:     'border-l-2 border-[#D32F2F]/50 dark:border-[#D32F2F]/40 bg-red-50 dark:bg-red-900/10',
                };
                return (
                  <div key={i} className={`rounded-xl p-3 ${typeStyles[n.type || 'admin']}`}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-[#D32F2F]">{n.author}</span>
                      <span className="text-xs text-[#616161] dark:text-gray-500">{n.time}</span>
                    </div>
                    <p className="text-sm text-[#616161] dark:text-gray-300">{n.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input value={newNote} onChange={e => setNewNote(e.target.value)}
                placeholder="Add a note..." onKeyDown={e => e.key === 'Enter' && addNote()}
                className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white dark:bg-[#13151e] text-[#212121] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600" />
              <button onClick={addNote}
                className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl transition-colors flex items-center gap-1.5 text-sm font-semibold">
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COL ── */}
        <div className="space-y-5">

          {/* Order Summary */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Order Summary</h3>
            <div className="space-y-0">
              {([
                ['VIP Number', lead.confirmedNumber || lead.vipNumber || '—', true],
                ['Amount',     lead.amount,    false],
                ['Source',     lead.source,    false],
                ['Created',    lead.createdAt, false],
              ] as [string, string, boolean][]).map(([label, val, isVip]) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-white/4 last:border-0">
                  <span className="text-xs text-[#616161] dark:text-gray-500 font-medium">{label}</span>
                  <span className={`text-sm font-semibold ${isVip ? 'font-mono text-[#D32F2F]' : 'text-[#212121] dark:text-white'}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-3 text-xs uppercase tracking-widest">Quick Actions</h3>
            <div className="space-y-2">
              {([
                { icon: <Hash size={14} />,         label: 'Suggest Number',    cls: 'text-[#D32F2F] bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25',           action: () => setShowSuggestPopup(true) },
                { icon: <MessageSquare size={14} />, label: 'WhatsApp Message',  cls: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/15 hover:bg-green-100 dark:hover:bg-green-900/25', action: () => window.open(`https://wa.me/${lead.mobile.replace(/\D/g, '')}`, '_blank') },
                { icon: <Phone size={14} />,         label: 'Call Customer',     cls: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/15 hover:bg-blue-100 dark:hover:bg-blue-900/25',   action: () => window.open(`tel:${lead.mobile}`, '_blank') },
                { icon: <Mail size={14} />,          label: 'Send Email',        cls: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/15 hover:bg-purple-100 dark:hover:bg-purple-900/25', action: () => window.open(`mailto:${lead.email}`, '_blank') },
              ]).map(({ icon, label, cls, action }) => (
                <button key={label} onClick={action}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${cls}`}>
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Log Timeline */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Activity Log</h3>
            <div className="relative max-h-80 overflow-y-auto pr-1">
              {[...lead.timeline].reverse().map((t, i, arr) => {
                const s = t.status ? STATUS_META[t.status] : null;
                const dotColor = s?.color || '#9E9E9E';
                const dotBg = isDark
                  ? (s?.darkBg || 'rgba(255,255,255,0.05)')
                  : (s?.bg    || '#f5f5f5');
                const dotBorder = isDark
                  ? (s?.darkBorder || 'rgba(255,255,255,0.1)')
                  : (s?.border     || '#e0e0e0');
                return (
                  <div key={i} className="flex gap-3 pb-4 relative">
                    {i < arr.length - 1 && (
                      <div className="absolute left-[9px] top-5 bottom-0 w-px bg-gray-100 dark:bg-white/6" />
                    )}
                    <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2"
                      style={{ backgroundColor: dotBg, borderColor: dotBorder }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#212121] dark:text-gray-200 leading-snug font-medium">{t.action}</p>
                      <div className="text-[10px] text-[#616161] dark:text-gray-500 mt-0.5 flex items-center gap-1">
                        <span>{t.date}</span>
                        {t.user && <><span>·</span><span>{t.user}</span></>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Suggest Number Popup ── */}
      {showSuggestPopup && (
        <SuggestNumberPopup
          mobile={lead.mobile}
          mobileDisplay={lead.mobileDisplay}
          onClose={() => setShowSuggestPopup(false)}
          onSend={handleSuggestSend}
        />
      )}

      {/* ── Status Confirm Dialog ── */}
      {pendingStatus && (
        <ConfirmDialog
          title={`Confirm: ${STATUS_META[pendingStatus.status].label}`}
          message={pendingStatus.label}
          confirmLabel="Yes, Confirm"
          confirmColor={STATUS_META[pendingStatus.status].color}
          onConfirm={confirmStatusChange}
          onCancel={() => setPendingStatus(null)}
        />
      )}
    </div>
  );
}
