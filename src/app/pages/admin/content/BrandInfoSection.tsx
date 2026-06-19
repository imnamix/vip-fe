import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Upload, Trash2, Save, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { fetchBrandInfo, saveBrandInfo, setBrandField, clearSaved } from "../../../store/slice/BrandInfoSlice";
import type { RootState, AppDispatch } from "../../../store/Store";
import type { BrandState } from "./types";
import { uploadFiles } from "../../../services/MediaService";
import ImagePreviewPopup from "../../../components/ImagePreviewPopup";

// ── Validation ────────────────────────────────────────────────────────────────
type Errors = Partial<Record<keyof BrandState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{7,15}$/;

function validate(data: BrandState): Errors {
  const e: Errors = {};
  if (!data.companyName.trim()) e.companyName = "Company name is required.";
  if (!data.phone.trim()) {
    e.phone = "Phone is required.";
  } else if (!PHONE_RE.test(data.phone.replace(/[\s\-+()]/g, ""))) {
    e.phone = "Enter a valid phone number (7–15 digits).";
  }
  if (!data.email.trim()) {
    e.email = "Email is required.";
  } else if (!EMAIL_RE.test(data.email)) {
    e.email = "Enter a valid email address.";
  }
  if (data.metaTitle.length > 60) e.metaTitle = "Meta title must be 60 characters or fewer.";
  if (data.metaDesc.length > 160) e.metaDesc = "Meta description must be 160 characters or fewer.";
  return e;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BrandInfoSection() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: brand,
    loading,
    saving,
    saved,
    error,
  } = useSelector((state: RootState) => state.brandInfo);

  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<keyof BrandState | null>(null);
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    dispatch(fetchBrandInfo());
  }, [dispatch]);

  // Re-validate live once the user has attempted a save
  useEffect(() => {
    if (submitted) setErrors(validate(brand));
  }, [brand, submitted]);

  // Auto-clear the "Saved" toast after 2.5 s
  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => dispatch(clearSaved()), 3500);
      return () => clearTimeout(t);
    }
  }, [saved, dispatch]);

  // Scroll to top after successful save
  useEffect(() => {
    if (saved) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [saved]);

  const set = (key: keyof BrandState, value: string) =>
    dispatch(setBrandField({ key, value }));

  const handleImageUpload =
    (key: keyof BrandState) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("files", file);
      setUploadingKey(key);
      try {
        const res = await uploadFiles(formData);
        const uploaded = res?.files?.[0];
        if (uploaded?.success && uploaded?.data?.access_url) {
          set(key, uploaded.data.access_url);
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      } finally {
        setUploadingKey(null);
      }
    };

  const handleSave = () => {
    setSubmitted(true);
    const errs = validate(brand);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    dispatch(saveBrandInfo(brand));
  };

  // ── Field helpers ────────────────────────────────────────────────────────
  const fieldClass = (key: keyof BrandState) =>
    `w-full px-3 py-2 border rounded-xl text-sm focus:outline-none transition-colors ${
      errors[key]
        ? "border-red-400 focus:border-red-500 bg-red-50"
        : "border-gray-200 focus:border-[#D32F2F]"
    }`;

  const FieldError = ({ name }: { name: keyof BrandState }) =>
    errors[name] ? (
      <p className="flex items-center gap-1 mt-1 text-xs text-red-500">
        <AlertCircle size={11} /> {errors[name]}
      </p>
    ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#616161] text-sm">
        Loading brand info…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global API error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Logo & Favicon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Brand Logo */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-3">
            Brand Logo
          </label>

          <div className="flex items-center gap-3">
            {brand.logo ? (
              <>
                <img
                  src={brand.logo}
                  alt="Brand Logo"
                  className="w-16 h-16 object-contain border rounded-lg p-1 bg-white cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPreview({ url: brand.logo, title: "Brand Logo" })}
                />

                <button
                  type="button"
                  onClick={() => set("logo", "")}
                  className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </>
            ) : (
              <label
                className={`flex items-center gap-2 px-3 py-2 text-xs text-[#D32F2F] border border-dashed border-[#D32F2F] rounded-lg cursor-pointer hover:bg-red-50 ${
                  uploadingKey === "logo"
                    ? "opacity-60 pointer-events-none"
                    : ""
                }`}
              >
                {uploadingKey === "logo" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}

                {uploadingKey === "logo" ? "Uploading..." : "Upload Logo"}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload("logo")}
                  disabled={uploadingKey === "logo"}
                />
              </label>
            )}
          </div>
        </div>

        {/* Favicon */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-3">
            Favicon
          </label>

          <div className="flex items-center gap-3">
            {brand.favicon ? (
              <>
                <img
                  src={brand.favicon}
                  alt="Favicon"
                  className="w-16 h-16 object-contain border rounded-lg p-1 bg-white cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPreview({ url: brand.favicon, title: "Favicon" })}
                />

                <button
                  type="button"
                  onClick={() => set("favicon", "")}
                  className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </>
            ) : (
              <label
                className={`flex items-center gap-2 px-3 py-2 text-xs text-[#D32F2F] border border-dashed border-[#D32F2F] rounded-lg cursor-pointer hover:bg-red-50 ${
                  uploadingKey === "favicon"
                    ? "opacity-60 pointer-events-none"
                    : ""
                }`}
              >
                {uploadingKey === "favicon" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}

                {uploadingKey === "favicon" ? "Uploading..." : "Upload Favicon"}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload("favicon")}
                  disabled={uploadingKey === "favicon"}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3
          className="font-bold text-[#212121] mb-4 text-sm"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Company Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              value={brand.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              placeholder="Company name"
              className={fieldClass("companyName")}
            />
            <FieldError name="companyName" />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              value={brand.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className={fieldClass("phone")}
            />
            <FieldError name="phone" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              value={brand.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="contact@company.com"
              className={fieldClass("email")}
            />
            <FieldError name="email" />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Address
            </label>
            <input
              value={brand.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Main St, City"
              className={fieldClass("address")}
            />
            <FieldError name="address" />
          </div>
        </div>
      </div>

      {/* Global SEO */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3
          className="font-bold text-[#212121] mb-4 text-sm"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Global SEO & Meta
        </h3>
        <div className="space-y-3">
          {/* Meta Title */}
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Default Meta Title
            </label>
            <input
              value={brand.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder="Meta title (max 60 chars)"
              className={fieldClass("metaTitle")}
            />
            <div className={`flex items-center justify-between mt-1`}>
              <FieldError name="metaTitle" />
              <span
                className={`text-xs ml-auto ${brand.metaTitle.length > 60 ? "text-red-500" : "text-green-500"}`}
              >
                {brand.metaTitle.length}/60
                {brand.metaTitle.length > 60
                  ? " — Too long"
                  : brand.metaTitle.length > 0
                    ? " — Good"
                    : ""}
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Default Meta Description
            </label>
            <textarea
              value={brand.metaDesc}
              onChange={(e) => set("metaDesc", e.target.value)}
              rows={2}
              placeholder="Meta description (max 160 chars)"
              className={`resize-none ${fieldClass("metaDesc")}`}
            />
            <div className="flex items-center justify-between mt-1">
              <FieldError name="metaDesc" />
              <span
                className={`text-xs ml-auto ${brand.metaDesc.length > 160 ? "text-red-500" : "text-green-500"}`}
              >
                {brand.metaDesc.length}/160
              </span>
            </div>
          </div>

          {/* OG Image — 50% width on lg, left-aligned */}
          <div className="w-full lg:w-1/2">
            <label className="block text-xs font-semibold text-[#616161] mb-2">
              OG Image
            </label>
            <div className="border border-gray-200 rounded-xl p-4">
              {brand.ogImage ? (
                <div className="flex items-start gap-3">
                  <img
                    src={brand.ogImage}
                    alt="OG Preview"
                    className="w-40 h-24 object-cover rounded-lg border flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setPreview({ url: brand.ogImage, title: "OG Image" })}
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-[#616161]">
                      Recommended: 1200×630px
                    </span>
                    <button
                      type="button"
                      onClick={() => set("ogImage", "")}
                      className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 w-fit"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center gap-2 py-6 text-xs text-[#D32F2F] border border-dashed border-[#D32F2F] rounded-lg cursor-pointer hover:bg-red-50 ${uploadingKey === "ogImage" ? "opacity-60 pointer-events-none" : ""}`}
                >
                  {uploadingKey === "ogImage" ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Upload size={18} />
                  )}
                  <span>
                    {uploadingKey === "ogImage"
                      ? "Uploading…"
                      : "Upload OG Image"}
                  </span>
                  <span className="text-[#9E9E9E]">
                    Recommended: 1200×630px
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload("ogImage")}
                    disabled={uploadingKey === "ogImage"}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Keywords
            </label>
            <input
              value={brand.keywords}
              onChange={(e) => set("keywords", e.target.value)}
              placeholder="keyword1, keyword2, …"
              className={fieldClass("keywords")}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={14} /> Saved successfully
          </div>
        )}
        {submitted && Object.keys(errors).length > 0 && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> Please fix the errors above before saving.
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <ImagePreviewPopup
        open={!!preview}
        onClose={() => setPreview(null)}
        imageUrl={preview?.url ?? ""}
        title={preview?.title}
      />
    </div>
  );
}
