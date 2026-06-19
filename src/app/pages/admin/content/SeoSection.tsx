import type { SeoPage } from './types';

interface Props { seoPages: SeoPage[]; setSeoPages: React.Dispatch<React.SetStateAction<SeoPage[]>> }

const seoFields: [string, keyof SeoPage][] = [
  ['Page Title (max 60 chars)', 'title'],
  ['Meta Description (max 160 chars)', 'desc'],
  ['Keywords (comma-separated)', 'keywords'],
];

export default function SeoSection({ seoPages, setSeoPages }: Props) {
  const update = (i: number, field: keyof SeoPage, value: string) =>
    setSeoPages(ps => ps.map((p, j) => j === i ? { ...p, [field]: value } : p));

  return (
    <div className="space-y-5">
      {seoPages.map((s, i) => (
        <div key={s.page} className="border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.page}</h3>
          <div className="space-y-3">
            {seoFields.map(([label, field]) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-[#616161] mb-1">{label}</label>
                {field === 'desc'
                  ? <textarea value={s[field]} onChange={e => update(i, field, e.target.value)} rows={2} placeholder={label}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
                  : <input value={s[field]} onChange={e => update(i, field, e.target.value)} placeholder={label}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
