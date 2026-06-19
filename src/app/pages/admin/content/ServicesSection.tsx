import { useEffect, useRef, useState } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2, Image,
  TrendingUp, Users, Building2, Award, Star, Target, BarChart2, Clock, Globe,
  Shield, Zap, Heart, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench,
  DollarSign, ChevronDown,
} from 'lucide-react';
import { getAllServices, createService, updateService, deleteService } from '../../../services/ServicesService';
import { uploadFiles } from '../../../services/MediaService';
import ImagePreviewPopup from '../../../components/ImagePreviewPopup';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// ─── Types ───────────────────────────────────────────────────────────────────

interface ServiceFormItem {
  localId: number;
  serverId: number | null;
  title: string;
  image: string;
  description: string;
  icon: string;
}

// ─── Icon catalogue ───────────────────────────────────────────────────────────

const SERVICE_ICONS = [
  { name: 'TrendingUp', Component: TrendingUp },
  { name: 'Users', Component: Users },
  { name: 'Building2', Component: Building2 },
  { name: 'Award', Component: Award },
  { name: 'Star', Component: Star },
  { name: 'Target', Component: Target },
  { name: 'BarChart2', Component: BarChart2 },
  { name: 'Clock', Component: Clock },
  { name: 'Globe', Component: Globe },
  { name: 'Shield', Component: Shield },
  { name: 'Zap', Component: Zap },
  { name: 'Heart', Component: Heart },
  { name: 'ThumbsUp', Component: ThumbsUp },
  { name: 'Lightbulb', Component: Lightbulb },
  { name: 'Trophy', Component: Trophy },
  { name: 'Gem', Component: Gem },
  { name: 'Rocket', Component: Rocket },
  { name: 'Wrench', Component: Wrench },
  { name: 'DollarSign', Component: DollarSign },
  { name: 'CheckCircle', Component: CheckCircle },
] as const;

function renderSvcIcon(name: string, size = 16) {
  const found = SERVICE_ICONS.find(i => i.name === name);
  if (!found) return null;
  const Comp = found.Component;
  return <Comp size={size} />;
}

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:border-[#D32F2F] focus:outline-none focus:border-[#D32F2F] bg-white"
      >
        <span className="flex items-center justify-center w-5 h-5 text-[#D32F2F] flex-shrink-0">
          {value ? renderSvcIcon(value, 16) : <span className="w-4 h-4 border border-dashed border-gray-300 rounded block" />}
        </span>
        <span className={value ? 'text-[#212121]' : 'text-[#9E9E9E]'}>{value || 'Select icon'}</span>
        <ChevronDown size={14} className="ml-auto text-[#616161]" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full mb-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!value ? 'bg-red-100 text-[#D32F2F] border-[#D32F2F]/30' : 'text-[#616161] border-gray-200 hover:bg-gray-50'}`}
          >
            None
          </button>
          <div className="grid grid-cols-5 gap-1.5">
            {SERVICE_ICONS.map(({ name, Component }) => (
              <div key={name} className="relative group flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => { onChange(name); setOpen(false); }}
                  className={`p-2 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors w-full ${value === name ? 'bg-red-100 text-[#D32F2F]' : 'text-[#616161]'}`}
                >
                  <Component size={18} />
                </button>
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

export default function ServicesSection() {
  const [items, setItems] = useState<ServiceFormItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<number, { title?: string; description?: string }>>({});
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // ── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllServices(0, 1000);
        const services: any[] = res?.data ?? [];
        setItems(
          services.map((s, i) => ({
            localId: Date.now() + i,
            serverId: s.id ?? null,
            title: s.title ?? '',
            image: s.image ?? '',
            description: s.description ?? '',
            icon: s.icon ?? '',
          })),
        );
      } catch {
        setError('Failed to load services');
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

  useEffect(() => {
    if (saved) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [saved]);

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    // Validate required fields
    const errors: Record<number, { title?: string; description?: string }> = {};
    items.forEach(item => {
      const e: { title?: string; description?: string } = {};
      if (!item.title.trim()) e.title = 'Title is required';
      const descText = item.description.replace(/<[^>]*>/g, '').trim();
      if (!descText) e.description = 'Description is required';
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
      // Delete removed services
      if (deletedIds.length) {
        await Promise.all(deletedIds.map(id => deleteService(id)));
      }

      // Create / update remaining services
      const updated = await Promise.all(
        items.map(async item => {
          const payload = {
            title: item.title,
            image: item.image,
            description: item.description,
            icon: item.icon,
            type: 'service',
          };
          if (item.serverId) {
            await updateService(payload, item.serverId);
            return item;
          } else {
            const res = await createService(payload);
            return { ...item, serverId: res?.data?.id ?? null };
          }
        }),
      );

      setItems(updated);
      setDeletedIds([]);
      setSaved(true);
    } catch {
      setError('Failed to save services');
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
    setItems(prev => [...prev, { localId, serverId: null, title: '', image: '', description: '', icon: '' }]);
    setExpandedIds(prev => new Set(prev).add(localId));
  };

  const removeItem = (localId: number, serverId: number | null) => {
    setItems(prev => prev.filter(i => i.localId !== localId));
    if (serverId) setDeletedIds(prev => [...prev, serverId]);
  };

  const updateItem = (localId: number, field: keyof ServiceFormItem, value: string) => {
    setItems(prev => prev.map(i => (i.localId === localId ? { ...i, [field]: value } : i)));
    if (field === 'title' || field === 'description') {
      setFieldErrors(prev => {
        if (!prev[localId]?.[field]) return prev;
        const updated = { ...prev[localId] };
        delete updated[field];
        return { ...prev, [localId]: updated };
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading services…
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
        {items.map((svc, idx) => (
          <div key={svc.localId} className="border border-gray-200 rounded-xl">
            <div
              className={`flex items-center justify-between bg-gray-50 px-4 py-2.5 ${expandedIds.has(svc.localId) ? 'rounded-t-xl' : 'rounded-xl'}`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(svc.localId)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <ChevronDown
                  size={15}
                  className={`text-[#616161] flex-shrink-0 transition-transform duration-200 ${expandedIds.has(svc.localId) ? 'rotate-180' : ''}`}
                />
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D32F2F] text-white text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-semibold text-[#212121] text-sm truncate">
                  {svc.title || `Service ${idx + 1}`}
                </span>
                {(fieldErrors[svc.localId]?.title || fieldErrors[svc.localId]?.description) && (
                  <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                )}
              </button>
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(svc.localId)}
                  className="px-2.5 py-1 text-xs text-[#616161] border border-gray-200 rounded-lg hover:bg-white transition-colors"
                >
                  {expandedIds.has(svc.localId) ? 'Collapse' : 'Expand'}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(svc.localId, svc.serverId)}
                  className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {expandedIds.has(svc.localId) && <div className="p-4 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] mb-1">Image</label>
                <SingleImageUpload
                  value={svc.image}
                  onChange={url => updateItem(svc.localId, 'image', url)}
                  label="Service Image"
                />
              </div>

              {/* Title + Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    value={svc.title}
                    onChange={e => updateItem(svc.localId, 'title', e.target.value)}
                    placeholder="Service title"
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none ${fieldErrors[svc.localId]?.title ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-[#D32F2F]'}`}
                  />
                  {fieldErrors[svc.localId]?.title && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{fieldErrors[svc.localId].title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Icon</label>
                  <IconPicker
                    value={svc.icon}
                    onChange={val => updateItem(svc.localId, 'icon', val)}
                  />
                </div>
              </div>

              {/* Description (HTML) */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] mb-2">Description <span className="text-red-500">*</span></label>
                <div className={`rounded-xl overflow-hidden border [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-sm ${fieldErrors[svc.localId]?.description ? 'border-red-400 [&_.ql-container]:border-red-400' : 'border-gray-200 [&_.ql-container]:border-gray-200'}`}>
                  <ReactQuill
                    theme="snow"
                    value={svc.description}
                    onChange={(html: string) => updateItem(svc.localId, 'description', html)}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        [{ align: [] }],
                        [{ color: [] }, { background: [] }],
                        ['clean'],
                      ],
                    }}
                  />
                </div>
                {fieldErrors[svc.localId]?.description && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{fieldErrors[svc.localId].description}</p>
                )}
              </div>
            </div>}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Service
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
