import { useState } from 'react';
import { Plus, Trash2, Save, CheckCircle, AlertCircle, Loader2, Video, Image } from 'lucide-react';
import { uploadFiles } from '../../../services/MediaService';
import ImagePreviewPopup from '../../../components/ImagePreviewPopup';

interface VideoTestimonial {
  id: number;
  clientName: string;
  designation: string;
  videoUrl: string;
  thumbnail: string;
}

let nextId = 1;
function newItem(): VideoTestimonial {
  return { id: nextId++, clientName: '', designation: '', videoUrl: '', thumbnail: '' };
}

export default function VideoTestimonialsSection() {
  const [items, setItems] = useState<VideoTestimonial[]>([newItem()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [imgPreview, setImgPreview] = useState<{ url: string; title: string } | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const update = (id: number, key: keyof VideoTestimonial, value: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [key]: value } : it));
  };

  const remove = (id: number) => setItems(prev => prev.filter(it => it.id !== id));
  const add = () => setItems(prev => [...prev, newItem()]);

  const handleThumbnailUpload = (id: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('files', file);
    setUploadingId(id);
    try {
      const res = await uploadFiles(fd);
      const up = res?.files?.[0];
      if (up?.success && up?.data?.access_url) update(id, 'thumbnail', up.data.access_url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  const validate = () => {
    const errs: Record<number, Record<string, string>> = {};
    items.forEach(it => {
      const e: Record<string, string> = {};
      if (!it.clientName.trim()) e.clientName = 'Client name is required.';
      if (!it.videoUrl.trim()) e.videoUrl = 'Video URL is required.';
      if (Object.keys(e).length) errs[it.id] = e;
    });
    return errs;
  };

  const handleSave = async () => {
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const fieldErr = (id: number, key: string) =>
    submitted && errors[id]?.[key]
      ? <p className="flex items-center gap-1 mt-1 text-xs text-red-500"><AlertCircle size={11} />{errors[id][key]}</p>
      : null;

  const inputClass = (id: number, key: string) =>
    `w-full px-3 py-2 border rounded-xl text-sm focus:outline-none transition-colors ${
      submitted && errors[id]?.[key]
        ? 'border-red-400 focus:border-red-500 bg-red-50'
        : 'border-gray-200 focus:border-[#D32F2F]'
    }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#616161]">{items.length} testimonial{items.length !== 1 ? 's' : ''}</p>
        <button type="button" onClick={add}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#D32F2F] border border-[#D32F2F]/30 rounded-xl hover:bg-red-50 transition-colors">
          <Plus size={13} /> Add Testimonial
        </button>
      </div>

      {items.map((item, idx) => (
        <div key={item.id} className="border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D32F2F] bg-red-50 px-2.5 py-1 rounded-full">#{idx + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => remove(item.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#616161] mb-1">Client Name *</label>
              <input value={item.clientName} onChange={e => update(item.id, 'clientName', e.target.value)}
                placeholder="e.g. Rahul Sharma" className={inputClass(item.id, 'clientName')} />
              {fieldErr(item.id, 'clientName')}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#616161] mb-1">Designation / City</label>
              <input value={item.designation} onChange={e => update(item.id, 'designation', e.target.value)}
                placeholder="e.g. Business Owner, Mumbai" className={inputClass(item.id, 'designation')} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Video URL *</label>
            <div className="flex gap-2">
              <input value={item.videoUrl} onChange={e => update(item.id, 'videoUrl', e.target.value)}
                placeholder="YouTube / Vimeo / direct video URL"
                className={`flex-1 ${inputClass(item.id, 'videoUrl')}`} />
              {item.videoUrl && (
                <button type="button" onClick={() => setVideoPreview(item.videoUrl)}
                  className="flex items-center gap-1 px-3 py-2 text-xs text-[#D32F2F] border border-[#D32F2F]/30 rounded-xl hover:bg-red-50 transition-colors flex-shrink-0">
                  <Video size={13} /> Preview
                </button>
              )}
            </div>
            {fieldErr(item.id, 'videoUrl')}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Thumbnail (optional)</label>
            {item.thumbnail ? (
              <div className="border border-gray-200 rounded-xl p-3">
                <div className="relative group cursor-pointer" onClick={() => setImgPreview({ url: item.thumbnail, title: 'Thumbnail' })}>
                  <img src={item.thumbnail} alt="Thumbnail" className="w-full h-40 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">Click to preview</span>
                  </div>
                </div>
                <button type="button" onClick={() => update(item.id, 'thumbnail', '')}
                  className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingId === item.id ? 'opacity-60 pointer-events-none border-gray-200' : 'border-[#D32F2F]/40 hover:border-[#D32F2F] hover:bg-red-50'}`}>
                {uploadingId === item.id ? <Loader2 size={20} className="animate-spin text-[#D32F2F]" /> : <Image size={20} className="text-[#D32F2F]" />}
                <span className="text-xs text-[#D32F2F] font-medium">{uploadingId === item.id ? 'Uploading…' : 'Upload Thumbnail'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload(item.id)} disabled={uploadingId === item.id} />
              </label>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={14} /> Saved successfully
          </div>
        )}
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {imgPreview && (
        <ImagePreviewPopup open={!!imgPreview} onClose={() => setImgPreview(null)} imageUrl={imgPreview.url} title={imgPreview.title} />
      )}

      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setVideoPreview(null)}>
          <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a]">
              <span className="text-white text-sm font-medium">Video Preview</span>
              <button type="button" onClick={() => setVideoPreview(null)} className="text-white/70 hover:text-white text-lg leading-none">×</button>
            </div>
            <video src={videoPreview} controls autoPlay className="w-full max-h-[60vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
