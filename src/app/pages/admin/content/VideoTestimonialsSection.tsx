import { useEffect, useState } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2,
  Image, Video, Star, ChevronDown, X,
} from 'lucide-react';
import {
  getAllVideoTestimonials,
  createVideoTestimonial,
  updateVideoTestimonial,
  deleteVideoTestimonial,
} from '../../../services/VideoTestimonialService';
import { uploadFiles } from '../../../services/MediaService';
import { usePermission } from '../../../hooks/usePermission';
import ImagePreviewPopup from '../../../components/ImagePreviewPopup';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoReviewFormItem {
  localId: number;
  serverId: number | null;
  image: string;
  videoUrl: string;
  name: string;
  role: string;
  review: string;
  rating: number;
}

type FieldErrors = Record<number, { name?: string; review?: string }>;

// ─── Star rating ──────────────────────────────────────────────────────────────

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

// ─── Image upload ─────────────────────────────────────────────────────────────

function SingleImageUpload({ value, onChange, label, canDelete = true }: { value: string; onChange: (url: string) => void; label: string; canDelete?: boolean }) {
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
        {canDelete && (
          <button type="button" onClick={() => onChange('')}
            className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 size={12} /> Remove
          </button>
        )}
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

// ─── Video upload ─────────────────────────────────────────────────────────────

function SingleVideoUpload({ value, onChange, canDelete = true }: { value: string; onChange: (url: string) => void; canDelete?: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(false);

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
        <div
          className="relative group cursor-pointer w-full h-40 bg-black rounded-lg overflow-hidden"
          onClick={() => setVideoPreview(true)}
        >
          <video src={value} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
              <Video size={20} className="text-white ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">Click to preview</span>
          </div>
        </div>
        {canDelete && (
          <button type="button" onClick={() => onChange('')}
            className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 size={12} /> Remove
          </button>
        )}

        {/* Video preview modal */}
        {videoPreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setVideoPreview(false)}
          >
            <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a]">
                <span className="text-white text-sm font-medium">Video Preview</span>
                <button type="button" onClick={() => setVideoPreview(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                  <X size={15} />
                </button>
              </div>
              <video src={value} controls autoPlay className="w-full max-h-[60vh]" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <label className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none border-gray-200' : 'border-[#D32F2F]/40 hover:border-[#D32F2F] hover:bg-red-50'}`}>
      {uploading ? <Loader2 size={20} className="animate-spin text-[#D32F2F]" /> : <Video size={20} className="text-[#D32F2F]" />}
      <span className="text-xs text-[#D32F2F] font-medium">{uploading ? 'Uploading…' : 'Upload Customer Video'}</span>
      {/* <span className="text-xs text-[#9E9E9E]">MP4, MOV, WebM supported</span> */}
      <input type="file" accept="video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VideoTestimonialsSection() {
  const [items, setItems] = useState<VideoReviewFormItem[]>([]);
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
        const res = await getAllVideoTestimonials();
        const list: any[] = res?.data ?? [];
        setItems(
          list.map((d, i) => ({
            localId: Date.now() + i,
            serverId: d.id ?? null,
            image: d.image ?? '',
            videoUrl: d.videoUrl ?? '',
            name: d.name ?? '',
            role: d.role ?? '',
            review: d.review ?? '',
            rating: d.rating ?? 5,
          })),
        );
      } catch {
        setError('Failed to load video reviews');
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
        await Promise.all(deletedIds.map(id => deleteVideoTestimonial(id)));
      }

      const updated = await Promise.all(
        items.map(async item => {
          const payload = {
            image: item.image || null,
            videoUrl: item.videoUrl || null,
            name: item.name,
            role: item.role || null,
            review: item.review,
            rating: item.rating,
          };
          if (item.serverId) {
            await updateVideoTestimonial(item.serverId, payload);
            return item;
          } else {
            const res = await createVideoTestimonial(payload);
            return { ...item, serverId: res?.data?.id ?? null };
          }
        }),
      );

      setItems(updated);
      setDeletedIds([]);
      setSaved(true);
    } catch {
      setError('Failed to save video reviews');
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
    setItems(prev => [...prev, { localId, serverId: null, image: '', videoUrl: '', name: '', role: '', review: '', rating: 5 }]);
    setExpandedIds(prev => new Set(prev).add(localId));
  };

  const removeItem = (localId: number, serverId: number | null) => {
    setItems(prev => prev.filter(i => i.localId !== localId));
    if (serverId) setDeletedIds(prev => [...prev, serverId]);
  };

  const updateItem = (localId: number, field: keyof VideoReviewFormItem, value: string | number) => {
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
        <Loader2 size={16} className="animate-spin" /> Loading video reviews…
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
                  {item.name || `Video Review ${idx + 1}`}
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
              <div className="p-4 space-y-4">
                {/* Image + Video — side by side on larger screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] mb-1">Customer Photo</label>
                    <SingleImageUpload
                      value={item.image}
                      onChange={url => updateItem(item.localId, 'image', url)}
                      label="Customer Photo"
                      canDelete={canDelete}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] mb-1">Customer Video</label>
                    <SingleVideoUpload
                      value={item.videoUrl}
                      onChange={url => updateItem(item.localId, 'videoUrl', url)}
                      canDelete={canDelete}
                    />
                  </div>
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

        {canWrite && (
          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Video Review
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
