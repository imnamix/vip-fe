import { useEffect, useRef, useState } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2,
  ChevronDown, Image, Video, Play,
} from 'lucide-react';
import { getAllGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../../../services/GalleryService';
import { uploadFiles } from '../../../services/MediaService';
import { usePermission } from '../../../hooks/usePermission';
import ImagePreviewPopup from '../../../components/ImagePreviewPopup';

// ─── Types ───────────────────────────────────────────────────────────────────

type MediaType = 'image' | 'video';
type Category = 'event' | 'numerologist' | 'testimonials' | 'others';

interface GalleryFormItem {
  localId: number;
  serverId: number | null;
  type: MediaType;
  title: string;
  category: Category;
  url: string;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'event', label: 'Event' },
  { value: 'numerologist', label: 'Numerologist' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'others', label: 'Others' },
];

const CATEGORY_COLORS: Record<Category, string> = {
  event: 'bg-blue-100 text-blue-700',
  numerologist: 'bg-purple-100 text-purple-700',
  testimonials: 'bg-green-100 text-green-700',
  others: 'bg-gray-100 text-gray-600',
};

// ─── Video Preview Modal ──────────────────────────────────────────────────────

function VideoPreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div ref={ref} className="bg-black rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full">
        <video
          src={url}
          controls
          autoPlay
          className="w-full max-h-[70vh]"
        />
        <div className="flex justify-end px-4 py-2">
          <button
            type="button"
            onClick={onClose}
            className="text-white text-xs px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Media Upload ─────────────────────────────────────────────────────────────

function MediaUpload({
  type, value, onChange, canDelete = true,
}: { type: MediaType; value: string; onChange: (url: string) => void; canDelete?: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);

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

  const accept = type === 'image' ? 'image/*' : 'video/*';
  const label = type === 'image' ? 'Upload Image' : 'Upload Video';

  if (value) {
    return (
      <div className="border border-gray-200 rounded-xl p-3">
        {type === 'image' ? (
          <div
            className="relative group cursor-pointer"
            onClick={() => setImagePreview(true)}
          >
            <img src={value} alt="preview" className="w-full h-40 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">Click to preview</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-40 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            <video src={value} className="w-full h-full object-cover opacity-60" />
            <button
              type="button"
              onClick={() => setVideoPreview(true)}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Play size={20} className="text-[#D32F2F] ml-0.5" />
              </div>
            </button>
          </div>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={12} /> Remove
          </button>
        )}
        {videoPreview && <VideoPreviewModal url={value} onClose={() => setVideoPreview(false)} />}
        <ImagePreviewPopup open={imagePreview} onClose={() => setImagePreview(false)} imageUrl={value} title="Image Preview" />
      </div>
    );
  }

  return (
    <label className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'opacity-60 pointer-events-none border-gray-200' : 'border-[#D32F2F]/40 hover:border-[#D32F2F] hover:bg-red-50'}`}>
      {uploading
        ? <Loader2 size={20} className="animate-spin text-[#D32F2F]" />
        : type === 'image'
          ? <Image size={20} className="text-[#D32F2F]" />
          : <Video size={20} className="text-[#D32F2F]" />
      }
      <span className="text-xs text-[#D32F2F] font-medium">{uploading ? 'Uploading…' : label}</span>
      <input type="file" accept={accept} className="hidden" onChange={handleUpload} disabled={uploading} />
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GallerySection() {
  const [items, setItems] = useState<GalleryFormItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<number, { title?: string; url?: string }>>({});
  const { can } = usePermission();
  const canWrite  = can('Content', 'write');
  const canUpdate = can('Content', 'update');
  const canDelete = can('Content', 'delete');

  // ── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllGalleryItems(0, 1000);
        const data: any[] = res?.data ?? [];
        setItems(
          data.map((g, i) => ({
            localId: Date.now() + i,
            serverId: g.id ?? null,
            type: g.type ?? 'image',
            title: g.title ?? '',
            category: g.category ?? 'others',
            url: g.url ?? '',
          })),
        );
      } catch {
        setError('Failed to load gallery items');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 3500);
      return () => clearTimeout(t);
    }
  }, [saved]);

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const errors: Record<number, { title?: string; url?: string }> = {};
    items.forEach(item => {
      const e: { title?: string; url?: string } = {};
      if (!item.title.trim()) e.title = 'Title is required';
      if (!item.url.trim()) e.url = `${item.type === 'image' ? 'Image' : 'Video'} is required`;
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
        await Promise.all(deletedIds.map(id => deleteGalleryItem(id)));
      }
      const updated = await Promise.all(
        items.map(async item => {
          const payload = { type: item.type, title: item.title, category: item.category, url: item.url };
          if (item.serverId) {
            await updateGalleryItem(payload, item.serverId);
            return item;
          } else {
            const res = await createGalleryItem(payload);
            return { ...item, serverId: res?.data?.id ?? null };
          }
        }),
      );
      setItems(updated);
      setDeletedIds([]);
      setSaved(true);
    } catch {
      setError('Failed to save gallery items');
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
    setItems(prev => [...prev, { localId, serverId: null, type: 'image', title: '', category: 'others', url: '' }]);
    setExpandedIds(prev => new Set(prev).add(localId));
  };

  const removeItem = (localId: number, serverId: number | null) => {
    setItems(prev => prev.filter(i => i.localId !== localId));
    if (serverId) setDeletedIds(prev => [...prev, serverId]);
    setFieldErrors(prev => { const n = { ...prev }; delete n[localId]; return n; });
  };

  const updateItem = <K extends keyof GalleryFormItem>(localId: number, field: K, value: GalleryFormItem[K]) => {
    setItems(prev => prev.map(i => (i.localId === localId ? { ...i, [field]: value } : i)));
    if (field === 'title' || field === 'url') {
      setFieldErrors(prev => {
        if (!prev[localId]?.[field as 'title' | 'url']) return prev;
        const updated = { ...prev[localId] };
        delete updated[field as 'title' | 'url'];
        return { ...prev, [localId]: updated };
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading gallery…
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

      <div className="space-y-3">
        {items.map((item, idx) => {
          const expanded = expandedIds.has(item.localId);
          const hasError = !!(fieldErrors[item.localId]?.title || fieldErrors[item.localId]?.url);

          return (
            <div
              key={item.localId}
              className="border border-gray-200 rounded-xl"
            >
              {/* ── Header ── */}
              <div
                className={`flex items-center gap-2 bg-gray-50 px-4 py-2.5 ${expanded ? "rounded-t-xl" : "rounded-xl"}`}
              >
                {/* Sr. No. badge */}
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D32F2F] text-white text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>

                {/* Clickable title row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.localId)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                >
                  <ChevronDown
                    size={14}
                    className={`text-[#616161] flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  />
                  <span className="font-semibold text-[#212121] text-sm truncate">
                    {item.title || `Gallery Item ${idx + 1}`}
                  </span>

                  {/* Type badge */}
                  <span
                    className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.type === "image" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}
                  >
                    {item.type === "image" ? (
                      <Image size={9} />
                    ) : (
                      <Video size={9} />
                    )}
                    {item.type}
                  </span>

                  {/* Category badge */}
                  <span
                    className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${CATEGORY_COLORS[item.category]}`}
                  >
                    {item.category}
                  </span>

                  {hasError && (
                    <AlertCircle
                      size={13}
                      className="text-red-500 flex-shrink-0"
                    />
                  )}
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.localId)}
                    className="px-2.5 py-1 text-xs text-[#616161] border border-gray-200 rounded-lg hover:bg-white transition-colors"
                  >
                    {expanded ? "Collapse" : "Expand"}
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
              {expanded && (
                <div className="p-4 space-y-4">
                  {/* Type toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] mb-1.5">
                      Type
                    </label>
                    <div className="flex gap-2">
                      {(["image", "video"] as MediaType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            updateItem(item.localId, "type", t);
                            updateItem(item.localId, "url", "");
                          }}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${item.type === t ? "bg-[#D32F2F] text-white border-[#D32F2F]" : "text-[#616161] border-gray-200 hover:border-[#D32F2F] hover:text-[#D32F2F]"}`}
                        >
                          {t === "image" ? (
                            <Image size={14} />
                          ) : (
                            <Video size={14} />
                          )}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Media upload */}
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] mb-1">
                      {item.type === "image" ? "Image" : "Video"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <MediaUpload
                      type={item.type}
                      value={item.url}
                      onChange={(url) => updateItem(item.localId, "url", url)}
                      canDelete={canDelete}
                    />
                    {fieldErrors[item.localId]?.url && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {fieldErrors[item.localId].url}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={item.title}
                      onChange={(e) =>
                        updateItem(item.localId, "title", e.target.value)
                      }
                      placeholder="Enter title"
                      className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none ${fieldErrors[item.localId]?.title ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 focus:border-[#D32F2F]"}`}
                    />
                    {fieldErrors[item.localId]?.title && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {fieldErrors[item.localId].title}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] mb-1">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) =>
                        updateItem(
                          item.localId,
                          "category",
                          e.target.value as Category,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {canWrite && (
          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Gallery Item
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
