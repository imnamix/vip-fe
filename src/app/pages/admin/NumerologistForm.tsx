import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, Save, CheckCircle } from 'lucide-react';

const SPECIALISATIONS = ['Vedic Numerology', 'Business Numerology', 'Name Correction', 'Mobile Numerology', 'Relationship Numerology', 'Property Numerology'];
const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Ahmedabad', 'Kochi', 'Surat', 'Jaipur'];

const mockData: Record<string, Record<string, string>> = {
  'NUM-0100': { name: 'Dr. Arjun Sharma', email: 'arjun0@numerology.com', mobile: '+91 9900000000', city: 'Pune', specialisation: 'Vedic Numerology', certification: 'Certified Vedic Numerologist — AIN, 2014', experience: '12', bio: 'One of India\'s leading Vedic numerologists with 12+ years of practice.', status: 'Active', referralCode: 'VIP-10001' },
};

export default function NumerologistForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && id !== 'new';
  const existing = id && isEdit ? mockData[id] : null;

  const [form, setForm] = useState({
    name: existing?.name || '',
    email: existing?.email || '',
    mobile: existing?.mobile || '',
    city: existing?.city || '',
    specialisation: existing?.specialisation || SPECIALISATIONS[0],
    certification: existing?.certification || '',
    experience: existing?.experience || '',
    bio: existing?.bio || '',
    status: existing?.status || 'Active',
    referralCode: existing?.referralCode || '',
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.mobile.trim()) e.mobile = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/admin/numerologists'); }, 1500);
  };

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); };

  const Field = ({ label, fkey, type = 'text', required = false }: { label: string; fkey: string; type?: string; required?: boolean }) => (
    <div>
      <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-[#D32F2F] ml-0.5">*</span>}
      </label>
      <input type={type} value={form[fkey as keyof typeof form]} onChange={e => set(fkey, e.target.value)}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] ${errors[fkey] ? 'border-[#D32F2F] bg-red-50' : 'border-gray-200'}`} />
      {errors[fkey] && <p className="text-xs text-[#D32F2F] mt-0.5">{errors[fkey]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/admin/numerologists')} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium">
          <ChevronLeft size={15} /> Back
        </button>
        <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {isEdit ? 'Edit Numerologist' : 'Add Numerologist'}
        </h1>
        {saved && (
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl font-medium">
            <CheckCircle size={13} /> {isEdit ? 'Updated' : 'Added'}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {/* Personal */}
        <div>
          <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" fkey="name" required />
            <Field label="Mobile" fkey="mobile" type="tel" required />
            <Field label="Email" fkey="email" type="email" required />
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">City</label>
              <select value={form.city} onChange={e => set('city', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Professional */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Professional Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Specialisation</label>
              <select value={form.specialisation} onChange={e => set('specialisation', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                {SPECIALISATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Years of Experience" fkey="experience" type="number" />
            <div className="sm:col-span-2"><Field label="Certification Details" fkey="certification" /></div>
            <Field label="Referral Code" fkey="referralCode" />
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                {['Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="border-t border-gray-100 pt-5">
          <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Bio / About</label>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Brief description..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate('/admin/numerologists')}
            className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl font-semibold text-sm">Cancel</button>
          <button type="submit"
            className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#B71C1C]">
            <Save size={13} /> {isEdit ? 'Update' : 'Add Numerologist'}
          </button>
        </div>
      </form>
    </div>
  );
}
