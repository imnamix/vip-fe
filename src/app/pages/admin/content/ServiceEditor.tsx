import { Plus, Trash2 } from 'lucide-react';
import type { ServiceItem } from './types';

interface Props { items: ServiceItem[]; setItems: (s: ServiceItem[]) => void }

export default function ServiceEditor({ items, setItems }: Props) {
  const update = (id: number, field: keyof ServiceItem, value: string) =>
    setItems(items.map(s => s.id === id ? { ...s, [field]: value } : s));

  const add = () =>
    setItems([...items, { id: Date.now(), image: '', title: '', description: '', icon: '' }]);

  const remove = (id: number) => setItems(items.filter(s => s.id !== id));

  return (
    <div className="space-y-4">
      {items.map((svc, idx) => (
        <div key={svc.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
            <span className="font-semibold text-[#212121] text-sm">Service {idx + 1}</span>
            <button onClick={() => remove(svc.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Icon (emoji)</label>
                <input value={svc.icon} onChange={e => update(svc.id, 'icon', e.target.value)} placeholder="e.g. 📱"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Title</label>
                <input value={svc.title} onChange={e => update(svc.id, 'title', e.target.value)} placeholder="Service title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Image URL</label>
              <div className="flex gap-2">
                {svc.image && <img src={svc.image} alt="" className="w-24 h-14 rounded-lg object-cover flex-shrink-0" />}
                <input value={svc.image} onChange={e => update(svc.id, 'image', e.target.value)} placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Description</label>
              <textarea value={svc.description} onChange={e => update(svc.id, 'description', e.target.value)} rows={2} placeholder="Service description"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add}
        className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
        <Plus size={14} /> Add Service
      </button>
    </div>
  );
}
