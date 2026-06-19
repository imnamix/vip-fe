import { Plus, Trash2 } from 'lucide-react';
import type { FaqItem } from './types';

interface Props { items: FaqItem[]; setItems: (f: FaqItem[]) => void }

export default function FaqEditor({ items, setItems }: Props) {
  const update = (id: number, field: keyof FaqItem, value: string) =>
    setItems(items.map(f => f.id === id ? { ...f, [field]: value } : f));

  const add = () => setItems([...items, { id: Date.now(), question: '', answer: '' }]);

  const remove = (id: number) => setItems(items.filter(f => f.id !== id));

  return (
    <div className="space-y-4">
      {items.map((faq, idx) => (
        <div key={faq.id} className="border border-gray-200 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-[#212121]">FAQ {idx + 1}</span>
            <button onClick={() => remove(faq.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
          <div className="space-y-2">
            <input value={faq.question} onChange={e => update(faq.id, 'question', e.target.value)} placeholder="Question"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
            <textarea value={faq.answer} onChange={e => update(faq.id, 'answer', e.target.value)} rows={2} placeholder="Answer"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
          </div>
        </div>
      ))}
      <button onClick={add}
        className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  );
}
