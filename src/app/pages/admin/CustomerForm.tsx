import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, Save, CheckCircle } from 'lucide-react';

const STATUSES = ['Active', 'Pending', 'Inactive', 'Blocked'];
const SOURCES = ['Website', 'WhatsApp', 'Referral', 'Event', 'Social Media'];

const mockData: Record<string, Record<string, string>> = {
  'VIP-C01001': { name: 'Priya Sharma', mobile: '+91 9800000000', email: 'priya0@email.com', dob: '1988-05-15', city: 'Mumbai', preferredNumber: '9999988888', status: 'Active', source: 'Website', notes: 'Interested in premium 9-series numbers.' },
  'VIP-C01002': { name: 'Rajesh Patel', mobile: '+91 9800000001', email: 'rajesh1@email.com', dob: '1985-11-22', city: 'Delhi', preferredNumber: '8888877777', status: 'Active', source: 'Referral', notes: 'Referred by Dr. Arjun Sharma.' },
};

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const existing = id ? mockData[id] : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    mobile: existing?.mobile || '',
    email: existing?.email || '',
    dob: existing?.dob || '',
    city: existing?.city || '',
    preferredNumber: existing?.preferredNumber || '',
    status: existing?.status || 'Pending',
    source: existing?.source || 'Website',
    notes: existing?.notes || '',
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.city.trim()) e.city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/admin/customers'); }, 1500);
  };

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); };

  const Field = ({ label, fkey, type = 'text', required = false }: { label: string; fkey: string; type?: string; required?: boolean }) => (
    <div>
      <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-[#D32F2F] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[fkey as keyof typeof form]}
        onChange={e => set(fkey, e.target.value)}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] transition-colors ${errors[fkey] ? 'border-[#D32F2F] bg-red-50' : 'border-gray-200 bg-white'}`}
      />
      {errors[fkey] && <p className="text-xs text-[#D32F2F] mt-1">{errors[fkey]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/customers')} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {isEdit ? 'Edit Customer' : 'Add Customer'}
        </h1>
        {saved && (
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl font-medium">
            <CheckCircle size={13} /> {isEdit ? 'Updated' : 'Customer Added'}
          </div>
        )}
      </div>

      {isEdit && (
        <div className="bg-[#FFF8E1] border border-[#FBC02D]/30 rounded-xl px-4 py-2.5 mb-4 text-sm text-[#616161]">
          Editing: <span className="font-mono font-bold text-[#D32F2F]">{id}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="space-y-5">
          {/* Personal Info */}
          <div>
            <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" fkey="name" required />
              <Field label="Date of Birth" fkey="dob" type="date" />
              <Field label="Mobile Number" fkey="mobile" type="tel" required />
              <Field label="Email Address" fkey="email" type="email" required />
              <Field label="City" fkey="city" required />
              <Field label="Preferred VIP Number" fkey="preferredNumber" />
            </div>
          </div>

          {/* Status & Source */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Source</label>
                <select value={form.source} onChange={e => set('source', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-gray-100 pt-5">
            <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Any additional notes..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => navigate('/admin/customers')}
            className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl font-semibold text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit"
            className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors">
            <Save size={14} /> {isEdit ? 'Update Customer' : 'Add Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
