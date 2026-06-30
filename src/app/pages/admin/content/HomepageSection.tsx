import { useEffect, useState } from 'react';
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getAllHomepage, addHomepage, updateHomepage } from '../../../services/HomepageService';
import { usePermission } from '../../../hooks/usePermission';
import type { Slide } from './types';
import SlideEditor from './SlideEditor';

export default function HomepageSection() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: Date.now(), image: "", title: "", description: "" },
  ]);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideShowErrors, setSlideShowErrors] = useState(false);
  const { can } = usePermission();
  const canWrite  = can('Content', 'write');
  const canUpdate = can('Content', 'update');
  const canDelete = can('Content', 'delete');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllHomepage(1, 1);
        const record = res?.data?.[0];
        if (record) {
          setRecordId(record.id);
          const raw: { title: string; description: string; image?: string }[] =
            record.slides ?? [];
          setSlides(
            raw.length
              ? raw.map((s, i) => ({
                  id: Date.now() + i,
                  image: s.image ?? "",
                  title: s.title,
                  description: s.description,
                }))
              : [{ id: Date.now(), image: "", title: "", description: "" }],
          );
        }
      } catch {
        setError("Failed to load homepage data");
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

  // Scroll to top after successful save
  useEffect(() => {
    if (saved) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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
      if (recordId) {
        await updateHomepage(payload, recordId);
      } else {
        const res = await addHomepage(payload);
        setRecordId(res?.data?.id ?? null);
      }
      setSaved(true);
    } catch {
      setError("Failed to save homepage data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading homepage data…
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

      <div>
        <h3
          className="font-bold text-[#212121] mb-4 text-sm"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Hero Banner Slides
        </h3>
        <SlideEditor slides={slides} setSlides={setSlides} label="Slide" showErrors={slideShowErrors} canWrite={canWrite} canDelete={canDelete} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
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
            {saving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}
