import { useState } from 'react';
import { Plus, Trash2, Image, Loader2, AlertCircle } from 'lucide-react';
import type { Slide } from './types';
import { uploadFiles } from '../../../services/MediaService';
import ImagePreviewPopup from '../../../components/ImagePreviewPopup';

interface Props { slides: Slide[]; setSlides: (s: Slide[]) => void; label?: string; showErrors?: boolean }

export default function SlideEditor({ slides, setSlides, label = 'Slide', showErrors = false }: Props) {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [preview, setPreview] = useState<{
      url: string;
      title: string;
    } | null>(null);


  const update = (id: number, field: keyof Slide, value: string) =>
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleImageUpload = (id: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('files', file);
    setUploadingId(id);
    try {
      const res = await uploadFiles(formData);
      const uploaded = res?.files?.[0];
      if (uploaded?.success && uploaded?.data?.access_url) {
        update(id, 'image', uploaded.data.access_url);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingId(null);
    }
  };

  const add = () =>
    setSlides([...slides, { id: Date.now(), image: '', title: '', description: '' }]);

  const remove = (id: number) => setSlides(slides.filter(s => s.id !== id));

  return (
    <div className="space-y-4">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className="border border-gray-200 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
            <span className="font-semibold text-[#212121] text-sm">
              {label} {idx + 1}
            </span>
            <button
              onClick={() => remove(slide.id)}
              className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {/* Background Image */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                Banner Image <span className="text-red-500">*</span>
              </label>
              <div>
                {slide.image ? (
                  <div className="border border-gray-200 rounded-xl p-3">
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setPreview({ url: slide.image, title: "Slide Image" })}
                    >
                      <img
                        src={slide.image}
                        alt="Slide preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">Click to preview</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => update(slide.id, "image", "")}
                      className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <label className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      uploadingId === slide.id
                        ? "opacity-60 pointer-events-none border-gray-200"
                        : showErrors
                          ? "border-red-400 bg-red-50 hover:border-red-500"
                          : "border-[#D32F2F]/40 hover:border-[#D32F2F] hover:bg-red-50"
                    }`}>
                      {uploadingId === slide.id
                        ? <Loader2 size={20} className="animate-spin text-[#D32F2F]" />
                        : <Image size={20} className={showErrors ? "text-red-500" : "text-[#D32F2F]"} />
                      }
                      <span className={`text-xs font-medium ${showErrors ? "text-red-500" : "text-[#D32F2F]"}`}>
                        {uploadingId === slide.id ? "Uploading…" : "Upload Background Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload(slide.id)}
                        disabled={uploadingId === slide.id}
                      />
                    </label>
                    {showErrors && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium">
                        <AlertCircle size={11} /> Banner image is required
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                Title
              </label>
              <input
                value={slide.title}
                onChange={(e) => update(slide.id, "title", e.target.value)}
                placeholder="Slide title"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                value={slide.description}
                onChange={(e) =>
                  update(slide.id, "description", e.target.value)
                }
                rows={2}
                placeholder="Slide description"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Add {label}
      </button>
         <ImagePreviewPopup
              open={!!preview}
              onClose={() => setPreview(null)}
              imageUrl={preview?.url ?? ""}
              title={preview?.title}
            />
    </div>
  );
}
