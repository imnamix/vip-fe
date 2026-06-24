import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ChevronLeft, CheckCircle, Clock, Phone, MapPin, Hash, MessageSquare,
  Truck, Package, User, Plus, AlertCircle, Upload, X, ArrowRight,
  Edit2, IndianRupee, Check, RefreshCw, FileText, ExternalLink,
} from 'lucide-react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { getEnquiryById, updateEnquiry } from '../../services/EnquiresService';
import { uploadFiles } from '../../services/MediaService';

type Status = 'Pending' | 'Number Suggested' | 'Number Confirmed' | 'Awaiting Payment' | 'Paid' | 'Dispatched' | 'Delivered';

const ALL_STATUSES: Status[] = [
  'Pending', 'Number Suggested', 'Number Confirmed',
  'Awaiting Payment', 'Paid', 'Dispatched', 'Delivered',
];

const STATUS_META: Record<Status, {
  color: string; bg: string; border: string;
  darkBg: string; darkBorder: string; darkText: string;
  icon: React.ElementType; label: string;
}> = {
  'Pending':           { color: '#FF9800', bg: '#FFF3E0', border: '#FFE0B2', darkBg: 'rgba(255,152,0,0.12)',   darkBorder: 'rgba(255,152,0,0.25)',  darkText: '#FFAD42', icon: Clock,       label: 'Lead Received'    },
  'Number Suggested':  { color: '#2196F3', bg: '#E3F2FD', border: '#BBDEFB', darkBg: 'rgba(33,150,243,0.12)',  darkBorder: 'rgba(33,150,243,0.25)', darkText: '#64B5F6', icon: Hash,        label: 'Numbers Suggested'},
  'Number Confirmed':  { color: '#4CAF50', bg: '#E8F5E9', border: '#C8E6C9', darkBg: 'rgba(76,175,80,0.12)',   darkBorder: 'rgba(76,175,80,0.25)',  darkText: '#81C784', icon: CheckCircle, label: 'Number Confirmed' },
  'Awaiting Payment':  { color: '#FBC02D', bg: '#FFF8E1', border: '#FFF176', darkBg: 'rgba(251,192,45,0.12)',  darkBorder: 'rgba(251,192,45,0.25)', darkText: '#FFD54F', icon: AlertCircle, label: 'Awaiting Payment' },
  'Paid':              { color: '#009688', bg: '#E0F2F1', border: '#B2DFDB', darkBg: 'rgba(0,150,136,0.12)',   darkBorder: 'rgba(0,150,136,0.25)',  darkText: '#4DB6AC', icon: IndianRupee, label: 'Payment Received' },
  'Dispatched':        { color: '#9C27B0', bg: '#F3E5F5', border: '#E1BEE7', darkBg: 'rgba(156,39,176,0.12)', darkBorder: 'rgba(156,39,176,0.25)', darkText: '#CE93D8', icon: Package,     label: 'Dispatched'       },
  'Delivered':         { color: '#388E3C', bg: '#E8F5E9', border: '#C8E6C9', darkBg: 'rgba(56,142,60,0.12)',  darkBorder: 'rgba(56,142,60,0.25)',  darkText: '#A5D6A7', icon: Truck,       label: 'Delivered'        },
};

/* Stepper theme: done=yellow, active=red, future=dark-blue */
const STEP = {
  done: { bg: "#1565C0", border: "#1565C0", line: "#FBC02D" },
  active: { bg: "#D32F2F", border: "#D32F2F", line: "#e5e7eb" },
  future: {
    bg: "transparent",
    border: "#FBC02D",
    iconColor: "#FBC02D",
    line: "#e5e7eb",
  },
};

interface SuggestedNumber { number: string; category: string; price: string }
interface Note            { author: string; text: string; time: string }
interface TimelineEvent   { date: string; action: string; user: string; status?: Status }

const nowStr = () =>
  new Date().toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

const isImageUrl = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

/* Render an activity-log action string — suggested numbers get formatted as a list */
function ActionText({ action }: { action: string }) {
  const PREFIX = 'Numbers suggested: ';
  if (action.startsWith(PREFIX)) {
    const items = action.slice(PREFIX.length).split(' | ');
    return (
      <div>
        <span className="text-xs font-semibold text-[#212121] dark:text-gray-200">Numbers suggested:</span>
        <div className="mt-1.5 space-y-1">
          {items.map((item, i) => {
            // item looks like: "9876543212 (test) — 1900"
            const numMatch = item.match(/^(\d+)/);
            const num = numMatch ? numMatch[1] : '';
            const rest = item.slice(num.length);
            return (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#D32F2F]/10 text-[#D32F2F] flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                <span className="text-xs text-[#616161] dark:text-gray-400">
                  <span className="font-mono font-semibold text-[#212121] dark:text-white">{num}</span>
                  <span>{rest}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return <p className="text-xs text-[#212121] dark:text-gray-200 leading-snug font-medium">{action}</p>;
}

/* ── Confirm Dialog ─────────────────────────────────────────────────────── */
function ConfirmDialog({ title, message, confirmLabel, confirmColor, saving, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; confirmColor: string;
  saving?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1e2133] rounded-2xl shadow-2xl dark:shadow-black/60 w-full max-w-md border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-bold text-[#212121] dark:text-white text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
          <p className="text-sm text-[#616161] dark:text-gray-400 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 px-6 py-4">
          <button onClick={onCancel} disabled={saving} className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50">Cancel</button>
          <button onClick={onConfirm} disabled={saving} className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: confirmColor }}>
            {saving ? 'Saving…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Payment Proof Modal ────────────────────────────────────────────────── */
function PaymentProofModal({ proofUrl, proofRef, onClose }: { proofUrl: string; proofRef: string; onClose: () => void }) {
  const isImg = isImageUrl(proofUrl);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e2133] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-white/10"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Payment Proof</h3>
            {proofRef && <p className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">Ref: <span className="font-semibold text-[#212121] dark:text-white">{proofRef}</span></p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-[#616161] dark:text-gray-400"><X size={16} /></button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-50 dark:bg-[#13151e]">
          {isImg
            ? <img src={proofUrl} alt="Payment proof" className="max-w-full max-h-[65vh] object-contain rounded-xl" />
            : <iframe src={proofUrl} title="Payment Proof" className="w-full h-[65vh] rounded-xl border-0" />
          }
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
          <a href={proofUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#616161] hover:text-[#D32F2F] font-medium">
            <ExternalLink size={12} /> Open in new tab
          </a>
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-300 rounded-xl text-sm font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Suggest Number Popup ────────────────────────────────────────────────── */
function SuggestNumberPopup({ onClose, onSend }: { onClose: () => void; onSend: (n: SuggestedNumber[]) => void }) {
  const [rows, setRows] = useState<SuggestedNumber[]>([
    { number: '', category: '', price: '' },
    { number: '', category: '', price: '' },
    { number: '', category: '', price: '' },
  ]);
  const [error, setError] = useState('');
  const update = (i: number, f: keyof SuggestedNumber, v: string) =>
    setRows(r => r.map((x, j) => j === i ? { ...x, [f]: v } : x));
  const filled = rows.filter(r => r.number.trim());
  const save = () => {
    if (!filled.length) { setError('Please enter at least one VIP number.'); return; }
    onSend(filled); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-[#1e2133] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <div>
            <h3 className="font-bold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Suggest VIP Numbers</h3>
            <p className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">Add up to 3 numerologically compatible numbers</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-[#616161]"><X size={16} /></button>
        </div>
        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {rows.map((n, i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[#D32F2F] text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <span className="text-xs font-semibold text-[#616161] uppercase tracking-wider">Option {i + 1}</span>
                {i === 0 && <span className="text-[10px] text-red-500 ml-1">required</span>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { label: 'VIP Number *', field: 'number'   as const, ph: '9999988888', mono: true  },
                  { label: 'Category',     field: 'category' as const, ph: 'Wealth Magnet', mono: false },
                  { label: 'Price',        field: 'price'    as const, ph: '₹1,99,000',  mono: false },
                ]).map(({ label, field, ph, mono }) => (
                  <div key={field}>
                    <label className="text-[10px] font-semibold text-[#616161] uppercase tracking-wider mb-1 block">{label}</label>
                    <input value={n[field]} onChange={e => update(i, field, e.target.value)} placeholder={ph}
                      className={`w-full px-2.5 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#D32F2F] bg-white dark:bg-[#13151e] text-[#212121] dark:text-white placeholder:text-gray-400 ${mono ? 'font-mono' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-300 rounded-xl text-sm font-semibold">Cancel</button>
          <button onClick={save} className="flex-1 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl text-sm font-semibold">Save Numbers</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function InquiryDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDark   = useAdminTheme();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [enquiry,          setEnquiry]          = useState<any>(null);
  const [pageLoading,      setPageLoading]      = useState(true);
  const [pageError,        setPageError]        = useState('');
  const [status,           setStatus]           = useState<Status>('Pending');
  const [suggestedNumbers, setSuggestedNumbers] = useState<SuggestedNumber[]>([]);
  const [confirmedNumber,  setConfirmedNumber]  = useState('');
  const [notes,            setNotes]            = useState<Note[]>([]);
  const [timeline,         setTimeline]         = useState<TimelineEvent[]>([]);
  const [paymentProof,     setPaymentProof]     = useState<{ ref: string; url: string } | null>(null);
  const [commissionPaid,   setCommissionPaid]   = useState(false);

  const [newNote,          setNewNote]          = useState('');
  const [showSuggestPopup, setShowSuggestPopup] = useState(false);
  const [showPaymentForm,  setShowPaymentForm]  = useState(false);
  const [showProofModal,   setShowProofModal]   = useState(false);
  const [proofRef,         setProofRef]         = useState('');
  const [proofUrl,         setProofUrl]         = useState('');
  const [proofFileName,    setProofFileName]    = useState('');
  const [uploadingProof,   setUploadingProof]   = useState(false);
  const [pendingStatus,    setPendingStatus]    = useState<{ status: Status; label: string; extra?: Record<string, any> } | null>(null);
  const [pendingCommission, setPendingCommission] = useState<boolean | null>(null);
  const [statusSaving,     setStatusSaving]     = useState(false);
  const [editingVip,       setEditingVip]       = useState(false);
  const [editVipVal,       setEditVipVal]       = useState('');

  const persist = async (patch: Record<string, any>) => {
    if (!id) return;
    try { await updateEnquiry(Number(id), patch); } catch {}
  };

  const loadEnquiry = async () => {
    if (!id) return;
    setPageLoading(true); setPageError('');
    try {
      const res = await getEnquiryById(Number(id));
      const e   = res?.data ?? res;
      setEnquiry(e);
      setStatus((e.status as Status) || 'Pending');
      setCommissionPaid(!!e.numerologistCommissionPaid);
      if (e.suggestedNumbers) { try { setSuggestedNumbers(JSON.parse(e.suggestedNumbers)); } catch {} }
      if (e.confirmedNumber)  setConfirmedNumber(e.confirmedNumber);
      if (e.paymentProofRef || e.paymentProofUrl) {
        setPaymentProof({ ref: e.paymentProofRef || '', url: e.paymentProofUrl || '' });
        setProofRef(e.paymentProofRef || '');
        setProofUrl(e.paymentProofUrl || '');
      }
      const created = e.created_at
        ? new Date(e.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
        : nowStr();
      let tl: TimelineEvent[] = [];
      if (e.activityLog) { try { tl = JSON.parse(e.activityLog); } catch {} }
      if (!tl.length) tl = [{ date: created, action: 'Inquiry received', user: 'System', status: 'Pending' }];
      setTimeline(tl);
      let nt: Note[] = [];
      if (e.enquiryNotes) { try { nt = JSON.parse(e.enquiryNotes); } catch {} }
      setNotes(nt);
    } catch {
      setPageError('Failed to load inquiry. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { loadEnquiry(); }, [id]);

  const currentIdx = ALL_STATUSES.indexOf(status);
  const mobile     = (enquiry?.mobile ?? '').replace(/\D/g, '');
  const location   = [enquiry?.district, enquiry?.state].filter(Boolean).join(', ') || '—';

  const requestStatusChange = (s: Status, label: string, extra?: Record<string, any>) =>
    setPendingStatus({ status: s, label, extra });

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    setStatusSaving(true);
    const ts  = nowStr();
    const ext = pendingStatus.extra ?? {};
    const ns  = pendingStatus.status;
    const nc  = ext.confirmedNumber as string | undefined;

    let action = `Status changed to "${STATUS_META[ns].label}"`;
    if (ns === 'Number Confirmed' && nc)     action = `Customer confirmed VIP number: ${nc}`;
    else if (ns === 'Awaiting Payment')      action = 'Payment requested from customer';
    else if (ns === 'Dispatched')            action = `Order dispatched — VIP number: ${nc || confirmedNumber}`;
    else if (ns === 'Delivered')             action = `Order delivered — VIP number ${confirmedNumber} activated`;

    const newTl: TimelineEvent[] = [...timeline, { date: ts, action, user: 'Admin', status: ns }];
    try {
      setStatus(ns);
      setTimeline(newTl);
      if (nc) setConfirmedNumber(nc);
      await persist({ status: ns, activityLog: JSON.stringify(newTl), ...ext });
    } finally {
      setStatusSaving(false);
      setPendingStatus(null);
    }
  };

  const handleConfirmNumber = (num: string) =>
    requestStatusChange('Number Confirmed', `Confirm "${num}" as the customer's chosen VIP number?`, { confirmedNumber: num });

  const handleSuggestSend = async (numbers: SuggestedNumber[]) => {
    const ts     = nowStr();
    const detail = numbers.map(n => `${n.number}${n.category ? ` (${n.category})` : ''}${n.price ? ` — ${n.price}` : ''}`).join(' | ');
    const newTl: TimelineEvent[] = [...timeline, { date: ts, action: `Numbers suggested: ${detail}`, user: 'Admin', status: 'Number Suggested' }];
    setSuggestedNumbers(numbers);
    setStatus('Number Suggested');
    setTimeline(newTl);
    await persist({ status: 'Number Suggested', suggestedNumbers: JSON.stringify(numbers), activityLog: JSON.stringify(newTl) });
  };

  const handleUpdateVipNumber = async () => {
    if (!editVipVal.trim()) return;
    const ts   = nowStr();
    const newTl: TimelineEvent[] = [...timeline, { date: ts, action: `Confirmed VIP number updated: ${confirmedNumber} → ${editVipVal}`, user: 'Admin' }];
    setConfirmedNumber(editVipVal);
    setTimeline(newTl);
    setEditingVip(false); setEditVipVal('');
    await persist({ confirmedNumber: editVipVal, activityLog: JSON.stringify(newTl) });
  };

  const addManualNote = async () => {
    const text = newNote.trim();
    if (!text) return;
    const ts = nowStr();
    const newNotes: Note[] = [...notes, { author: 'Admin', text, time: ts }];
    setNotes(newNotes);
    setNewNote('');
    await persist({ enquiryNotes: JSON.stringify(newNotes) });
  };

  const handleProofFileSelect = async (file: File) => {
    setUploadingProof(true); setProofFileName(file.name);
    const fd = new FormData(); fd.append('files', file);
    try {
      const res = await uploadFiles(fd);
      const up  = res?.files?.[0];
      if (up?.success && up?.data?.access_url) { setProofUrl(up.data.access_url); }
      else setProofFileName('');
    } catch { setProofFileName(''); }
    finally { setUploadingProof(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const handlePaymentSubmit = async () => {
    if (!proofRef && !proofUrl) return;
    const ts    = nowStr();
    const parts = [proofRef && `Ref: ${proofRef}`, proofUrl && 'Proof document uploaded'].filter(Boolean).join(' · ');
    const newTl: TimelineEvent[] = [...timeline, { date: ts, action: `Payment recorded — ${parts}`, user: 'Admin', status: 'Awaiting Payment' }];
    setPaymentProof({ ref: proofRef, url: proofUrl });
    setTimeline(newTl);
    setShowPaymentForm(false);
    requestStatusChange('Paid', 'Mark this inquiry as Paid?');
    await persist({ paymentProofRef: proofRef, paymentProofUrl: proofUrl, activityLog: JSON.stringify(newTl) });
  };

  const handleCommissionConfirm = async () => {
    if (pendingCommission === null) return;
    setCommissionPaid(pendingCommission);
    const ts   = nowStr();
    const newTl: TimelineEvent[] = [
      ...timeline,
      { date: ts, action: `Numerologist commission (${enquiry?.numerologistRefName}) marked as ${pendingCommission ? 'Paid' : 'Not Paid'}`, user: 'Admin' },
    ];
    setTimeline(newTl);
    await persist({ numerologistCommissionPaid: pendingCommission, activityLog: JSON.stringify(newTl) });
    setPendingCommission(null);
  };

  const meta       = STATUS_META[status];
  const StatusIcon = meta.icon;

  if (pageLoading) return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-[#1a1d26] border border-gray-100 dark:border-white/6 px-5 py-3.5 mb-5 rounded-2xl flex items-center gap-3">
        <button onClick={() => navigate('/admin/inquiries')} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium"><ChevronLeft size={15} /> Inquiries</button>
        <div className="ml-auto"><RefreshCw size={16} className="animate-spin text-[#D32F2F]" /></div>
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <div className="h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-3 w-1/3" />
            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded animate-pulse w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );

  if (pageError) return (
    <div className="min-h-screen">
      <div className="bg-white dark:bg-[#1a1d26] border border-gray-100 dark:border-white/6 px-5 py-3.5 mb-5 rounded-2xl flex items-center">
        <button onClick={() => navigate('/admin/inquiries')} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium"><ChevronLeft size={15} /> Inquiries</button>
      </div>
      <div className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-500/25 rounded-2xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium mb-3">{pageError}</p>
        <button onClick={loadEnquiry} className="px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C]">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">

      {/* Header */}
      <div className="bg-white dark:bg-[#1a1d26] border border-gray-100 dark:border-white/6 px-5 py-3.5 mb-5 rounded-2xl flex flex-wrap items-center gap-3">
        <button onClick={() => navigate('/admin/inquiries')} className="flex items-center gap-1.5 text-[#616161] dark:text-gray-400 hover:text-[#D32F2F] text-sm font-medium transition-colors">
          <ChevronLeft size={15} /> Inquiries
        </button>
        <span className="text-gray-300 dark:text-white/15">/</span>
        <span className="text-sm text-[#212121] dark:text-white font-mono font-bold">#{id}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={isDark ? { background: meta.darkBg, color: meta.darkText, borderColor: meta.darkBorder } : { background: meta.bg, color: meta.color, borderColor: meta.border }}>
            <StatusIcon size={12} /> {meta.label}
          </div>
          {mobile && (
            <>
              <button onClick={() => window.open(`https://wa.me/${mobile}`, '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold">
                <MessageSquare size={12} /> WhatsApp
              </button>
              <button onClick={() => window.open(`tel:${enquiry?.mobile}`, '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                <Phone size={12} /> Call
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Journey Stepper — yellow / red / dark-blue ── */}
      <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 px-6 py-5 mb-5 overflow-x-auto">
        <p className="text-[10px] font-bold text-[#616161] dark:text-gray-500 uppercase tracking-widest mb-4">Customer Journey</p>
        <div className="flex items-start min-w-max gap-0">
          {ALL_STATUSES.map((s, idx) => {
            const m      = STATUS_META[s];
            const Icon   = m.icon;
            const done   = idx < currentIdx;
            const active = idx === currentIdx;
            const future = idx > currentIdx;
            const event  = timeline.find(t => t.status === s);

            let dotStyle: React.CSSProperties = {};
            let dotClass = 'border-2 ';
            let iconColor = '#fff';

            if (done) {
              dotClass += 'text-white';
              dotStyle = { backgroundColor: STEP.done.bg, borderColor: STEP.done.border };
            } else if (active) {
              dotClass += 'text-white shadow-lg';
              dotStyle = { backgroundColor: STEP.active.bg, borderColor: STEP.active.border, boxShadow: '0 0 0 4px rgba(211,47,47,0.15)' };
            } else {
              dotClass += '';
              dotStyle = { backgroundColor: isDark ? '#252836' : '#fff', borderColor: STEP.future.iconColor };
              iconColor = STEP.future.iconColor;
            }

            const lineColor = done ? STEP.done.line : '#e5e7eb';

            return (
              <div key={s} className="flex items-start">
                <div className="flex flex-col items-center gap-1.5 w-24">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${dotClass}`}
                    style={dotStyle}
                  >
                    {done ? (
                      <Check size={16} strokeWidth={3} color="#fff" />
                    ) : (
                      <Icon size={15} color={active ? "#fff" : iconColor} />
                    )}
                  </div>
                  <div
                    className={`text-center text-[10px] leading-tight font-semibold`}
                    style={{
                      color: done
                        ? STEP.done.bg
                        : active
                          ? STEP.active.bg
                          : STEP.future.iconColor,
                    }}
                  >
                    {m.label}
                  </div>
                  {event ? (
                    <div className="text-[9px] text-gray-400 dark:text-gray-600 text-center leading-tight px-1">
                      {event.date}
                    </div>
                  ) : (
                    <div
                      className={`text-[9px] text-center`}
                      style={{ color: future ? "#FBC02D" : "#d1d5db" }}
                    >
                      Pending
                    </div>
                  )}
                </div>
                {idx < ALL_STATUSES.length - 1 && (
                  <div
                    className="w-8 h-0.5 mt-5 mx-1 flex-shrink-0 transition-colors"
                    style={{ backgroundColor: lineColor }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">

          {/* ── Customer / Numerologist Info ── */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">
              {enquiry?.inquiryType === 'numerologist' ? 'Numerologist Info' : 'Customer Info'}
            </h3>
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-white/6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-md">
                {(enquiry?.name?.[0] ?? '#').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#212121] dark:text-white text-lg truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{enquiry?.name || '—'}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${enquiry?.inquiryType === 'numerologist' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {enquiry?.inquiryType || 'customer'}
                  </span>
                  {enquiry?.source && <span className="text-xs text-[#616161] dark:text-gray-400">via {enquiry.source}</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                [<Phone size={12} />,  enquiry?.mobile || '—'],
                [<MapPin size={12} />, location],
                enquiry?.inquiryType === 'numerologist' && enquiry?.clientName  ? [<User size={12} />, `Client: ${enquiry.clientName}`]  : null,
                enquiry?.inquiryType === 'numerologist' && enquiry?.clientMobile ? [<Phone size={12} />, `Client: ${enquiry.clientMobile}`] : null,
              ].filter(Boolean) as [React.ReactNode, string][]).map(([icon, val], i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[#616161] dark:text-gray-400 bg-gray-50 dark:bg-white/4 rounded-xl px-3 py-2.5">
                  <span className="text-[#D32F2F] flex-shrink-0">{icon}</span>
                  <span className="truncate">{val}</span>
                </div>
              ))}
            </div>
            {(enquiry?.address || enquiry?.taluka || enquiry?.pinCode) && (
              <div className="mt-3 px-3 py-2.5 bg-gray-50 dark:bg-white/4 rounded-xl text-sm text-[#616161] dark:text-gray-400">
                <span className="text-[#D32F2F] font-semibold text-xs">Address: </span>
                {[enquiry?.address, enquiry?.taluka, enquiry?.district, enquiry?.state, enquiry?.pinCode].filter(Boolean).join(', ')}
              </div>
            )}
            {enquiry?.nearestViStore && (
              <div className="mt-2 px-3 py-2.5 bg-gray-50 dark:bg-white/4 rounded-xl text-sm text-[#616161] dark:text-gray-400">
                <span className="text-[#D32F2F] font-semibold text-xs">Vi Store: </span>{enquiry.nearestViStore}
              </div>
            )}
          </div>

          {/* ── Numerologist Reference (if applicable) ── */}
          {enquiry?.hasNumerologistRef && enquiry?.numerologistRefName && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-bold text-[#212121] dark:text-white text-xs uppercase tracking-widest">Numerologist Reference</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#616161] dark:text-gray-500 font-medium mr-1">Commission:</span>
                  <button
                    onClick={() => !commissionPaid && setPendingCommission(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      commissionPaid
                        ? 'bg-green-500 text-white border-green-500 cursor-default'
                        : 'bg-gray-50 dark:bg-white/5 text-[#616161] dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
                    }`}>
                    <Check size={11} strokeWidth={3} />
                    Paid
                  </button>
                  <button
                    onClick={() => commissionPaid && setPendingCommission(false)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      !commissionPaid
                        ? 'bg-[#D32F2F] text-white border-[#D32F2F] cursor-default'
                        : 'bg-gray-50 dark:bg-white/5 text-[#616161] dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                    }`}>
                    <X size={11} strokeWidth={3} />
                    Not Paid
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/4 rounded-xl px-3 py-2.5">
                  <User size={12} className="text-[#D32F2F] flex-shrink-0" />
                  <span className="text-sm text-[#616161] dark:text-gray-400 truncate">{enquiry.numerologistRefName}</span>
                </div>
                {enquiry?.numerologistRefMobile && (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/4 rounded-xl px-3 py-2.5">
                    <Phone size={12} className="text-[#D32F2F] flex-shrink-0" />
                    <span className="text-sm text-[#616161] dark:text-gray-400 truncate">{enquiry.numerologistRefMobile}</span>
                  </div>
                )}
              </div>
              {commissionPaid && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-500/25 rounded-xl text-xs text-green-700 dark:text-green-400 font-medium">
                  <CheckCircle size={12} /> Commission paid to {enquiry.numerologistRefName}
                </div>
              )}
            </div>
          )}

          {/* ── Requirements (no numerologist ref row) ── */}
          {(enquiry?.requireDigits || enquiry?.notRequireDigits || enquiry?.total || enquiry?.specialRequirements) && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Number Requirements</h3>
              <div className="grid grid-cols-2 gap-3">
                {enquiry?.requireDigits && (
                  <div className="bg-gray-50 dark:bg-white/4 rounded-xl px-3 py-2.5">
                    <div className="text-[10px] font-bold text-[#616161] dark:text-gray-500 uppercase tracking-wider mb-0.5">Require Digits</div>
                    <div className="text-sm font-medium text-[#212121] dark:text-white">{enquiry.requireDigits}</div>
                  </div>
                )}
                {enquiry?.notRequireDigits && (
                  <div className="bg-gray-50 dark:bg-white/4 rounded-xl px-3 py-2.5">
                    <div className="text-[10px] font-bold text-[#616161] dark:text-gray-500 uppercase tracking-wider mb-0.5">Not Require</div>
                    <div className="text-sm font-medium text-[#212121] dark:text-white">{enquiry.notRequireDigits}</div>
                  </div>
                )}
                {enquiry?.total && (
                  <div className="bg-gray-50 dark:bg-white/4 rounded-xl px-3 py-2.5">
                    <div className="text-[10px] font-bold text-[#616161] dark:text-gray-500 uppercase tracking-wider mb-0.5">Total</div>
                    <div className="text-sm font-medium text-[#212121] dark:text-white">{enquiry.total}</div>
                  </div>
                )}
              </div>
              {enquiry?.specialRequirements && enquiry.specialRequirements !== 'no' && (
                <div className="mt-3 bg-gray-50 dark:bg-white/4 rounded-xl px-3 py-2.5">
                  <div className="text-[10px] font-bold text-[#616161] dark:text-gray-500 uppercase tracking-wider mb-0.5">Special Requirements</div>
                  <div className="text-sm text-[#616161] dark:text-gray-300">{enquiry.specialRequirements}</div>
                </div>
              )}
            </div>
          )}

          {/* ── Suggested VIP Numbers — hidden after confirmation ── */}
          {suggestedNumbers.length > 0 && !confirmedNumber && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <h3 className="font-bold text-[#212121] dark:text-white text-xs uppercase tracking-widest mb-4">Suggested VIP Numbers</h3>
              <div className="space-y-2.5">
                {suggestedNumbers.filter(n => n.number).map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-white/3 hover:border-[#D32F2F]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#D32F2F]/10 text-[#D32F2F]">{i + 1}</div>
                      <div>
                        <div className="font-mono font-bold text-[#212121] dark:text-white text-base">{n.number}</div>
                        <div className="text-xs text-[#616161] dark:text-gray-400 mt-0.5">
                          {n.category && <span className="mr-2">{n.category}</span>}
                          {n.price && <span className="font-semibold text-[#D32F2F]">{n.price}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleConfirmNumber(n.number)} className="text-xs bg-[#D32F2F] text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-[#B71C1C]">
                      Customer Confirmed
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Status action cards ── */}
          {status === 'Pending' && (
            <div className="rounded-2xl border p-5"
              style={isDark ? { background: 'rgba(251,192,45,0.07)', borderColor: 'rgba(251,192,45,0.2)' } : { background: 'linear-gradient(135deg,#FFF8E1,#FFFDE7)', borderColor: '#FFE082' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? 'rgba(251,192,45,0.15)' : '#FFF3CD' }}>
                  <Hash size={18} style={{ color: '#FBC02D' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#212121] dark:text-white text-sm mb-0.5">Suggest Numbers</h3>
                  <p className="text-xs text-[#616161] dark:text-gray-400 mb-3">Suggest numerologically compatible VIP numbers for this inquiry.</p>
                  <button onClick={() => setShowSuggestPopup(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl font-semibold text-sm">
                    <Hash size={13} /> Suggest VIP Numbers
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'Number Suggested' && suggestedNumbers.length > 0 && !confirmedNumber && (
            <div className="rounded-2xl border p-5"
              style={isDark ? { background: 'rgba(33,150,243,0.07)', borderColor: 'rgba(33,150,243,0.2)' } : { background: 'linear-gradient(135deg,#E3F2FD,#EFF8FF)', borderColor: '#BBDEFB' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? 'rgba(33,150,243,0.15)' : '#DCEEFB' }}>
                  <Hash size={18} style={{ color: '#2196F3' }} />
                </div>
                <div>
                  <h3 className="font-bold text-[#212121] dark:text-white text-sm mb-0.5">Awaiting Customer Confirmation</h3>
                  <p className="text-xs text-[#616161] dark:text-gray-400">Numbers suggested. Once the customer confirms, click "Customer Confirmed" above.</p>
                </div>
              </div>
            </div>
          )}

          {status === 'Number Confirmed' && (
            <div className="rounded-2xl border p-5"
              style={isDark ? { background: 'rgba(251,192,45,0.07)', borderColor: 'rgba(251,192,45,0.2)' } : { background: 'linear-gradient(135deg,#FFF8E1,#FFFDE7)', borderColor: '#FFE082' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? 'rgba(251,192,45,0.15)' : '#FFF3CD' }}>
                  <AlertCircle size={18} style={{ color: '#FBC02D' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#212121] dark:text-white text-sm mb-0.5">Request Payment</h3>
                  <p className="text-xs text-[#616161] dark:text-gray-400 mb-3">Send payment request to the customer for the confirmed number.</p>
                  <button onClick={() => requestStatusChange('Awaiting Payment', 'Send payment request and mark as Awaiting Payment?')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FBC02D] hover:bg-yellow-400 text-black rounded-xl font-semibold text-sm">
                    <AlertCircle size={13} /> Request Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'Awaiting Payment' && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Record Payment</h3>
              {!showPaymentForm ? (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
                    <IndianRupee size={18} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[#616161] dark:text-gray-400 mb-3">Upload payment proof and mark as paid.</p>
                    <button onClick={() => setShowPaymentForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#009688] hover:bg-teal-700 text-white rounded-xl font-semibold text-sm">
                      <Upload size={13} /> Upload Payment Proof
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Transaction Reference</label>
                    <input value={proofRef} onChange={e => setProofRef(e.target.value)} placeholder="UTR number, transaction ID…"
                      className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white dark:bg-[#13151e] text-[#212121] dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Upload Proof</label>
                    <div onClick={() => !uploadingProof && fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors ${uploadingProof ? 'border-gray-300 cursor-wait' : 'border-gray-200 dark:border-white/10 cursor-pointer hover:border-[#D32F2F]/50'} bg-gray-50/50 dark:bg-white/2`}>
                      {uploadingProof ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-[#616161]">
                          <RefreshCw size={16} className="animate-spin text-[#D32F2F]" /> Uploading to S3…
                        </div>
                      ) : proofUrl ? (
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                          <CheckCircle size={15} />
                          <span className="truncate max-w-[200px]">{proofFileName || 'File uploaded'}</span>
                          <button onClick={e => { e.stopPropagation(); setProofUrl(''); setProofFileName(''); }} className="text-[#D32F2F]"><X size={13} /></button>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-[#616161] dark:text-gray-400">Click to upload payment proof</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 500 MB</p>
                        </>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf,.webp" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleProofFileSelect(f); }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowPaymentForm(false); setProofUrl(''); setProofFileName(''); }}
                      className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-300 rounded-xl text-sm font-semibold">Cancel</button>
                    <button onClick={handlePaymentSubmit} disabled={!proofRef && !proofUrl}
                      className="flex-1 py-2.5 bg-[#009688] hover:bg-teal-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50">Confirm Payment</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'Paid' && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121] dark:text-white text-xs uppercase tracking-widest">Payment</h3>
                <span className="text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/25 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle size={11} /> Paid
                </span>
              </div>
              {paymentProof && (
                <div className="bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-500/25 rounded-xl p-4 mb-4 space-y-2.5">
                  {paymentProof.ref && (
                    <div className="flex items-center gap-2 text-sm text-[#212121] dark:text-green-100">
                      <FileText size={13} className="text-teal-600 flex-shrink-0" />
                      <span><span className="font-semibold">Ref:</span> {paymentProof.ref}</span>
                    </div>
                  )}
                  {paymentProof.url && (
                    <button onClick={() => setShowProofModal(true)}
                      className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-400 font-semibold hover:underline w-full text-left">
                      <ExternalLink size={13} /> View Payment Proof
                    </button>
                  )}
                </div>
              )}
              <button onClick={() => requestStatusChange('Dispatched', 'Mark this order as Dispatched?')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#9C27B0] hover:bg-purple-700 text-white rounded-xl text-sm font-semibold">
                <Package size={13} /> Mark Dispatched <ArrowRight size={13} />
              </button>
            </div>
          )}

          {status === 'Dispatched' && (
            <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <Truck size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[#212121] dark:text-white text-sm mb-1">Delivery</h3>
                  <p className="text-xs text-[#616161] dark:text-gray-400 mb-3">Confirm delivery once the customer has received the VIP number.</p>
                  <button onClick={() => requestStatusChange('Delivered', 'Mark this order as Delivered? This is the final step.')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#388E3C] hover:bg-green-700 text-white rounded-xl font-semibold text-sm">
                    <Truck size={13} /> Mark as Delivered
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'Delivered' && (
            <div className="rounded-2xl overflow-hidden border border-green-300 dark:border-green-500/30">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={26} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Successfully Delivered</div>
                  <div className="text-green-100 text-xs mt-0.5">VIP Number <span className="font-mono font-bold">{confirmedNumber}</span> has been activated.</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Notes (manual only) ── */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Notes</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-6">No notes yet. Add a note below.</p>
              ) : notes.map((n, i) => (
                <div key={i} className="rounded-xl p-3 border-l-2 border-[#D32F2F]/40 bg-red-50 dark:bg-red-900/10">
                  <div className="flex justify-between mb-1 gap-2">
                    <span className="text-xs font-bold text-[#D32F2F]">{n.author}</span>
                    <span className="text-[10px] text-[#616161] dark:text-gray-500 whitespace-nowrap">{n.time}</span>
                  </div>
                  <p className="text-sm text-[#616161] dark:text-gray-300">{n.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note…"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addManualNote(); } }}
                className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white dark:bg-[#13151e] text-[#212121] dark:text-white" />
              <button onClick={addManualNote} className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl flex items-center gap-1.5 text-sm font-semibold">
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          {/* Summary */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Summary</h3>
            <div className="py-2.5 border-b border-gray-50 dark:border-white/4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#616161] dark:text-gray-500 font-medium">VIP Number</span>
                {confirmedNumber && !editingVip && (
                  <button onClick={() => { setEditingVip(true); setEditVipVal(confirmedNumber); }}
                    className="flex items-center gap-1 text-[10px] text-[#616161] hover:text-[#D32F2F] px-2 py-0.5 border border-gray-200 dark:border-white/10 rounded-lg hover:border-[#D32F2F]/40">
                    <Edit2 size={9} /> Edit
                  </button>
                )}
              </div>
              {!editingVip ? (
                <div className="text-sm font-bold font-mono text-[#D32F2F] mt-0.5">{confirmedNumber || '—'}</div>
              ) : (
                <div className="flex items-center gap-2 mt-1.5">
                  <input value={editVipVal} onChange={e => setEditVipVal(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-[#D32F2F] rounded-lg text-sm font-mono focus:outline-none bg-white dark:bg-[#13151e] text-[#212121] dark:text-white" placeholder="New VIP number" />
                  <button onClick={handleUpdateVipNumber} className="px-2.5 py-1.5 bg-[#D32F2F] text-white rounded-lg text-xs font-semibold">Save</button>
                  <button onClick={() => setEditingVip(false)} className="px-2.5 py-1.5 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-400 rounded-lg text-xs">Cancel</button>
                </div>
              )}
            </div>
            {([
              ['Inquiry #',  `#${id}`],
              ['Source',     enquiry?.source      || '—'],
              ['Type',       enquiry?.inquiryType || 'customer'],
              ['Location',   location],
              ['Created',    enquiry?.created_at ? new Date(enquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'],
            ] as [string, string][]).map(([label, val]) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-white/4 last:border-0">
                <span className="text-xs text-[#616161] dark:text-gray-500 font-medium">{label}</span>
                <span className="text-sm font-semibold text-[#212121] dark:text-white truncate max-w-[60%] text-right capitalize">{val}</span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-3 text-xs uppercase tracking-widest">Quick Actions</h3>
            <div className="space-y-2">
              {([
                { icon: <Hash size={14} />,         label: 'Suggest Number',   cls: 'text-[#D32F2F] bg-red-50 dark:bg-red-900/15 hover:bg-red-100',           action: () => setShowSuggestPopup(true) },
                { icon: <MessageSquare size={14} />, label: 'WhatsApp Message', cls: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/15 hover:bg-green-100', action: () => window.open(`https://wa.me/${mobile}`, '_blank') },
                { icon: <Phone size={14} />,         label: 'Call Customer',    cls: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/15 hover:bg-blue-100',   action: () => window.open(`tel:${enquiry?.mobile}`, '_blank') },
              ]).map(({ icon, label, cls, action }) => (
                <button key={label} onClick={action} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${cls}`}>
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Activity Log ── */}
          <div className="bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6 p-5">
            <h3 className="font-bold text-[#212121] dark:text-white mb-4 text-xs uppercase tracking-widest">Activity Log</h3>
            <div className="relative max-h-96 overflow-y-auto pr-1">
              {timeline.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No activity yet.</p>
              ) : (
                [...timeline].reverse().map((t, i, arr) => {
                  const s         = t.status ? STATUS_META[t.status] : null;
                  const dotColor  = s?.color  || '#9E9E9E';
                  const dotBg     = isDark ? (s?.darkBg  || 'rgba(255,255,255,0.05)') : (s?.bg     || '#f5f5f5');
                  const dotBorder = isDark ? (s?.darkBorder || 'rgba(255,255,255,0.1)') : (s?.border || '#e0e0e0');
                  return (
                    <div key={i} className="flex gap-3 pb-5 relative">
                      {i < arr.length - 1 && <div className="absolute left-[9px] top-5 bottom-0 w-px bg-gray-100 dark:bg-white/6" />}
                      <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2"
                        style={{ backgroundColor: dotBg, borderColor: dotBorder }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <ActionText action={t.action} />
                        <div className="text-[10px] text-[#616161] dark:text-gray-500 mt-1 flex items-center gap-1 flex-wrap">
                          <span>{t.date}</span>
                          {t.user && <><span>·</span><span>{t.user}</span></>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggest Number Popup */}
      {showSuggestPopup && <SuggestNumberPopup onClose={() => setShowSuggestPopup(false)} onSend={handleSuggestSend} />}

      {/* Status Confirm Dialog */}
      {pendingStatus && (
        <ConfirmDialog
          title={`Confirm: ${STATUS_META[pendingStatus.status].label}`}
          message={pendingStatus.label}
          confirmLabel="Yes, Confirm"
          confirmColor={STATUS_META[pendingStatus.status].color}
          saving={statusSaving}
          onConfirm={confirmStatusChange}
          onCancel={() => setPendingStatus(null)}
        />
      )}

      {/* Commission toggle confirm */}
      {pendingCommission !== null && (
        <ConfirmDialog
          title={pendingCommission ? 'Mark Commission Paid' : 'Mark Commission Not Paid'}
          message={`Mark numerologist commission${enquiry?.numerologistRefName ? ` to ${enquiry.numerologistRefName}` : ''} as ${pendingCommission ? 'Paid' : 'Not Paid'}?`}
          confirmLabel="Confirm"
          confirmColor={pendingCommission ? '#4CAF50' : '#FF9800'}
          onConfirm={handleCommissionConfirm}
          onCancel={() => setPendingCommission(null)}
        />
      )}

      {/* Payment Proof Modal */}
      {showProofModal && paymentProof?.url && (
        <PaymentProofModal proofUrl={paymentProof.url} proofRef={paymentProof.ref} onClose={() => setShowProofModal(false)} />
      )}
    </div>
  );
}
