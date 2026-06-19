import { useState } from 'react';
import { Home, Info, Wrench, Image, Star, HelpCircle, Search, Save, CheckCircle, Settings } from 'lucide-react';

import BrandInfoSection from './content/BrandInfoSection';
import HomepageSection from './content/HomepageSection';
import AboutUsSection from './content/AboutUsSection';
import ServicesSection from './content/ServicesSection';
import GallerySection from './content/GallerySection';
import TestimonialsSection from './content/TestimonialsSection';
import FaqsSection from './content/FaqsSection';
import SeoSection from './content/SeoSection';

import type {
  BrandState, HomeAboutState, AboutInfoState,
  Slide, ServiceItem, FaqItem, TestimonialItem, SeoPage,
} from './content/types';

const modules = [
  { key: 'brand', label: 'Brand Info', icon: Settings },
  { key: 'homepage', label: 'Homepage', icon: Home },
  { key: 'about', label: 'About Us', icon: Info },
  { key: 'services', label: 'Services', icon: Wrench },
  { key: 'gallery', label: 'Gallery', icon: Image },
  { key: 'testimonials', label: 'Testimonials', icon: Star },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle },
  { key: 'seo', label: 'SEO Metadata', icon: Search },
];

export default function ContentManagement() {
  const [activeModule, setActiveModule] = useState('brand');
  const [saved, setSaved] = useState(false);

  const [brand, setBrand] = useState<BrandState>({
    logo: '', favicon: '', companyName: '', tagline: '',
    phone: '', email: '', address: '', gst: '',
    metaTitle: '', metaDesc: '', ogImage: '', keywords: '',
  });

  const [homeSlides, setHomeSlides] = useState<Slide[]>([]);
  const [homeAbout, setHomeAbout] = useState<HomeAboutState>({ title: '', desc: '' });

  const [aboutSlides, setAboutSlides] = useState<Slide[]>([]);
  const [aboutInfo, setAboutInfo] = useState<AboutInfoState>({ title: '', intro: '' });
  const [whyChoose, setWhyChoose] = useState('');

  const [serviceSlides, setServiceSlides] = useState<Slide[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [gallerySlides, setGallerySlides] = useState<Slide[]>([]);

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  const [seoPages, setSeoPages] = useState<SeoPage[]>([
    { page: 'Homepage', title: '', desc: '', keywords: '' },
    { page: 'About Us', title: '', desc: '', keywords: '' },
    { page: 'Services', title: '', desc: '', keywords: '' },
  ]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const mod = modules.find(m => m.key === activeModule)!;
  const Icon = mod.icon;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Content Management</h1>
          <p className="text-[#616161] text-sm">Manage website content, slides, and SEO settings</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium border border-green-200">
            <CheckCircle size={14} /> Saved successfully
          </div>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Module Sidebar */}
        <div className="w-44 flex-shrink-0 sticky top-20">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {modules.map(m => {
              const MIcon = m.icon;
              return (
                <button key={m.key} onClick={() => setActiveModule(m.key)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${activeModule === m.key ? 'bg-red-50 text-[#D32F2F] border-l-[3px] border-l-[#D32F2F]' : 'text-[#616161] hover:bg-gray-50'}`}>
                  <MIcon size={14} />{m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Icon size={17} className="text-[#D32F2F]" />
              </div>
              <h2 className="font-bold text-[#212121] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{mod.label}</h2>
            </div>
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors">
              <Save size={13} /> Save Changes
            </button>
          </div>

          {activeModule === 'brand' && (
            <BrandInfoSection brand={brand} setBrand={setBrand} />
          )}
          {activeModule === 'homepage' && (
            <HomepageSection homeSlides={homeSlides} setHomeSlides={setHomeSlides} homeAbout={homeAbout} setHomeAbout={setHomeAbout} />
          )}
          {activeModule === 'about' && (
            <AboutUsSection aboutSlides={aboutSlides} setAboutSlides={setAboutSlides} aboutInfo={aboutInfo} setAboutInfo={setAboutInfo} whyChoose={whyChoose} setWhyChoose={setWhyChoose} />
          )}
          {activeModule === 'services' && (
            <ServicesSection serviceSlides={serviceSlides} setServiceSlides={setServiceSlides} services={services} setServices={setServices} />
          )}
          {activeModule === 'gallery' && (
            <GallerySection gallerySlides={gallerySlides} setGallerySlides={setGallerySlides} />
          )}
          {activeModule === 'testimonials' && (
            <TestimonialsSection testimonials={testimonials} setTestimonials={setTestimonials} />
          )}
          {activeModule === 'faqs' && (
            <FaqsSection faqs={faqs} setFaqs={setFaqs} />
          )}
          {activeModule === 'seo' && (
            <SeoSection seoPages={seoPages} setSeoPages={setSeoPages} />
          )}
        </div>
      </div>
    </div>
  );
}
