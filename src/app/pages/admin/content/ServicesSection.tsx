import SlideEditor from './SlideEditor';
import ServiceEditor from './ServiceEditor';
import type { Slide, ServiceItem } from './types';

interface Props {
  serviceSlides: Slide[];
  setServiceSlides: (s: Slide[]) => void;
  services: ServiceItem[];
  setServices: (s: ServiceItem[]) => void;
}

export default function ServicesSection({ serviceSlides, setServiceSlides, services, setServices }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Page Banner Slides</h3>
        <SlideEditor slides={serviceSlides} setSlides={setServiceSlides} label="Slide" />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Services</h3>
        <ServiceEditor items={services} setItems={setServices} />
      </div>
    </div>
  );
}
