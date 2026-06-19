import { Upload, Trash2 } from "lucide-react";
import type { BrandState } from './types';

interface Props { brand: BrandState; setBrand: React.Dispatch<React.SetStateAction<BrandState>> }

const companyFields: [string, keyof BrandState][] = [
  ['Company Name', 'companyName'],
  ['Phone', 'phone'],
  ['Email', 'email'],
  ['Address', 'address'],
];

export default function BrandInfoSection({ brand, setBrand }: Props) {
  const set = (key: keyof BrandState, value: string) => setBrand(b => ({ ...b, [key]: value }));

  return (
    <div className="space-y-6">
      {/* Logo & Favicon */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Logo */}
        <div className="border border-gray-200 rounded-xl p-4">
          <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-3">
            Brand Logo
          </label>

          <div className="flex items-center gap-3">
            {brand.logo ? (
              <>
                <img
                  src={brand.logo}
                  alt="Logo"
                  className="w-16 h-16 object-contain border rounded-lg"
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
              <label className="flex items-center gap-2 px-3 py-2 text-xs text-[#D32F2F] border border-dashed border-[#D32F2F] rounded-lg cursor-pointer hover:bg-red-50">
                <Upload size={12} />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      set("logo", reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
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
                  className="w-10 h-10 object-contain border rounded"
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
              <label className="flex items-center gap-2 px-3 py-2 text-xs text-[#D32F2F] border border-dashed border-[#D32F2F] rounded-lg cursor-pointer hover:bg-red-50">
                <Upload size={12} />
                Upload Favicon
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      set("favicon", reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
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
          {companyFields.map(([label, key]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-[#616161] mb-1">
                {label}
              </label>
              <input
                value={brand[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={label}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>
          ))}
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
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Default Meta Title
            </label>
            <input
              value={brand.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder="Meta title (max 60 chars)"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
            />
            <div
              className={`text-xs mt-1 ${brand.metaTitle.length > 60 ? "text-red-500" : "text-green-500"}`}
            >
              {brand.metaTitle.length}/60 chars{" "}
              {brand.metaTitle.length > 60
                ? "— Too long"
                : brand.metaTitle.length > 0
                  ? "— Good"
                  : ""}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Default Meta Description
            </label>
            <textarea
              value={brand.metaDesc}
              onChange={(e) => set("metaDesc", e.target.value)}
              rows={2}
              placeholder="Meta description (max 160 chars)"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none"
            />
            <div
              className={`text-xs mt-1 ${brand.metaDesc.length > 160 ? "text-red-500" : "text-green-500"}`}
            >
              {brand.metaDesc.length}/160 chars
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              OG Image URL
            </label>
            <div className="flex gap-2">
              {brand.ogImage && (
                <img
                  src={brand.ogImage}
                  alt="OG"
                  className="w-20 h-12 object-cover rounded-lg border flex-shrink-0"
                />
              )}
              <input
                value={brand.ogImage}
                onChange={(e) => set("ogImage", e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">
              Keywords
            </label>
            <input
              value={brand.keywords}
              onChange={(e) => set("keywords", e.target.value)}
              placeholder="keyword1, keyword2, ..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
