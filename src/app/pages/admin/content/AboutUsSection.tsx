import { useEffect, useRef, useState } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Plus, Trash2, Image,
  TrendingUp, Users, Building2, Award, Star, Target, BarChart2, Clock, Globe,
  Shield, Zap, Heart, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench,
  DollarSign, ChevronDown,
} from 'lucide-react';
import { getAllAboutUs, addAboutUs, updateAboutUs } from '../../../services/AboutusService';
import { uploadFiles } from '../../../services/MediaService';
import SlideEditor from './SlideEditor';
import ImagePreviewPopup from '../../../components/ImagePreviewPopup';
import type { Slide, AboutStatItem, AboutWhyItem } from './types';

// ─── Icon catalogue (20 about-us-relevant icons) ────────────────────────────

const ABOUT_ICONS = [
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

function renderIcon(name: string, size = 16) {
  const found = ABOUT_ICONS.find(i => i.name === name);
  if (!found) return null;
  const Comp = found.Component;
  return <Comp size={size} />;
}

// ─── Icon Picker ─────────────────────────────────────────────────────────────

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
    <div ref={ref} className="relative ">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:border-[#D32F2F] focus:outline-none focus:border-[#D32F2F] bg-white"
      >
        <span className="flex items-center justify-center w-5 h-5 text-[#D32F2F] flex-shrink-0">
          {value ? renderIcon(value, 16) : <span className="w-4 h-4 border border-dashed border-gray-300 rounded block" />}
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
            {ABOUT_ICONS.map(({ name, Component }) => (
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

// ─── Single image upload ──────────────────────────────────────────────────────

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

// ─── Section header ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </h3>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AboutUsSection() {
  const [recordId, setRecordId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  // Banner slides
  const [slides, setSlides] = useState<Slide[]>([
    { id: Date.now(), image: '', title: '', description: '' },
  ]);

  // Homepage about us section
  const [hpTitle, setHpTitle] = useState('');
  const [hpDesc, setHpDesc] = useState('');
  const [hpImage, setHpImage] = useState('');

  // About page section
  const [apTitle, setApTitle] = useState('');
  const [apDesc, setApDesc] = useState('');
  const [apImage, setApImage] = useState('');

  // Years of experience
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  // Statistics
  const [statistics, setStatistics] = useState<AboutStatItem[]>([]);

  // Why choose us
  const [whyChooseUs, setWhyChooseUs] = useState<AboutWhyItem[]>([]);

  // Same-as-HP sync
  const [sameAsHp, setSameAsHp] = useState(false);

  // Mission / Vision / Our Values
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [ourValue, setOurValue] = useState('');

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllAboutUs(1, 1);
        const record = res?.data?.[0];
        if (record) {
          setRecordId(record.id);

          setSlides(
            record.slides?.length
              ? record.slides.map((s: any, i: number) => ({ id: Date.now() + i, image: s.image ?? '', title: s.title ?? '', description: s.description ?? '' }))
              : [{ id: Date.now(), image: '', title: '', description: '' }],
          );

          setHpTitle(record.homepageAboutUsTitle ?? '');
          setHpDesc(record.homepageAboutUsDescription ?? '');
          setHpImage(record.homepageAboutUsImage ?? '');

          setApTitle(record.aboutPageTitle ?? '');
          setApDesc(record.aboutPageDescription ?? '');
          setApImage(record.aboutPageImage ?? '');

          setYearsOfExperience(record.yearsOfExperience != null ? String(record.yearsOfExperience) : '');

          setStatistics(
            record.statistics?.length
              ? record.statistics.map((s: any, i: number) => ({ id: Date.now() + i, key: s.key ?? '', value: s.value ?? '', icon: s.icon ?? '' }))
              : [],
          );

          setWhyChooseUs(
            record.whyChooseUs?.length
              ? record.whyChooseUs.map((w: any, i: number) => ({ id: Date.now() + i, key: w.key ?? '', value: w.value ?? '', icon: w.icon ?? '' }))
              : [],
          );

          setMission(record.mission ?? '');
          setVision(record.vision ?? '');
          setOurValue(record.ourValue ?? '');
        }
      } catch {
        setError('Failed to load about us data');
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

  useEffect(() => {
    if (sameAsHp) {
      setApTitle(hpTitle);
      setApDesc(hpDesc);
      setApImage(hpImage);
    }
  }, [sameAsHp, hpTitle, hpDesc, hpImage]);

  // ── Save banner slides only ───────────────────────────────────────────────

  const handleSaveBanner = async () => {
    setSavingBanner(true);
    setBannerError(null);
    try {
      const payload = { slides: slides.map(({ id: _id, ...rest }) => rest) };
      if (recordId) {
        await updateAboutUs(payload, recordId);
      } else {
        const res = await addAboutUs(payload);
        setRecordId(res?.data?.id ?? res?.id ?? null);
      }
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 3500);
    } catch {
      setBannerError('Failed to save banner slides');
    } finally {
      setSavingBanner(false);
    }
  };

  // ── Save all ──────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slides: slides.map(({ id: _id, ...rest }) => rest),
        homepageAboutUsTitle: hpTitle,
        homepageAboutUsDescription: hpDesc,
        homepageAboutUsImage: hpImage,
        aboutPageTitle: apTitle,
        aboutPageDescription: apDesc,
        aboutPageImage: apImage,
        yearsOfExperience: yearsOfExperience !== '' ? Number(yearsOfExperience) : null,
        statistics: statistics.map(({ id: _id, ...rest }) => rest),
        whyChooseUs: whyChooseUs.map(({ id: _id, ...rest }) => rest),
        mission,
        vision,
        ourValue,
      };

      if (recordId) {
        await updateAboutUs(payload, recordId);
      } else {
        const res = await addAboutUs(payload);
        setRecordId(res?.data?.id ?? res?.id ?? null);
      }
      setSaved(true);
    } catch {
      setError('Failed to save about us data');
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers for array sections ────────────────────────────────────────────

  const addStat = () =>
    setStatistics(prev => [...prev, { id: Date.now(), key: '', value: '', icon: '' }]);

  const updateStat = (id: number, field: keyof AboutStatItem, val: string) =>
    setStatistics(prev => prev.map(s => (s.id === id ? { ...s, [field]: val } : s)));

  const removeStat = (id: number) =>
    setStatistics(prev => prev.filter(s => s.id !== id));

  const addWhy = () =>
    setWhyChooseUs(prev => [...prev, { id: Date.now(), key: '', value: '', icon: '' }]);

  const updateWhy = (id: number, field: keyof AboutWhyItem, val: string) =>
    setWhyChooseUs(prev => prev.map(w => (w.id === id ? { ...w, [field]: val } : w)));

  const removeWhy = (id: number) =>
    setWhyChooseUs(prev => prev.filter(w => w.id !== id));

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading about us data…
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

      {/* ── Page Banner Slides ── */}
      <div>
        <SectionTitle>Page Banner Slides</SectionTitle>
        {bannerError && (
          <div className="flex items-center gap-2 px-4 py-3 mb-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle size={14} /> {bannerError}
          </div>
        )}
        <SlideEditor slides={slides} setSlides={setSlides} label="Slide" />
        <div className="flex items-center justify-end gap-3 pt-3 mt-3 border-t border-gray-100">
          {savedBanner && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle size={14} /> Saved successfully
            </div>
          )}
          <button
            type="button"
            onClick={handleSaveBanner}
            disabled={savingBanner}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            {savingBanner ? 'Saving…' : 'Save Slides'}
          </button>
        </div>
      </div>

      {/* ── Homepage About Us ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionTitle>Homepage About Us Section</SectionTitle>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Title</label>
            <input
              value={hpTitle}
              onChange={e => setHpTitle(e.target.value)}
              placeholder="Homepage about us title"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Description</label>
            <textarea
              value={hpDesc}
              onChange={e => setHpDesc(e.target.value)}
              rows={3}
              placeholder="Homepage about us description"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Image</label>
            <SingleImageUpload value={hpImage} onChange={setHpImage} label="Homepage About Us Image" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
            <input
              type="checkbox"
              checked={sameAsHp}
              onChange={e => setSameAsHp(e.target.checked)}
              className="w-4 h-4 accent-[#D32F2F] rounded"
            />
            <span className="text-xs font-semibold text-[#616161]">Same as About Page</span>
          </label>
        </div>
      </div>

      {/* ── About Page Section ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionTitle>About Page Section</SectionTitle>
      
        <div className={`space-y-3 `}>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Title</label>
            <input
              value={apTitle}
              onChange={e => setApTitle(e.target.value)}
              placeholder="About page title"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Description</label>
            <textarea
              value={apDesc}
              onChange={e => setApDesc(e.target.value)}
              rows={3}
              placeholder="About page description"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Image</label>
            <SingleImageUpload value={apImage} onChange={setApImage} label="About Page Image" />
          </div>
        </div>
      </div>

      {/* ── Years of Experience ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionTitle>Years of Experience</SectionTitle>
        <div className="w-full sm:w-48">
          <input
            type="number"
            min="0"
            value={yearsOfExperience}
            onChange={e => setYearsOfExperience(e.target.value)}
            placeholder="e.g. 15"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
          />
        </div>
      </div>

      {/* ── Statistics ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionTitle>Statistics</SectionTitle>
        <div className="space-y-3">
          {statistics.map((stat, idx) => (
            <div key={stat.id} className="border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-t-xl">
                <span className="font-semibold text-[#212121] text-sm">Statistic {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeStat(stat.id)}
                  className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Key (Label)</label>
                  <input
                    value={stat.key}
                    onChange={e => updateStat(stat.id, 'key', e.target.value)}
                    placeholder="e.g. Projects Completed"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Value</label>
                  <input
                    value={stat.value}
                    onChange={e => updateStat(stat.id, 'value', e.target.value)}
                    placeholder="e.g. 500+"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Icon</label>
                  <IconPicker value={stat.icon} onChange={val => updateStat(stat.id, 'icon', val)} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addStat}
            className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Statistic
          </button>
        </div>
      </div>

      {/* ── Why Choose Us ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionTitle>Why Choose Us</SectionTitle>
        <div className="space-y-3">
          {whyChooseUs.map((item, idx) => (
            <div key={item.id} className="border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 rounded-t-xl">
                <span className="font-semibold text-[#212121] text-sm">Reason {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeWhy(item.id)}
                  className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Key (Heading)</label>
                  <input
                    value={item.key}
                    onChange={e => updateWhy(item.id, 'key', e.target.value)}
                    placeholder="e.g. Expert Team"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Value (Detail)</label>
                  <input
                    value={item.value}
                    onChange={e => updateWhy(item.id, 'value', e.target.value)}
                    placeholder="e.g. 15+ years experience"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] mb-1">Icon</label>
                  <IconPicker value={item.icon} onChange={val => updateWhy(item.id, 'icon', val)} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addWhy}
            className="w-full py-3 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Reason
          </button>
        </div>
      </div>

      {/* ── Mission / Vision / Our Values ── */}
      <div className="border-t border-gray-100 pt-6">
        <SectionTitle>Mission, Vision &amp; Our Values</SectionTitle>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Mission</label>
            <textarea
              value={mission}
              onChange={e => setMission(e.target.value)}
              rows={3}
              placeholder="Company mission statement"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Vision</label>
            <textarea
              value={vision}
              onChange={e => setVision(e.target.value)}
              rows={3}
              placeholder="Company vision statement"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Our Values</label>
            <textarea
              value={ourValue}
              onChange={e => setOurValue(e.target.value)}
              rows={3}
              placeholder="Core values of the company"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
            />
          </div>
        </div>
      </div>

      {/* ── Save ── */}
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
