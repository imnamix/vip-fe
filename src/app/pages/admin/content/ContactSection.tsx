import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2,
  Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Twitter, Linkedin,
  Link, Hash, Image, Loader, Share2,
} from 'lucide-react';
import {
  fetchContact, saveContact, saveContactSlides,
  setSlides, setContactField, setAddressField, setSocialLinkField,
  clearContactSaved, clearSlidesSaved,
} from '../../../store/slice/ContactSlice';
import type { RootState, AppDispatch } from '../../../store/Store';
import type { BannerSlide, Address, SocialLinks } from '../../../store/slice/ContactSlice';
import { uploadFiles } from '../../../services/MediaService';
import { usePermission } from '../../../hooks/usePermission';
import ImagePreviewPopup from '../../../components/ImagePreviewPopup';

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={15} className="text-[#D32F2F] flex-shrink-0" />
      <h3 className="font-bold text-[#212121] text-sm leading-none m-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {children}
      </h3>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
    />
  );
}

function SaveBar({ saving, saved, onSave, label = 'Save Changes', canUpdate = true }: {
  saving: boolean; saved: boolean; onSave: () => void; label?: string; canUpdate?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-3 mt-3 border-t border-gray-100">
      {saved && (
        <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
          <CheckCircle size={14} /> Saved successfully
        </div>
      )}
      {canUpdate && (
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {saving ? 'Saving…' : label}
        </button>
      )}
    </div>
  );
}

// ─── Banner Slide Editor ──────────────────────────────────────────────────────

function BannerSlideEditor({ slides, setSlidesFn, showErrors = false, canWrite = true, canDelete = true }: {
  slides: BannerSlide[];
  setSlidesFn: (s: BannerSlide[]) => void;
  showErrors?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
}) {
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);

  const update = (id: number, field: keyof BannerSlide, value: string) =>
    setSlidesFn(slides.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleImageUpload = (id: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('files', file);
    setUploadingId(id);
    try {
      const res = await uploadFiles(fd);
      const up = res?.files?.[0];
      if (up?.success && up?.data?.access_url) update(id, 'image', up.data.access_url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {slides.map((slide, idx) => (
        <div key={slide.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5">
            <span className="font-semibold text-[#212121] text-sm">Slide {idx + 1}</span>
            {canDelete && (
              <button
                type="button"
                onClick={() => setSlidesFn(slides.filter(s => s.id !== slide.id))}
                className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <div className="p-4 space-y-3">
            <Field label="Banner Image" required>
              {slide.image ? (
                <div className="border border-gray-200 rounded-xl p-3">
                  <div className="relative group cursor-pointer" onClick={() => setPreview({ url: slide.image, title: 'Slide Image' })}>
                    <img src={slide.image} alt="Slide" className="w-full h-40 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">Click to preview</span>
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => update(slide.id, 'image', '')}
                      className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <label className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    uploadingId === slide.id
                      ? 'opacity-60 pointer-events-none border-gray-200'
                      : showErrors
                        ? 'border-red-400 bg-red-50 hover:border-red-500'
                        : 'border-[#D32F2F]/40 hover:border-[#D32F2F] hover:bg-red-50'
                  }`}>
                    {uploadingId === slide.id ? <Loader size={20} className="animate-spin text-[#D32F2F]" /> : <Image size={20} className={showErrors ? 'text-red-500' : 'text-[#D32F2F]'} />}
                    <span className={`text-xs font-medium ${showErrors ? 'text-red-500' : 'text-[#D32F2F]'}`}>
                      {uploadingId === slide.id ? 'Uploading…' : 'Upload Banner Image'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload(slide.id)} disabled={uploadingId === slide.id} />
                  </label>
                  {showErrors && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium">
                      <AlertCircle size={11} /> Banner image is required
                    </p>
                  )}
                </>
              )}
            </Field>
            <Field label="Title">
              <TextInput value={slide.title} onChange={v => update(slide.id, 'title', v)} placeholder="Slide title" />
            </Field>
            <Field label="Description">
              <textarea
                value={slide.description}
                onChange={e => update(slide.id, 'description', e.target.value)}
                rows={2}
                placeholder="Slide description"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
              />
            </Field>
          </div>
        </div>
      ))}
      {canWrite && (
        <button
          type="button"
          onClick={() => setSlidesFn([...slides, { id: Date.now(), image: '', title: '', description: '' }])}
          className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Slide
        </button>
      )}
      <ImagePreviewPopup open={!!preview} onClose={() => setPreview(null)} imageUrl={preview?.url ?? ''} title={preview?.title} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContactSection() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data,
    loading,
    saving,
    saved,
    savingSlides,
    savedSlides,
    error,
    slidesError,
  } = useSelector((state: RootState) => state.contact);

  const [slideShowErrors, setSlideShowErrors] = useState(false);
  const { can } = usePermission();
  const canWrite  = can('Content', 'write');
  const canUpdate = can('Content', 'update');
  const canDelete = can('Content', 'delete');

  useEffect(() => {
    dispatch(fetchContact());
  }, [dispatch]);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => dispatch(clearContactSaved()), 3500);
      return () => clearTimeout(t);
    }
  }, [saved, dispatch]);

  useEffect(() => {
    if (savedSlides) {
      const t = setTimeout(() => dispatch(clearSlidesSaved()), 3500);
      return () => clearTimeout(t);
    }
  }, [savedSlides, dispatch]);

  const setAddr = (key: keyof Address, value: string) => dispatch(setAddressField({ key, value }));
  const setSocial = (key: keyof SocialLinks, value: string) => dispatch(setSocialLinkField({ key, value }));
  const setField = (key: keyof Omit<typeof data, 'recordId' | 'slides' | 'address' | 'socialLinks'>, value: string) =>
    dispatch(setContactField({ key, value }));

  const handleSaveSlides = () => {
    if (data.slides.some(s => !s.image)) {
      setSlideShowErrors(true);
      return;
    }
    setSlideShowErrors(false);
    dispatch(saveContactSlides({ slides: data.slides, recordId: data.recordId }));
  };

  const handleSave = () => {
    if (data.slides.some(s => !s.image)) {
      setSlideShowErrors(true);
      return;
    }
    dispatch(saveContact({ data }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading contact data…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* ── Banner Slides ── */}
      <div>
        <SectionHeader icon={Image}>Banner Slides</SectionHeader>
        {slidesError && (
          <div className="flex items-center gap-2 px-4 py-3 mb-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle size={14} /> {slidesError}
          </div>
        )}
        <BannerSlideEditor
          slides={data.slides}
          setSlidesFn={s => dispatch(setSlides(s))}
          showErrors={slideShowErrors}
          canWrite={canWrite}
          canDelete={canDelete}
        />
        <SaveBar saving={savingSlides} saved={savedSlides} onSave={handleSaveSlides} label="Save Slides" canUpdate={canUpdate} />
      </div>

      {/* ── Contact Numbers ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionHeader icon={Phone}>Contact Numbers</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact Number">
            <TextInput value={data.contactNumber} onChange={v => setField('contactNumber', v)} placeholder="+91 98765 43210" type="tel" />
          </Field>
          <Field label="WhatsApp Number">
            <TextInput value={data.whatsappNumber} onChange={v => setField('whatsappNumber', v)} placeholder="+91 98765 43210" type="tel" />
          </Field>
        </div>
      </div>

      {/* ── Email Addresses ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionHeader icon={Mail}>Email Addresses</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Office Email">
            <TextInput value={data.officeEmail} onChange={v => setField('officeEmail', v)} placeholder="info@company.com" type="email" />
          </Field>
          <Field label="Alternate Office Email">
            <TextInput value={data.alternateOfficeEmail} onChange={v => setField('alternateOfficeEmail', v)} placeholder="support@company.com" type="email" />
          </Field>
        </div>
      </div>

      {/* ── Address ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionHeader icon={MapPin}>Office Address</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Office Number">
            <TextInput value={data.address.officeNumber} onChange={v => setAddr('officeNumber', v)} placeholder="e.g. 301, 3rd Floor" />
          </Field>
          <Field label="Building / Complex">
            <TextInput value={data.address.building} onChange={v => setAddr('building', v)} placeholder="e.g. Skyline Tower" />
          </Field>
          <Field label="Landmark">
            <TextInput value={data.address.landmark} onChange={v => setAddr('landmark', v)} placeholder="e.g. Near City Mall" />
          </Field>
          <Field label="Street / Area">
            <TextInput value={data.address.street} onChange={v => setAddr('street', v)} placeholder="e.g. MG Road" />
          </Field>
          <Field label="City">
            <TextInput value={data.address.city} onChange={v => setAddr('city', v)} placeholder="e.g. Mumbai" />
          </Field>
          <Field label="State">
            <TextInput value={data.address.state} onChange={v => setAddr('state', v)} placeholder="e.g. Maharashtra" />
          </Field>
          <Field label="Pincode">
            <TextInput value={data.address.pincode} onChange={v => setAddr('pincode', v)} placeholder="e.g. 400001" />
          </Field>
          <Field label="Country">
            <TextInput value={data.address.country} onChange={v => setAddr('country', v)} placeholder="e.g. India" />
          </Field>
        </div>
      </div>

      {/* ── Working Hours ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionHeader icon={Clock}>Working Hours</SectionHeader>
        <textarea
          value={data.workingHours}
          onChange={e => setField('workingHours', e.target.value)}
          rows={3}
          placeholder={"Mon–Sat: 9 AM – 8 PM\nSunday: 10 AM – 5 PM"}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
        />
      </div>

      {/* ── Business Details ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionHeader icon={Hash}>Business Details</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="GST Number">
            <TextInput value={data.gstNumber} onChange={v => setField('gstNumber', v)} placeholder="e.g. 27AABCU9603R1ZX" />
          </Field>
          <Field label="Google Map Link">
            <div className="relative">
              <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" />
              <input
                value={data.googleMapLink}
                onChange={e => setField('googleMapLink', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>
          </Field>
        </div>
      </div>

      {/* ── Social Links ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionHeader icon={Share2}>Social Media Links</SectionHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Facebook">
            <div className="relative">
              <Facebook size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1877F2]" />
              <input
                value={data.socialLinks.facebook}
                onChange={e => setSocial('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>
          </Field>
          <Field label="Instagram">
            <div className="relative">
              <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E4405F]" />
              <input
                value={data.socialLinks.instagram}
                onChange={e => setSocial('instagram', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>
          </Field>
          <Field label="YouTube">
            <div className="relative">
              <Youtube size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF0000]" />
              <input
                value={data.socialLinks.youtube}
                onChange={e => setSocial('youtube', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>
          </Field>
          <Field label="X (Twitter)">
            <div className="relative">
              <Twitter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#212121]" />
              <input
                value={data.socialLinks.x}
                onChange={e => setSocial('x', e.target.value)}
                placeholder="https://x.com/yourhandle"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>
          </Field>
          <Field label="LinkedIn">
            <div className="relative">
              <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0A66C2]" />
              <input
                value={data.socialLinks.linkedin}
                onChange={e => setSocial('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourpage"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>
          </Field>
        </div>
      </div>

      {/* ── Save All ── */}
      <SaveBar saving={saving} saved={saved} onSave={handleSave} canUpdate={canUpdate} />
    </div>
  );
}
