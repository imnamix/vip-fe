import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { Slide } from './content/types';
import SlideEditor from './content/SlideEditor';
import { getEventBanner, saveEventBanner } from '../../services/EventBannerService';

export default function EventBannerSlides() {
  const navigate = useNavigate();

  const [slides, setSlides] = useState<Slide[]>([
    { id: Date.now(), image: '', title: '', description: '' },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideShowErrors, setSlideShowErrors] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getEventBanner();
        const record = res?.data;
        if (record) {
          const raw: { title: string; description: string; image?: string }[] =
            record.slides ?? [];
          setSlides(
            raw.length
              ? raw.map((s, i) => ({
                  id: Date.now() + i,
                  image: s.image ?? '',
                  title: s.title,
                  description: s.description,
                }))
              : [{ id: Date.now(), image: '', title: '', description: '' }],
          );
        }
      } catch {
        setError('Failed to load banner slides');
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

  const handleSave = async () => {
    if (slides.some(s => !s.image)) {
      setSlideShowErrors(true);
      return;
    }
    setSlideShowErrors(false);
    setSaving(true);
    setError(null);
    try {
      const payload = { slides: slides.map(({ id: _id, ...rest }) => rest) };
      await saveEventBanner(payload);
      setSaved(true);
    } catch {
      setError('Failed to save banner slides');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading banner slides…
      </div>
    );
  }

  return (
    <>
    
        <button
          type="button"
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium mb-2 transition-colors"
        >
          <ChevronLeft size={15} /> Back to Events
        </button>
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Event Banner Slides
          </h1>
        </div>
        <p className="text-xs text-[#9E9E9E] mt-1">
          These slides appear as the hero banner on the Events page.
        </p>
      </div>


      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Banner Slides
        </h3>
        <SlideEditor
          slides={slides}
          setSlides={setSlides}
          label="Slide"
          showErrors={slideShowErrors}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium mr-auto">
            <CheckCircle size={14} /> Saved successfully
          </div>
        )}
        {error && (
          <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium mr-auto">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate('/admin/events')}
          className="px-5 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : 'Save Slides'}
        </button>
      </div>
    </div>
    </>
  );
}
