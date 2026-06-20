import { useEffect, useState } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2, Image,
  Star, ChevronDown,
} from 'lucide-react';
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../../services/TestimonialService';
import { uploadFiles } from '../../../services/MediaService';
import ImagePreviewPopup from '../../../components/ImagePreviewPopup';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewFormItem {
  localId: number;
  serverId: number | null;
  image: string;
  name: string;
  role: string;
  review: string;
  rating: number;
}

// ─── Star rating picker ───────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={22}
            className={`transition-colors ${
              star <= (hovered || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      <span className="ml-1 text-xs text-[#616161]">{value}/5</span>
    </div>
  );
}

// ─── Image upload (gallery style) ────────────────────────────────────────────

function SingleImageUpload({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const [uploading, setUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('files', file);
    setUploading(true);
    try {
      const res = await uploadFiles(fd);
      const up = res?.files?.[0];
      if (up?.success && up?.data?.access_url) onChange(up.data.access_url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (value) {
    return (
      <div className="border border-gray-200 rounded-xl p-3">
        <div className="relative group cursor-pointer" onClick={() => setImgPreview(true)}>
          <img src={value} alt={label} className="w-full h-40 object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">Click to preview</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange('')}
          className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} /> Remove
        </button>
        <ImagePreviewPopup open={imgPreview} onClose={() => setImgPreview(false)} imageUrl={value} title={label} />
      </div>
    );
  }

  return (
    <label className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none border-gray-200' : 'border-[#D32F2F]/40 hover:border-[#D32F2F] hover:bg-red-50'}`}>
      {uploading ? <Loader2 size={20} className="animate-spin text-[#D32F2F]" /> : <Image size={20} className="text-[#D32F2F]" />}
      <span className="text-xs text-[#D32F2F] font-medium">{uploading ? 'Uploading…' : `Upload ${label}`}</span>
      <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TestimonialsSection() {
  const [items, setItems] = useState<ReviewFormItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<number, { name?: string; review?: string }>>({});
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAllTestimonials();
        const list: any[] = res?.data ?? [];
        setItems(
          list.map((d, i) => ({
            localId: Date.now() + i,
            serverId: d.id ?? null,
            image: d.image ?? '',
            name: d.name ?? '',
            role: d.role ?? '',
            review: d.review ?? '',
            rating: d.rating ?? 5,
          })),
        );
      } catch {
        setError('Failed to load reviews');
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
    const errors: Record<number, { name?: string; review?: string }> = {};
    items.forEach(item => {
      const e: { name?: string; review?: string } = {};
      if (!item.name.trim()) e.name = 'Name is required';
      if (!item.review.trim()) e.review = 'Review is required';
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
        await Promise.all(deletedIds.map(id => deleteTestimonial(id)));
      }

      const updated = await Promise.all(
        items.map(async item => {
          const payload = {
            image: item.image || null,
            name: item.name,
            role: item.role || null,
            review: item.review,
            rating: item.rating,
          };
          if (item.serverId) {
            await updateTestimonial(item.serverId, payload);
            return item;
          } else {
            const res = await createTestimonial(payload);
            return { ...item, serverId: res?.data?.id ?? null };
          }
        }),
      );

      setItems(updated);
      setDeletedIds([]);
      setSaved(true);
    } catch {
      setError('Failed to save reviews');
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
    setItems(prev => [...prev, { localId, serverId: null, image: '', name: '', role: '', review: '', rating: 5 }]);
    setExpandedIds(prev => new Set(prev).add(localId));
  };

  const removeItem = (localId: number, serverId: number | null) => {
    setItems(prev => prev.filter(i => i.localId !== localId));
    if (serverId) setDeletedIds(prev => [...prev, serverId]);
  };

  const updateItem = (localId: number, field: keyof ReviewFormItem, value: string | number) => {
    setItems(prev => prev.map(i => (i.localId === localId ? { ...i, [field]: value } : i)));
    if (field === 'name' || field === 'review') {
      setFieldErrors(prev => {
        if (!prev[localId]?.[field as 'name' | 'review']) return prev;
        const updated = { ...prev[localId] };
        delete updated[field as 'name' | 'review'];
        return { ...prev, [localId]: updated };
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading reviews…
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
                  {item.name || `Review ${idx + 1}`}
                </span>
                {(fieldErrors[item.localId]?.name || fieldErrors[item.localId]?.review) && (
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
                <button
                  type="button"
                  onClick={() => removeItem(item.localId, item.serverId)}
                  className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* ── Expanded body ── */}
            {expandedIds.has(item.localId) && (
              <div className="p-4 space-y-4">
                {/* Customer photo */}
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Customer Photo</label>
                  <SingleImageUpload
                    value={item.image}
                    onChange={url => updateItem(item.localId, 'image', url)}
                    label="Customer Photo"
                  />
                </div>

                {/* Name + Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                      value={item.name}
                      onChange={e => updateItem(item.localId, 'name', e.target.value)}
                      placeholder="Customer name"
                      className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none ${fieldErrors[item.localId]?.name ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-[#D32F2F]'}`}
                    />
                    {fieldErrors[item.localId]?.name && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{fieldErrors[item.localId].name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] mb-1">Role / City</label>
                    <input
                      value={item.role}
                      onChange={e => updateItem(item.localId, 'role', e.target.value)}
                      placeholder="e.g. Business Owner, Mumbai"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                    />
                  </div>
                </div>

                {/* Review */}
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Review <span className="text-red-500">*</span></label>
                  <textarea
                    value={item.review}
                    onChange={e => updateItem(item.localId, 'review', e.target.value)}
                    rows={3}
                    placeholder="What did the customer say?"
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none resize-none ${fieldErrors[item.localId]?.review ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-[#D32F2F]'}`}
                  />
                  {fieldErrors[item.localId]?.review && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{fieldErrors[item.localId].review}</p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-2">Rating</label>
                  <StarRating value={item.rating} onChange={v => updateItem(item.localId, 'rating', v)} />
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Review
        </button>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={14} /> Saved successfully
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
