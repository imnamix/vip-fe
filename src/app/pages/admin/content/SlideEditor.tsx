import { Plus, Trash2 } from 'lucide-react';
import type { Slide } from './types';

interface Props { slides: Slide[]; setSlides: (s: Slide[]) => void; label?: string }

export default function SlideEditor({ slides, setSlides, label = 'Slide' }: Props) {
  const update = (id: number, field: keyof Slide, value: string) =>
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));

  const add = () =>
    setSlides([...slides, { id: Date.now(), image: '', title: '', description: '' }]);

  const remove = (id: number) => setSlides(slides.filter(s => s.id !== id));

  return (
    <div className="space-y-4">
      {slides.map((slide, idx) => (
        <div key={slide.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
            <span className="font-semibold text-[#212121] text-sm">{label} {idx + 1}</span>
            <button onClick={() => remove(slide.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Background Image URL</label>
              <div className="flex gap-2">
                {slide.image && <img src={slide.image} alt="" className="w-24 h-14 rounded-lg object-cover flex-shrink-0" />}
                <input value={slide.image} onChange={e => update(slide.id, 'image', e.target.value)} placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Title</label>
              <input value={slide.title} onChange={e => update(slide.id, 'title', e.target.value)} placeholder="Slide title"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={slide.description} onChange={e => update(slide.id, 'description', e.target.value)} rows={2} placeholder="Slide description"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add}
        className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
        <Plus size={14} /> Add {label}
      </button>
    </div>
  );
}
