import SlideEditor from './SlideEditor';
import type { Slide, AboutInfoState } from './types';

interface Props {
  aboutSlides: Slide[];
  setAboutSlides: (s: Slide[]) => void;
  aboutInfo: AboutInfoState;
  setAboutInfo: React.Dispatch<React.SetStateAction<AboutInfoState>>;
  whyChoose: string;
  setWhyChoose: (v: string) => void;
}

export default function AboutUsSection({ aboutSlides, setAboutSlides, aboutInfo, setAboutInfo, whyChoose, setWhyChoose }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Page Banner Slides</h3>
        <SlideEditor slides={aboutSlides} setSlides={setAboutSlides} label="Slide" />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>About Info</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Main Title</label>
            <input value={aboutInfo.title} onChange={e => setAboutInfo(a => ({ ...a, title: e.target.value }))} placeholder="About page main title"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Introduction Text</label>
            <textarea value={aboutInfo.intro} onChange={e => setAboutInfo(a => ({ ...a, intro: e.target.value }))} rows={4} placeholder="Introduction paragraph"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Why Choose Us Points</h3>
        <textarea value={whyChoose} onChange={e => setWhyChoose(e.target.value)} rows={6} placeholder="One reason per line..."
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
        <p className="text-xs text-[#616161] mt-1">One reason per line</p>
      </div>
    </div>
  );
}
