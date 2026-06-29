import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, LayoutGrid, List, Eye, Edit, Clock, Plus, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllEnquires, createInquiry, updateEnquiry, getStatusCounts } from '../../services/EnquiresService';

type Status = 'Pending' | 'Number Suggested' | 'Number Confirmed' | 'Awaiting Payment' | 'Paid' | 'Dispatched' | 'Delivered';

const STATUSES: Status[] = ['Pending', 'Number Suggested', 'Number Confirmed', 'Awaiting Payment', 'Paid', 'Dispatched', 'Delivered'];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
  'Pending':           { bg: '#FFF3E0', text: '#FF9800',  border: '#FFE0B2', activeBg: '#FF9800'  },
  'Number Suggested':  { bg: '#E3F2FD', text: '#2196F3',  border: '#BBDEFB', activeBg: '#2196F3'  },
  'Number Confirmed':  { bg: '#E8F5E9', text: '#4CAF50',  border: '#C8E6C9', activeBg: '#4CAF50'  },
  'Awaiting Payment':  { bg: '#FFF8E1', text: '#FBC02D',  border: '#FFF9C4', activeBg: '#FBC02D'  },
  'Paid':              { bg: '#E0F2F1', text: '#009688',  border: '#B2DFDB', activeBg: '#009688'  },
  'Dispatched':        { bg: '#F3E5F5', text: '#9C27B0',  border: '#E1BEE7', activeBg: '#9C27B0'  },
  'Delivered':         { bg: '#E8F5E9', text: '#388E3C',  border: '#C8E6C9', activeBg: '#388E3C'  },
};

const SOURCE_OPTIONS = ['Website', 'WhatsApp', 'Referral', 'Event', 'Social Media', 'Cold Call', 'Walk-in', 'Other'];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Delhi',
  'Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const LIMIT = 10;

const inp = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50';
const lbl = 'block text-xs font-semibold text-[#212121] mb-1';

const emptyForm = {
  inquiryType:          'customer',
  name:                 '',
  mobile:               '',
  address:              '',
  taluka:               '',
  district:             '',
  state:                '',
  pinCode:              '',
  nearestViStore:       '',
  clientName:           '',
  clientMobile:         '',
  isVipNumber:          'no' as 'yes' | 'no',
  vipNumber:            '',
  hasNumerologistRef:   'no' as 'yes' | 'no',
  numerologistRefName:  '',
  numerologistRefMobile:'',
  requireDigits:        '',
  notRequireDigits:     '',
  total:                '',
  specialRequirements:  '',
  source:               'Walk-in',
  status:               'Pending' as Status,
};

function toForm(lead: any): typeof emptyForm {
  return {
    inquiryType:          lead.inquiryType   ?? 'customer',
    name:                 lead.name          ?? '',
    mobile:               lead.mobile        ?? '',
    address:              lead.address       ?? '',
    taluka:               lead.taluka        ?? '',
    district:             lead.district      ?? '',
    state:                lead.state         ?? '',
    pinCode:              lead.pinCode       ?? '',
    nearestViStore:       lead.nearestViStore ?? '',
    clientName:           lead.clientName    ?? '',
    clientMobile:         lead.clientMobile  ?? '',
    isVipNumber:          lead.isVipNumber ? 'yes' : 'no',
    vipNumber:            lead.vipNumber ?? '',
    hasNumerologistRef:   lead.hasNumerologistRef ? 'yes' : 'no',
    numerologistRefName:  lead.numerologistRefName  ?? '',
    numerologistRefMobile:lead.numerologistRefMobile ?? '',
    requireDigits:        lead.requireDigits    ?? '',
    notRequireDigits:     lead.notRequireDigits  ?? '',
    total:                lead.total            ?? '',
    specialRequirements:  lead.specialRequirements ?? '',
    source:               lead.source            ?? '',
    status:               (lead.status as Status) ?? 'Pending',
  };
}

const MOBILE_RE = /^[6-9]\d{9}$/;
const clean = (v: string) => v.replace(/[\s\-+()]/g, '');
const nowLog = () => new Date().toLocaleString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
});

/* ── Add / Edit Modal ──────────────────────────────────────────────────── */
function LeadFormModal({ initial, editId, existingActivityLog, onClose, onSaved }: {
  initial?: typeof emptyForm; editId?: number; existingActivityLog?: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm]           = useState<typeof emptyForm>(initial ?? emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError]   = useState('');
  const [loading, setLoading]     = useState(false);
  const isEdit                    = !!editId;

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (fieldErrors[k]) setFieldErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  /* Red border + bg when field has an error */
  const fi = (k: string) => fieldErrors[k]
    ? 'w-full px-3 py-2 border-2 border-red-400 rounded-xl text-sm focus:outline-none focus:border-red-500 bg-red-50/60'
    : inp;

  /* Small inline error message */
  const FE = ({ k }: { k: string }) =>
    fieldErrors[k] ? <p className="text-xs text-red-500 mt-1 font-medium">{fieldErrors[k]}</p> : null;

  const handleSave = async () => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = 'Name is required.';

    const mob = clean(form.mobile);
    if (!mob) errs.mobile = 'Mobile number is required.';
    else if (!MOBILE_RE.test(mob)) errs.mobile = 'Must be a valid 10-digit number starting with 6–9.';

    if (!form.source) errs.source = 'Please select a source.';

    if (form.inquiryType === 'numerologist') {
      if (!form.clientName.trim()) errs.clientName = 'Client name is required.';
      const cm = clean(form.clientMobile);
      if (!cm) errs.clientMobile = 'Client mobile is required.';
      else if (!MOBILE_RE.test(cm)) errs.clientMobile = 'Must be a valid 10-digit number starting with 6–9.';
    }

    if (form.isVipNumber === 'yes') {
      if (!form.vipNumber.trim()) errs.vipNumber = 'VIP number is required.';
      else if (!/^\d{10}$/.test(clean(form.vipNumber))) errs.vipNumber = 'Must be exactly 10 digits.';
    }

    if (form.hasNumerologistRef === 'yes') {
      if (!form.numerologistRefName.trim()) errs.numerologistRefName = 'Numerologist name is required.';
      const nm = clean(form.numerologistRefMobile);
      if (!nm) errs.numerologistRefMobile = 'Numerologist mobile is required.';
      else if (!MOBILE_RE.test(nm)) errs.numerologistRefMobile = 'Must be a valid 10-digit number starting with 6–9.';
    }

    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setFieldErrors({});
    setLoading(true); setApiError('');
    try {
      const isVip = form.isVipNumber === 'yes';

      let activityLog: string | undefined;
      if (isVip) {
        const prev = (() => { try { return JSON.parse(existingActivityLog ?? '[]'); } catch { return []; } })();
        activityLog = JSON.stringify([...prev, {
          date: nowLog(),
          action: `Number confirmed: ${form.vipNumber}`,
          user: 'Admin',
          status: 'Number Confirmed',
        }]);
      }

      const payload = {
        ...form,
        isVipNumber:           isVip,
        vipNumber:             isVip ? form.vipNumber : '',
        status:                isVip ? 'Number Confirmed' : form.status,
        requireDigits:         isVip ? '' : form.requireDigits,
        notRequireDigits:      isVip ? '' : form.notRequireDigits,
        total:                 isVip ? '' : form.total,
        hasNumerologistRef:    form.hasNumerologistRef === 'yes',
        numerologistRefName:   form.hasNumerologistRef === 'yes' ? form.numerologistRefName   : '',
        numerologistRefMobile: form.hasNumerologistRef === 'yes' ? form.numerologistRefMobile : '',
        ...(isVip ? { confirmedNumber: form.vipNumber, activityLog } : {}),
      };
      if (isEdit) await updateEnquiry(editId!, payload);
      else        await createInquiry(payload);
      onSaved(); onClose();
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardCls = 'rounded-2xl p-4 border space-y-3';
  const secLbl  = 'text-[10px] font-bold uppercase tracking-widest mb-3 block';

  return (
    <div
      className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full my-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Gradient Header ── */}
        <div className="bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {isEdit ? <Edit size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isEdit ? 'Edit Lead' : 'Add New Lead'}
                </h3>
                <p className="text-red-200 text-xs mt-0.5">
                  {isEdit ? 'Update inquiry details' : 'Fill in the details below'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 max-h-[72vh] overflow-y-auto space-y-4">

          {/* ── Inquiry Type ── */}
          <div>
            <span className={secLbl + ' text-[#9E9E9E]'}>Inquiry Type</span>
            <div className="flex gap-3">
              {(['customer', 'numerologist'] as const).map(t => (
                <label key={t} className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${form.inquiryType === t ? 'border-[#D32F2F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="inquiryType" value={t} checked={form.inquiryType === t} onChange={() => setForm(p => ({ ...p, inquiryType: t }))} className="accent-[#D32F2F]" />
                  <span className="text-sm font-medium capitalize text-[#212121]">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Contact Details ── */}
          <div className={cardCls + ' bg-blue-50/40 border-blue-100'}>
            <span className={secLbl + ' text-blue-600'}>
              {form.inquiryType === 'customer' ? 'Customer Details' : 'Numerologist Details'}
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>{form.inquiryType === 'customer' ? 'Customer' : 'Numerologist'} Name *</label>
                <input type="text" value={form.name} onChange={set('name')} placeholder="Full name" className={fi('name')} />
                <FE k="name" />
              </div>
              <div>
                <label className={lbl}>Mobile Number *</label>
                <input type="tel" value={form.mobile} onChange={set('mobile')} placeholder="98765 43210" className={fi('mobile')} />
                <FE k="mobile" />
              </div>
            </div>

            {form.inquiryType === 'numerologist' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Client Name *</label>
                  <input type="text" value={form.clientName} onChange={set('clientName')} placeholder="Client's full name" className={fi('clientName')} />
                  <FE k="clientName" />
                </div>
                <div>
                  <label className={lbl}>Client Mobile *</label>
                  <input type="tel" value={form.clientMobile} onChange={set('clientMobile')} placeholder="98765 43210" className={fi('clientMobile')} />
                  <FE k="clientMobile" />
                </div>
              </div>
            )}

            <div>
              <label className={lbl}>Address</label>
              <input type="text" value={form.address} onChange={set('address')} placeholder="House/Flat no., Street" className={inp} />
            </div>

            {form.inquiryType === 'customer' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Taluka</label>
                  <input type="text" value={form.taluka} onChange={set('taluka')} placeholder="Taluka" className={inp} />
                </div>
                <div>
                  <label className={lbl}>District</label>
                  <input type="text" value={form.district} onChange={set('district')} placeholder="District" className={inp} />
                </div>
              </div>
            )}

            {form.inquiryType === 'numerologist' && (
              <div>
                <label className={lbl}>District</label>
                <input type="text" value={form.district} onChange={set('district')} placeholder="District" className={inp} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>State</label>
                <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} className={inp}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Pin Code</label>
                <input type="text" maxLength={6} value={form.pinCode} onChange={set('pinCode')} placeholder="400001" className={inp} />
              </div>
            </div>

            <div>
              <label className={lbl}>Nearest Vi Store (km)</label>
              <input type="text" value={form.nearestViStore} onChange={set('nearestViStore')} placeholder="e.g. Andheri West — 5 km" className={inp} />
            </div>
          </div>

          {/* ── Requirements ── */}
          <div className={cardCls + ' bg-amber-50/40 border-amber-100'}>
            <span className={secLbl + ' text-amber-600'}>Requirements</span>

            {/* VIP Number */}
            <div className="pb-1">
              <label className={lbl}>VIP Number?</label>
              <div className="flex gap-6">
                {(['yes', 'no'] as const).map(v => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="isVipNumber" value={v}
                      checked={form.isVipNumber === v}
                      onChange={() => setForm(p => ({
                        ...p, isVipNumber: v, vipNumber: '',
                        ...(v === 'yes' ? { status: 'Number Confirmed' as Status } : {}),
                      }))}
                      className="accent-[#D32F2F] w-4 h-4"
                    />
                    <span className="text-sm font-medium capitalize text-[#212121]">{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.isVipNumber === 'yes' && (
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <label className={lbl}>Enter VIP Number *</label>
                <input
                  type="text" value={form.vipNumber} onChange={set('vipNumber')}
                  placeholder="e.g. 9876543210"
                  className={fi('vipNumber')}
                />
                <FE k="vipNumber" />
                {!fieldErrors.vipNumber && (
                  <p className="text-xs text-green-700 mt-2 font-medium">Status will be auto-set to <strong>Number Confirmed</strong></p>
                )}
              </div>
            )}

            {/* Numerologist Reference — customers only */}
            {form.inquiryType === 'customer' && (
              <div>
                <label className={lbl}>Numerologist Reference?</label>
                <div className="flex gap-6">
                  {(['yes', 'no'] as const).map(v => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio" name="numRef" value={v}
                        checked={form.hasNumerologistRef === v}
                        onChange={() => setForm(p => ({ ...p, hasNumerologistRef: v, numerologistRefName: '', numerologistRefMobile: '' }))}
                        className="accent-[#D32F2F] w-4 h-4"
                      />
                      <span className="text-sm font-medium capitalize text-[#212121]">{v}</span>
                    </label>
                  ))}
                </div>
                {form.hasNumerologistRef === 'yes' && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className={lbl}>Numerologist Name *</label>
                      <input type="text" value={form.numerologistRefName} onChange={set('numerologistRefName')} placeholder="Name" className={fi('numerologistRefName')} />
                      <FE k="numerologistRefName" />
                    </div>
                    <div>
                      <label className={lbl}>Numerologist Mobile *</label>
                      <input type="tel" value={form.numerologistRefMobile} onChange={set('numerologistRefMobile')} placeholder="98765 43210" className={fi('numerologistRefMobile')} />
                      <FE k="numerologistRefMobile" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Digits — hidden when VIP Number selected */}
            {form.isVipNumber !== 'yes' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Require Digits</label>
                    <input type="text" value={form.requireDigits} onChange={set('requireDigits')} placeholder="e.g. 8, 1, 5" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Not Require Digits</label>
                    <input type="text" value={form.notRequireDigits} onChange={set('notRequireDigits')} placeholder="e.g. 4, 8" className={inp} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Total</label>
                  <input type="text" value={form.total} onChange={set('total')} placeholder="e.g. 5, 9" className={inp} />
                </div>
              </>
            )}

            <div>
              <label className={lbl}>Any Special Requirements</label>
              <textarea rows={2} value={form.specialRequirements} onChange={set('specialRequirements')} placeholder="Describe any special requirements..." className={inp + ' resize-none'} />
            </div>
          </div>

          {/* ── Source & Status ── */}
          <div className={cardCls + ' bg-gray-50 border-gray-100'}>
            <span className={secLbl + ' text-[#9E9E9E]'}>Source & Status</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Source *</label>
                <select value={form.source} onChange={set('source')} className={fi('source')}>
                  <option value="">Select source</option>
                  {SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
                <FE k="source" />
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select value={form.isVipNumber === 'yes' ? 'Number Confirmed' : form.status} onChange={set('status')} disabled={form.isVipNumber === 'yes'} className={inp + (form.isVipNumber === 'yes' ? ' opacity-60 cursor-not-allowed' : '')}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {apiError && (
            <p className="text-red-500 text-xs text-center bg-red-50 py-2 px-3 rounded-xl border border-red-100">
              {apiError}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border-2 border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white rounded-xl text-sm font-semibold hover:from-[#B71C1C] hover:to-[#C62828] disabled:opacity-50 transition-all shadow-sm">
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Status Badge ──────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: '#F5F5F5', text: '#757575', border: '#E0E0E0' };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {status || 'Pending'}
    </span>
  );
}

/* ── Pagination (same style as AdminEvents) ────────────────────────────── */
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  pages.push(1);
  if (left > 2)           pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1)  pages.push('...');
  pages.push(total);
  return pages;
}

function Pagination({ page, total, limit, onChange }: {
  page: number; total: number; limit: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
      <span className="text-xs text-[#616161]">
        {total === 0
          ? '0 results'
          : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
      </span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors">
          <ChevronLeft size={13} />
        </button>
        {getPageNumbers(page, totalPages).map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-[#9E9E9E]">…</span>
          ) : (
            <button key={p} onClick={() => onChange(p as number)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                page === p
                  ? 'bg-[#D32F2F] text-white'
                  : 'border border-gray-200 hover:border-[#D32F2F] text-[#616161]'
              }`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onChange(page + 1)} disabled={page === totalPages || totalPages === 0}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors">
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────── */
export default function Inquiries() {
  const [view,         setView]         = useState<'kanban' | 'table'>('table');
  const [search,       setSearch]       = useState('');
  const [modalState,   setModalState]   = useState<{ open: boolean; lead?: any }>({ open: false });
  const [leads,        setLeads]        = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState('');
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate    = useNavigate();

  const fetchLeads = async (p: number, q: string, s: string | null) => {
    setLoading(true); setFetchError('');
    try {
      const res = await getAllEnquires(p, LIMIT, q || undefined, s || undefined);
      setLeads(res?.data ?? []);
      setTotal(res?.count ?? 0);
    } catch {
      setFetchError('Failed to load inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await getStatusCounts();
      setStatusCounts(res?.data ?? {});
    } catch {}
  };

  /* Initial load */
  useEffect(() => {
    fetchLeads(1, '', null);
    fetchCounts();
  }, []);

  /* Debounced search */
  const handleSearchChange = (q: string) => {
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchLeads(1, q, activeStatus);
    }, 350);
  };

  const handleStatusFilter = (s: string | null) => {
    const next = s === activeStatus ? null : s;
    setActiveStatus(next);
    setPage(1);
    fetchLeads(1, search, next);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchLeads(p, search, activeStatus);
  };

  const refresh = () => {
    fetchLeads(page, search, activeStatus);
    fetchCounts();
  };

  const openAdd   = ()          => setModalState({ open: true });
  const openEdit  = (lead: any) => setModalState({ open: true, lead });
  const closeModal = ()         => setModalState({ open: false });

  const onSaved = () => {
    fetchLeads(page, search, activeStatus);
    fetchCounts();
  };

  return (
    <div>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-bold text-[#212121]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Inquiries
          </h1>
          <p className="text-[#616161] text-sm">
            {loading
              ? "Loading…"
              : `${total} ${activeStatus ? `"${activeStatus}"` : "total"} inquiries`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search name, mobile…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] w-48"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={refresh}
            title="Refresh"
            className="p-2 border border-gray-200 rounded-xl text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {/* <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-lg transition-colors ${view === "kanban" ? "bg-white text-[#D32F2F] shadow-sm" : "text-[#616161]"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-1.5 rounded-lg transition-colors ${view === "table" ? "bg-white text-[#D32F2F] shadow-sm" : "text-[#616161]"}`}
            >
              <List size={15} />
            </button>
          </div> */}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
          >
            <Plus size={14} /> Add Lead
          </button>
        </div>
      </div>

      {/* ── Status filter pills ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {/* "All" pill */}
        <button
          onClick={() => handleStatusFilter(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeStatus === null
              ? "bg-[#D32F2F] text-white border-[#D32F2F]"
              : "bg-white text-[#616161] border-gray-200 hover:border-gray-400"
          }`}
        >
          All
          {statusCounts["All"] !== undefined && (
            <span
              className={`font-bold px-1.5 py-0.5 rounded-full text-[10px] ${activeStatus === null ? "bg-white/20" : "bg-gray-100"}`}
            >
              {statusCounts["All"]}
            </span>
          )}
        </button>

        {STATUSES.map((s) => {
          const count = statusCounts[s];
          const c = STATUS_COLORS[s];
          const isActive = activeStatus === s;
          return (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isActive ? "text-white" : "hover:opacity-90"
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: c.activeBg,
                      borderColor: c.activeBg,
                      color: "#fff",
                    }
                  : { background: c.bg, color: c.text, borderColor: c.border }
              }
            >
              {s}
              {count !== undefined && (
                <span
                  className={`font-bold px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/25" : "bg-white/60"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {activeStatus && (
          <button
            onClick={() => handleStatusFilter(null)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-[#616161] border border-gray-200 hover:border-[#D32F2F] hover:text-[#D32F2F]"
          >
            <X size={10} /> Clear filter
          </button>
        )}
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
          {fetchError}
          <button
            onClick={refresh}
            className="text-[#D32F2F] font-semibold text-xs hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[...Array(LIMIT)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-6 h-3 bg-gray-100 rounded animate-pulse" />
              <div className="w-32 h-3 bg-gray-100 rounded animate-pulse" />
              <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
              <div className="w-20 h-3 bg-gray-100 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      {!loading && view === "table" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {leads.length === 0 ? (
            <div className="text-center py-16 text-[#616161]">
              <List size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-sm">
                {search || activeStatus
                  ? "No results found"
                  : "No inquiries yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {search || activeStatus
                  ? "Try a different search or filter."
                  : "Booking form submissions will appear here."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[
                        "#",
                        "Name",
                        "Mobile",
                        "Type",
                        "District / State",
                        "Source",
                        "Status",
                        "Date",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((inq) => {
                      const location =
                        [inq.district, inq.state].filter(Boolean).join(", ") ||
                        "—";
                      const date = inq.created_at
                        ? new Date(inq.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—";
                      return (
                        <tr
                          key={inq.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td
                            className="px-4 py-3 text-xs font-mono font-semibold text-[#D32F2F] cursor-pointer"
                            onClick={() =>
                              navigate(`/admin/inquiries/${inq.id}`)
                            }
                          >
                            #{inq.id}
                          </td>
                          <td
                            className="px-4 py-3 text-sm font-medium text-[#212121] whitespace-nowrap cursor-pointer"
                            onClick={() =>
                              navigate(`/admin/inquiries/${inq.id}`)
                            }
                          >
                            {inq.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#616161] whitespace-nowrap">
                            {inq.mobile || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${inq.inquiryType === "numerologist" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}
                            >
                              {inq.inquiryType || "customer"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#616161] whitespace-nowrap">
                            {location}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">
                            {inq.source || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={inq.status || "Pending"} />
                          </td>
                          <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {date}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                                title="View"
                                onClick={() =>
                                  navigate(`/admin/inquiries/${inq.id}`)
                                }
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg"
                                title="Edit"
                                onClick={() => openEdit(inq)}
                              >
                                <Edit size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                total={total}
                limit={LIMIT}
                onChange={handlePageChange}
              />
            </>
          )}
        </div>
      )}

      {/* ── Kanban ── */}
      {!loading && view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((s) => {
            const cards = leads.filter((i) => (i.status || "Pending") === s);
            const c = STATUS_COLORS[s];
            return (
              <div key={s} className="flex-shrink-0 w-60">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-sm font-bold text-[#212121]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {s}
                  </h3>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {statusCounts[s] ?? cards.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {cards.map((inq) => {
                    const date = inq.created_at
                      ? new Date(inq.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "";
                    return (
                      <div
                        key={inq.id}
                        className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/admin/inquiries/${inq.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-semibold text-[#D32F2F]">
                            #{inq.id}
                          </span>
                          <button
                            className="p-1 text-amber-400 hover:bg-amber-50 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(inq);
                            }}
                          >
                            <Edit size={11} />
                          </button>
                        </div>
                        <div className="font-semibold text-[#212121] text-sm mb-0.5">
                          {inq.name || "—"}
                        </div>
                        <div className="text-xs text-[#616161] mb-1">
                          {[inq.district, inq.state]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </div>
                        <div className="text-xs text-[#616161] mb-2">
                          {inq.mobile || ""}
                        </div>
                        {inq.source && (
                          <div className="text-xs text-gray-400 mb-1">
                            via {inq.source}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${inq.inquiryType === "numerologist" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}
                          >
                            {inq.inquiryType || "customer"}
                          </span>
                          {date && (
                            <span className="flex items-center gap-1 text-xs text-[#616161]">
                              <Clock size={9} />
                              {date}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {cards.length === 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-400 border-2 border-dashed border-gray-200">
                      No inquiries
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lead Form Modal ── */}
      {modalState.open && (
        <LeadFormModal
          initial={modalState.lead ? toForm(modalState.lead) : undefined}
          editId={modalState.lead?.id}
          existingActivityLog={modalState.lead?.activityLog}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
