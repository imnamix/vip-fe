import { useEffect, useState } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2, ChevronDown,
} from 'lucide-react';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../../../services/FaqService';
import { usePermission } from '../../../hooks/usePermission';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqFormItem {
  localId: number;
  serverId: number | null;
  question: string;
  answer: string;
}

type FieldErrors = Record<number, { question?: string; answer?: string }>;

// ─── Main component ───────────────────────────────────────────────────────────

export default function FaqsSection() {
  const [items, setItems] = useState<FaqFormItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const { can } = usePermission();
  const canWrite  = can('Content', 'write');
  const canUpdate = can('Content', 'update');
  const canDelete = can('Content', 'delete');

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAllFaqs();
        const list: any[] = res?.data ?? [];
        setItems(
          list.map((d, i) => ({
            localId: Date.now() + i,
            serverId: d.id ?? null,
            question: d.question ?? '',
            answer: d.answer ?? '',
          })),
        );
      } catch {
        setError('Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 3500);
      return () => clearTimeout(t);
    }
  }, [saved]);

  useEffect(() => {
    if (saved) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [saved]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const errors: FieldErrors = {};
    items.forEach(item => {
      const e: { question?: string; answer?: string } = {};
      if (!item.question.trim()) e.question = 'Question is required';
      if (!item.answer.trim()) e.answer = 'Answer is required';
      if (Object.keys(e).length) errors[item.localId] = e;
    });
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSaving(true);
    setError(null);
    try {
      if (deletedIds.length) {
        await Promise.all(deletedIds.map(id => deleteFaq(id)));
      }

      const updated = await Promise.all(
        items.map(async item => {
          const payload = { question: item.question, answer: item.answer };
          if (item.serverId) {
            await updateFaq(item.serverId, payload);
            return item;
          } else {
            const res = await createFaq(payload);
            return { ...item, serverId: res?.data?.id ?? null };
          }
        }),
      );

      setItems(updated);
      setDeletedIds([]);
      setSaved(true);
    } catch {
      setError('Failed to save FAQs');
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const toggleExpand = (localId: number) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(localId) ? next.delete(localId) : next.add(localId);
      return next;
    });

  const addItem = () => {
    const localId = Date.now();
    setItems(prev => [...prev, { localId, serverId: null, question: '', answer: '' }]);
    setExpandedIds(prev => new Set(prev).add(localId));
  };

  const removeItem = (localId: number, serverId: number | null) => {
    setItems(prev => prev.filter(i => i.localId !== localId));
    if (serverId) setDeletedIds(prev => [...prev, serverId]);
  };

  const updateItem = (localId: number, field: 'question' | 'answer', value: string) => {
    setItems(prev => prev.map(i => (i.localId === localId ? { ...i, [field]: value } : i)));
    setFieldErrors(prev => {
      if (!prev[localId]?.[field]) return prev;
      const updated = { ...prev[localId] };
      delete updated[field];
      return { ...prev, [localId]: updated };
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading FAQs…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.localId} className="border border-gray-200 rounded-xl">
            {/* ── Header ── */}
            <div className={`flex items-center justify-between bg-gray-50 px-4 py-2.5 ${expandedIds.has(item.localId) ? 'rounded-t-xl' : 'rounded-xl'}`}>
              <button
                type="button"
                onClick={() => toggleExpand(item.localId)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <ChevronDown
                  size={15}
                  className={`text-[#616161] flex-shrink-0 transition-transform duration-200 ${expandedIds.has(item.localId) ? 'rotate-180' : ''}`}
                />
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D32F2F] text-white text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-semibold text-[#212121] text-sm truncate">
                  {item.question || `FAQ ${idx + 1}`}
                </span>
                {(fieldErrors[item.localId]?.question || fieldErrors[item.localId]?.answer) && (
                  <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                )}
              </button>
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(item.localId)}
                  className="px-2.5 py-1 text-xs text-[#616161] border border-gray-200 rounded-lg hover:bg-white transition-colors"
                >
                  {expandedIds.has(item.localId) ? 'Collapse' : 'Expand'}
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.localId, item.serverId)}
                    className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Expanded body ── */}
            {expandedIds.has(item.localId) && (
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={item.question}
                    onChange={e => updateItem(item.localId, 'question', e.target.value)}
                    placeholder="Enter the question"
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none transition-colors ${fieldErrors[item.localId]?.question ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-[#D32F2F]'}`}
                  />
                  {fieldErrors[item.localId]?.question && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />{fieldErrors[item.localId].question}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">
                    Answer <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={item.answer}
                    onChange={e => updateItem(item.localId, 'answer', e.target.value)}
                    rows={4}
                    placeholder="Enter the answer"
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none resize-none transition-colors ${fieldErrors[item.localId]?.answer ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-[#D32F2F]'}`}
                  />
                  {fieldErrors[item.localId]?.answer && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} />{fieldErrors[item.localId].answer}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {canWrite && (
          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add FAQ
          </button>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={14} /> Saved successfully
          </div>
        )}
        {canUpdate && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        )}
      </div>
    </div>
  );
}
