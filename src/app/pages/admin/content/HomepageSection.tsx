import SlideEditor from './SlideEditor';
import type { Slide, HomeAboutState } from './types';

interface Props {
  homeSlides: Slide[];
  setHomeSlides: (s: Slide[]) => void;
  homeAbout: HomeAboutState;
  setHomeAbout: React.Dispatch<React.SetStateAction<HomeAboutState>>;
}

export default function HomepageSection({ homeSlides, setHomeSlides, homeAbout, setHomeAbout }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Hero Banner Slides</h3>
        <SlideEditor slides={homeSlides} setSlides={setHomeSlides} label="Slide" />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>About Section</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Section Title</label>
            <input value={homeAbout.title} onChange={e => setHomeAbout(a => ({ ...a, title: e.target.value }))} placeholder="About section title"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#616161] mb-1">Description</label>
            <textarea value={homeAbout.desc} onChange={e => setHomeAbout(a => ({ ...a, desc: e.target.value }))} rows={3} placeholder="About section description"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] resize-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
