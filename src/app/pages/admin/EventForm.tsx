import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, Save, CheckCircle, Plus, Trash2 } from 'lucide-react';

const mockEvents: Record<string, Record<string, unknown>> = {
  'EVT-001': { title: 'Numerology Masterclass 2024', date: '2024-08-15', time: '10:00', endTime: '17:00', venue: 'The Westin, Pune', capacity: '200', fee: '4999', status: 'Upcoming', description: 'A full-day intensive masterclass covering Vedic numerology fundamentals.', img: '' },
};

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && id !== 'new';
  const existing = isEdit && id ? mockEvents[id] : null;

  const [form, setForm] = useState({
    title: (existing?.title as string) || '',
    date: (existing?.date as string) || '',
    time: (existing?.time as string) || '',
    endTime: (existing?.endTime as string) || '',
    venue: (existing?.venue as string) || '',
    capacity: (existing?.capacity as string) || '',
    fee: (existing?.fee as string) || '',
    status: (existing?.status as string) || 'Draft',
    description: (existing?.description as string) || '',
    img: (existing?.img as string) || '',
  });
  const [schedule, setSchedule] = useState([
    { time: '', title: '' },
    { time: '', title: '' },
  ]);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.date) e.date = 'Required';
    if (!form.venue.trim()) e.venue = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/admin/events'); }, 1500);
  };

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(ex => ({ ...ex, [k]: '' })); };

  const F = ({ label, fkey, type = 'text', required = false }: { label: string; fkey: string; type?: string; required?: boolean }) => (
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
        <button onClick={() => navigate('/admin/events')} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium">
          <ChevronLeft size={15} /> Back
        </button>
        <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {isEdit ? 'Edit Event' : 'Create Event'}
        </h1>
        {saved && (
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl font-medium">
            <CheckCircle size={13} /> {isEdit ? 'Updated' : 'Created'}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Event Details</h3>
          <div className="space-y-4">
            <F label="Event Title" fkey="title" required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F label="Date" fkey="date" type="date" required />
              <F label="Start Time" fkey="time" type="time" />
              <F label="End Time" fkey="endTime" type="time" />
            </div>
            <F label="Venue" fkey="venue" required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F label="Capacity" fkey="capacity" type="number" />
              <F label="Fee (₹)" fkey="fee" />
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                  {['Draft', 'Upcoming', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Banner Image URL</label>
              <div className="flex gap-3 items-center">
                {form.img && <img src={form.img} alt="" className="w-20 h-12 object-cover rounded-xl border flex-shrink-0" />}
                <input value={form.img} onChange={e => set('img', e.target.value)} placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Schedule</h3>
          <div className="space-y-3">
            {schedule.map((s, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input type="time" value={s.time} onChange={e => setSchedule(sc => sc.map((x, j) => j === i ? { ...x, time: e.target.value } : x))}
                  className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
                <input value={s.title} onChange={e => setSchedule(sc => sc.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                  placeholder="Session title..." className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
                <button type="button" onClick={() => setSchedule(sc => sc.filter((_, j) => j !== i))} className="text-[#D32F2F] hover:bg-red-50 p-1.5 rounded-lg">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSchedule(s => [...s, { time: '', title: '' }])}
            className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-300 text-[#616161] rounded-xl text-sm hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors flex items-center justify-center gap-1.5">
            <Plus size={13} /> Add Session
          </button>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/admin/events')}
            className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl font-semibold text-sm">Cancel</button>
          <button type="submit"
            className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#B71C1C]">
            <Save size={13} /> {isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
