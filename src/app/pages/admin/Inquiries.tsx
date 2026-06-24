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

const VI_STORES_BY_STATE: Record<string, string[]> = {
  'Maharashtra':    ['Vi Store - Andheri West, Mumbai','Vi Store - Thane West','Vi Store - Pune Deccan','Vi Store - Nagpur Sitabuldi','Vi Store - Nashik CBS','Vi Store - Aurangabad'],
  'Gujarat':        ['Vi Store - Ahmedabad CG Road','Vi Store - Surat Ring Road','Vi Store - Vadodara Alkapuri','Vi Store - Rajkot'],
  'Karnataka':      ['Vi Store - Bangalore Koramangala','Vi Store - Bangalore MG Road','Vi Store - Mysore'],
  'Tamil Nadu':     ['Vi Store - Chennai Anna Nagar','Vi Store - Chennai T Nagar','Vi Store - Coimbatore RS Puram'],
  'Rajasthan':      ['Vi Store - Jaipur MI Road','Vi Store - Jodhpur Sojati Gate','Vi Store - Udaipur'],
  'Madhya Pradesh': ['Vi Store - Indore Vijay Nagar','Vi Store - Bhopal MP Nagar','Vi Store - Gwalior'],
  'Uttar Pradesh':  ['Vi Store - Lucknow Hazratganj','Vi Store - Kanpur Civil Lines','Vi Store - Agra Sanjay Place','Vi Store - Varanasi'],
  'Delhi':          ['Vi Store - Connaught Place','Vi Store - Lajpat Nagar','Vi Store - Janakpuri','Vi Store - Rajouri Garden'],
  'Haryana':        ['Vi Store - Gurugram DLF Phase 1','Vi Store - Faridabad Sector 15','Vi Store - Ambala'],
  'Punjab':         ['Vi Store - Chandigarh Sector 17','Vi Store - Ludhiana Feroze Gandhi Mkt','Vi Store - Amritsar'],
  'Telangana':      ['Vi Store - Hyderabad Banjara Hills','Vi Store - Hyderabad Secunderabad','Vi Store - Warangal'],
  'West Bengal':    ['Vi Store - Kolkata Park Street','Vi Store - Kolkata Salt Lake','Vi Store - Siliguri'],
  'Bihar':          ['Vi Store - Patna Boring Road','Vi Store - Gaya'],
  'Odisha':         ['Vi Store - Bhubaneswar','Vi Store - Cuttack'],
  'Kerala':         ['Vi Store - Kochi MG Road','Vi Store - Thiruvananthapuram','Vi Store - Kozhikode'],
  'Goa':            ['Vi Store - Panaji','Vi Store - Vasco da Gama'],
  'Assam':          ['Vi Store - Guwahati GS Road','Vi Store - Dibrugarh'],
  'Jharkhand':      ['Vi Store - Ranchi Main Road','Vi Store - Jamshedpur'],
  'Chhattisgarh':   ['Vi Store - Raipur Pandri','Vi Store - Bhilai Sector 6'],
  'Andhra Pradesh': ['Vi Store - Visakhapatnam','Vi Store - Vijayawada Eluru Road','Vi Store - Guntur'],
  'Uttarakhand':    ['Vi Store - Dehradun Rajpur Road','Vi Store - Haridwar'],
  'Himachal Pradesh':['Vi Store - Shimla Mall Road','Vi Store - Dharamshala'],
  'Chandigarh':     ['Vi Store - Chandigarh Sector 17','Vi Store - Chandigarh Sector 22'],
};

const LIMIT = 10;

const inp = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50';
const lbl = 'block text-xs font-semibold text-[#212121] mb-1';
const sec = 'text-xs font-bold text-[#616161] uppercase tracking-wider mb-2 mt-1';

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
  hasNumerologistRef:   'no' as 'yes' | 'no',
  numerologistRefName:  '',
  numerologistRefMobile:'',
  requireDigits:        '',
  notRequireDigits:     '',
  total:                '',
  specialRequirements:  '',
  source:               '',
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

/* ── Add / Edit Modal ──────────────────────────────────────────────────── */
function LeadFormModal({ initial, editId, onClose, onSaved }: {
  initial?: typeof emptyForm; editId?: number; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm]       = useState<typeof emptyForm>(initial ?? emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const isEdit                = !!editId;
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));
  const storeOptions = VI_STORES_BY_STATE[form.state] ?? [];

  const handleSave = async () => {
    if (!form.name.trim() || !form.mobile.trim()) { setError('Name and Mobile are required.'); return; }
    if (!form.source) { setError('Please select a source.'); return; }
    if (form.inquiryType === 'numerologist' && (!form.clientName.trim() || !form.clientMobile.trim())) {
      setError('Client Name and Client Mobile are required for numerologist type.'); return;
    }
    if (form.hasNumerologistRef === 'yes' && (!form.numerologistRefName.trim() || !form.numerologistRefMobile.trim())) {
      setError('Numerologist name and mobile are required when reference is Yes.'); return;
    }
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        hasNumerologistRef: form.hasNumerologistRef === 'yes',
        numerologistRefName:   form.hasNumerologistRef === 'yes' ? form.numerologistRefName   : '',
        numerologistRefMobile: form.hasNumerologistRef === 'yes' ? form.numerologistRefMobile : '',
      };
      if (isEdit) await updateEnquiry(editId!, payload);
      else        await createInquiry(payload);
      onSaved(); onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full my-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{isEdit ? 'Edit Lead' : 'Add New Lead'}</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-200"><X size={15} /></button>
        </div>
        <div className="px-6 py-4 max-h-[78vh] overflow-y-auto space-y-4">
          <div>
            <p className={sec}>Inquiry Type</p>
            <div className="flex gap-3">
              {(['customer', 'numerologist'] as const).map(t => (
                <label key={t} className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${form.inquiryType === t ? 'border-[#D32F2F] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="inquiryType" value={t} checked={form.inquiryType === t} onChange={() => setForm(p => ({ ...p, inquiryType: t }))} className="accent-[#D32F2F]" />
                  <span className="text-sm font-medium capitalize text-[#212121]">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className={sec}>{form.inquiryType === 'customer' ? 'Customer Details' : 'Numerologist Details'}</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>{form.inquiryType === 'customer' ? 'Customer' : 'Numerologist'} Name *</label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Full name" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Mobile Number *</label>
                  <input type="tel" value={form.mobile} onChange={set('mobile')} placeholder="+91 98765 43210" className={inp} />
                </div>
              </div>
              {form.inquiryType === 'numerologist' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Client Name *</label><input type="text" value={form.clientName} onChange={set('clientName')} placeholder="Client's full name" className={inp} /></div>
                  <div><label className={lbl}>Client Mobile *</label><input type="tel" value={form.clientMobile} onChange={set('clientMobile')} placeholder="+91 98765 43210" className={inp} /></div>
                </div>
              )}
              <div><label className={lbl}>Address</label><input type="text" value={form.address} onChange={set('address')} placeholder="House/Flat no., Street" className={inp} /></div>
              {form.inquiryType === 'customer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Taluka</label><input type="text" value={form.taluka} onChange={set('taluka')} placeholder="Taluka" className={inp} /></div>
                  <div><label className={lbl}>District</label><input type="text" value={form.district} onChange={set('district')} placeholder="District" className={inp} /></div>
                </div>
              )}
              {form.inquiryType === 'numerologist' && (
                <div><label className={lbl}>District</label><input type="text" value={form.district} onChange={set('district')} placeholder="District" className={inp} /></div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>State</label>
                  <select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value, nearestViStore: '' }))} className={inp}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Pin Code</label><input type="text" maxLength={6} value={form.pinCode} onChange={set('pinCode')} placeholder="400001" className={inp} /></div>
              </div>
              <div>
                <label className={lbl}>Nearest Vi Store</label>
                <select value={form.nearestViStore} onChange={set('nearestViStore')} disabled={!form.state} className={inp}>
                  <option value="">{form.state ? 'Select nearest store' : 'Select state first'}</option>
                  {storeOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <p className={sec}>Requirements</p>
            <div className="space-y-3">
              {form.inquiryType === 'customer' && (
                <div>
                  <label className={lbl}>Numerologist Reference?</label>
                  <div className="flex gap-6">
                    {(['yes', 'no'] as const).map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="numRef" value={v} checked={form.hasNumerologistRef === v}
                          onChange={() => setForm(p => ({ ...p, hasNumerologistRef: v, numerologistRefName: '', numerologistRefMobile: '' }))}
                          className="accent-[#D32F2F] w-4 h-4" />
                        <span className="text-sm font-medium capitalize text-[#212121]">{v}</span>
                      </label>
                    ))}
                  </div>
                  {form.hasNumerologistRef === 'yes' && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div><label className={lbl}>Numerologist Name *</label><input type="text" value={form.numerologistRefName} onChange={set('numerologistRefName')} placeholder="Name" className={inp} /></div>
                      <div><label className={lbl}>Numerologist Mobile *</label><input type="tel" value={form.numerologistRefMobile} onChange={set('numerologistRefMobile')} placeholder="+91 98765 43210" className={inp} /></div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Require Digits</label><input type="text" value={form.requireDigits} onChange={set('requireDigits')} placeholder="e.g. 8, 1, 5" className={inp} /></div>
                <div><label className={lbl}>Not Require Digits</label><input type="text" value={form.notRequireDigits} onChange={set('notRequireDigits')} placeholder="e.g. 4, 8" className={inp} /></div>
              </div>
              <div><label className={lbl}>Total</label><input type="text" value={form.total} onChange={set('total')} placeholder="e.g. 5, 9" className={inp} /></div>
              <div><label className={lbl}>Any Special Requirements</label><textarea rows={2} value={form.specialRequirements} onChange={set('specialRequirements')} placeholder="Describe any special requirements..." className={inp + ' resize-none'} /></div>
            </div>
          </div>
          <div>
            <p className={sec}>Source & Status</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Source *</label>
                <select value={form.source} onChange={set('source')} className={inp}>
                  <option value="">Select source</option>
                  {SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Status</label>
                <select value={form.status} onChange={set('status')} className={inp}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:border-[#D32F2F] hover:text-[#D32F2F]">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] disabled:opacity-50">
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
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
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
          </div>
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
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
