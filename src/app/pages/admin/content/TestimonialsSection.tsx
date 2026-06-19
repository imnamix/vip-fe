import { Plus, Trash2 } from 'lucide-react';
import type { TestimonialItem } from './types';

interface Props { testimonials: TestimonialItem[]; setTestimonials: React.Dispatch<React.SetStateAction<TestimonialItem[]>> }

export default function TestimonialsSection({ testimonials, setTestimonials }: Props) {
  const update = (id: number, field: keyof TestimonialItem, value: string) =>
    setTestimonials(ts => ts.map(x => x.id === id ? { ...x, [field]: value } : x));

  const remove = (id: number) => setTestimonials(ts => ts.filter(x => x.id !== id));

  const add = () => setTestimonials(ts => [...ts, { id: Date.now(), name: '', city: '', review: '', rating: 5 }]);

  return (
    <div className="space-y-4">
      {testimonials.map((t, idx) => (
        <div key={t.id} className="border border-gray-200 rounded-xl p-4">
          <div className="flex justify-between mb-3">
            <span className="text-sm font-semibold text-[#212121]">Review {idx + 1}</span>
            <button onClick={() => remove(t.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <input value={t.name} onChange={e => update(t.id, 'name', e.target.value)} placeholder="Name"
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
            <input value={t.city} onChange={e => update(t.id, 'city', e.target.value)} placeholder="City"
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
          </div>
          <textarea value={t.review} onChange={e => update(t.id, 'review', e.target.value)} rows={2} placeholder="Review text"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
        </div>
      ))}
      <button onClick={add}
        className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
        <Plus size={14} /> Add Testimonial
      </button>
    </div>
  );
}
