import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChevronLeft,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Image,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  addEvents,
  updateEvents,
  getEventsByID,
} from "../../services/EventsService";
import { uploadFiles } from "../../services/MediaService";
import ImagePreviewPopup from "../../components/ImagePreviewPopup";

interface ScheduleItem {
  time: string;
  title: string;
}

interface FormState {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  seats: string;
  fees: string;
  status: string;
  image: string;
  gallery: string[];
}

const STATUS_OPTIONS = ["Draft", "Upcoming", "Completed", "Cancelled"];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["clean"],
  ],
};

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id) && id !== "new";

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    seats: "",
    fees: "",
    status: "Draft",
    image: "",
    gallery: [],
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { time: "", title: "" },
  ]);
  const [errors, setErrors] = useState<
    Partial<Record<"title" | "date", string>>
  >({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getEventsByID(id);
        const e = res?.data;
        if (e) {
          setForm({
            title: e.title ?? "",
            description: e.description ?? "",
            date: e.eventDate ?? "",
            startTime: e.eventTime ?? "",
            endTime: e.endTime ?? "",
            venue: e.location ?? "",
            seats: e.seats != null ? String(e.seats) : "",
            fees: e.fees ?? "",
            status: e.eventStatus ?? "Draft",
            image:
              Array.isArray(e.mainImage) && e.mainImage[0]?.media_url
                ? e.mainImage[0].media_url
                : "",
            gallery: Array.isArray(e.galleryImages)
              ? e.galleryImages
                  .map((i: { media_url: string }) => i.media_url)
                  .filter(Boolean)
              : [],
          });
          if (Array.isArray(e.schedules) && e.schedules.length > 0) {
            setSchedule(e.schedules);
          }
        }
      } catch {
        setSaveError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, id]);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const setField = (k: keyof Omit<FormState, "gallery">, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "title" || k === "date")
      setErrors((ex) => ({ ...ex, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<"title" | "date", string>> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("files", file);
    setUploadingImage(true);
    try {
      const res = await uploadFiles(fd);
      const up = res?.files?.[0];
      if (up?.success && up?.data?.access_url)
        setField("image", up.data.access_url);
    } catch {
      // silently ignore
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleUploadGallery = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("files", file);
        const res = await uploadFiles(fd);
        const up = res?.files?.[0];
        if (up?.success && up?.data?.access_url) urls.push(up.data.access_url);
      }
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls] }));
    } catch {
      // silently ignore
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm((f) => ({
      ...f,
      gallery: f.gallery.filter((_, i) => i !== index),
    }));
  };

  const addScheduleRow = () =>
    setSchedule((s) => [...s, { time: "", title: "" }]);
  const removeScheduleRow = (i: number) =>
    setSchedule((s) => s.filter((_, j) => j !== i));
  const updateSchedule = (
    i: number,
    field: keyof ScheduleItem,
    value: string,
  ) => {
    setSchedule((s) =>
      s.map((x, j) => (j === i ? { ...x, [field]: value } : x)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        eventDate: form.date,
        eventTime: form.startTime || null,
        endTime: form.endTime || null,
        location: form.venue,
        seats: form.seats ? Number(form.seats) : null,
        fees: form.fees,
        eventStatus: form.status,
        mainImage: form.image
          ? [{ media_url: form.image, media_type: "image" }]
          : null,
        galleryImages: form.gallery.length
          ? form.gallery.map((url) => ({ media_url: url, media_type: "image" }))
          : null,
        schedules: schedule.filter((s) => s.time || s.title),
      };
      if (isEdit && id) {
        await updateEvents(payload, id);
      } else {
        await addEvents(payload);
      }
      setSaved(true);
      setTimeout(() => navigate("/admin/events"), 1500);
    } catch {
      setSaveError("Failed to save event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading event…
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate("/admin/events")}
        className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium mb-2 transition-colors"
      >
        <ChevronLeft size={15} /> Back to Events
      </button>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <h1
              className="text-xl font-bold text-[#212121]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {isEdit ? "Edit Event" : "Create Event"}
            </h1>
            {saved && (
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl font-medium">
                <CheckCircle size={13} /> {isEdit ? "Updated" : "Created"}
              </div>
            )}
          </div>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle size={14} /> {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Event Details ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3
              className="font-bold text-[#212121] mb-4 text-sm"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Event Details
            </h3>
            <div className="space-y-4">
              {/* Event Image */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                  Event Image
                </label>
                {form.image ? (
                  <div className="border border-gray-200 rounded-xl p-3">
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setImgPreview(form.image)}
                    >
                      <img
                        src={form.image}
                        alt="Event"
                        className="w-full h-44 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full">
                          Click to preview
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField("image", "")}
                      className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center gap-2 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingImage ? "opacity-60 pointer-events-none border-gray-200" : "border-[#D32F2F]/40 hover:border-[#D32F2F] hover:bg-red-50"}`}
                  >
                    {uploadingImage ? (
                      <Loader2
                        size={20}
                        className="animate-spin text-[#D32F2F]"
                      />
                    ) : (
                      <Image size={20} className="text-[#D32F2F]" />
                    )}
                    <span className="text-xs text-[#D32F2F] font-medium">
                      {uploadingImage ? "Uploading…" : "Upload Event Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadImage}
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                  Title <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Event title"
                  className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none ${errors.title ? "border-[#D32F2F] bg-red-50 focus:border-[#D32F2F]" : "border-gray-200 focus:border-[#D32F2F]"}`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <div className="rounded-xl overflow-hidden border border-gray-200 [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-gray-200 [&_.ql-editor]:min-h-[140px] [&_.ql-editor]:text-sm">
                  <ReactQuill
                    theme="snow"
                    value={form.description}
                    onChange={(html: string) => setField("description", html)}
                    modules={QUILL_MODULES}
                  />
                </div>
              </div>

              {/* Date / Start Time / End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    Date <span className="text-[#D32F2F]">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setField("date", e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none ${errors.date ? "border-[#D32F2F] bg-red-50 focus:border-[#D32F2F]" : "border-gray-200 focus:border-[#D32F2F]"}`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setField("startTime", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setField("endTime", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                  Venue
                </label>
                <input
                  value={form.venue}
                  onChange={(e) => setField("venue", e.target.value)}
                  placeholder="Event venue or location"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                />
              </div>

              {/* Seats / Fees / Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    Seats
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.seats}
                    onChange={(e) => setField("seats", e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    Fees
                  </label>
                  <input
                    value={form.fees}
                    onChange={(e) => setField("fees", e.target.value)}
                    placeholder="e.g. ₹4999 or Free"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Schedule ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3
              className="font-bold text-[#212121] mb-4 text-sm"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Schedule
            </h3>
            <div className="space-y-3">
              {schedule.map((s, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input
                    type="time"
                    value={s.time}
                    onChange={(e) => updateSchedule(i, "time", e.target.value)}
                    className="w-28 flex-shrink-0 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                  <input
                    value={s.title}
                    onChange={(e) => updateSchedule(i, "title", e.target.value)}
                    placeholder="Session title"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                  />
                  <button
                    type="button"
                    onClick={() => removeScheduleRow(i)}
                    className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addScheduleRow}
              className="mt-3 w-full py-2.5 border-2 border-dashed border-[#D32F2F]/40 text-[#D32F2F] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus size={13} /> Add Session
            </button>
          </div>

          {/* ── Event Gallery ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3
              className="font-bold text-[#212121] mb-4 text-sm"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Event Gallery
            </h3>
            {form.gallery.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {form.gallery.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      onClick={() => setImgPreview(url)}
                      className="w-full h-24 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label
              className={`flex flex-col items-center gap-2 py-7 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadingGallery ? "opacity-60 pointer-events-none border-gray-200" : "border-[#D32F2F]/40 hover:border-[#D32F2F] hover:bg-red-50"}`}
            >
              {uploadingGallery ? (
                <Loader2 size={20} className="animate-spin text-[#D32F2F]" />
              ) : (
                <Image size={20} className="text-[#D32F2F]" />
              )}
              <span className="text-xs text-[#D32F2F] font-medium">
                {uploadingGallery ? "Uploading…" : "Upload Gallery Images"}
              </span>
              <span className="text-[10px] text-[#9E9E9E]">
                Select multiple images at once
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUploadGallery}
                disabled={uploadingGallery}
              />
            </label>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Saving…" : isEdit ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>

        <ImagePreviewPopup
          open={!!imgPreview}
          onClose={() => setImgPreview(null)}
          imageUrl={imgPreview ?? ""}
          title="Image Preview"
        />
      </div>
    </>
  );
}
