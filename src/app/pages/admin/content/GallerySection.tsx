import SlideEditor from './SlideEditor';
import type { Slide } from './types';

interface Props { gallerySlides: Slide[]; setGallerySlides: (s: Slide[]) => void }

export default function GallerySection({ gallerySlides, setGallerySlides }: Props) {
  return (
    <div>
      <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Gallery Banner Slides</h3>
      <SlideEditor slides={gallerySlides} setSlides={setGallerySlides} label="Slide" />
    </div>
  );
}
