import { useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Home, Info, Wrench, Image, Star, HelpCircle, Video,
  Save, CheckCircle, Settings, Menu, X,
} from 'lucide-react';

import BrandInfoSection from './content/BrandInfoSection';
import HomepageSection from './content/HomepageSection';
import AboutUsSection from './content/AboutUsSection';
import ServicesSection from './content/ServicesSection';
import GallerySection from './content/GallerySection';
import TestimonialsSection from './content/TestimonialsSection';
import VideoTestimonialsSection from './content/VideoTestimonialsSection';
import FaqsSection from './content/FaqsSection';

import type { FaqItem, TestimonialItem } from './content/types';

const modules = [
  { key: "brand", label: "Brand Info", icon: Settings },
  { key: "homepage", label: "Homepage", icon: Home },
  { key: "about", label: "About Us", icon: Info },
  { key: "services", label: "Services", icon: Wrench },
  { key: "gallery", label: "Gallery", icon: Image },
  { key: "testimonials", label: "Reviews", icon: Star },
  { key: "video-testimonials", label: "Video Reviews", icon: Video },
  { key: "faqs", label: "FAQs", icon: HelpCircle },
];

const SELF_SAVING = new Set(['brand', 'homepage', 'about', 'services', 'gallery', 'video-testimonials']);

export default function ContentManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeModule = searchParams.get('tab') || 'brand';
  const setActiveModule = (key: string) => {
    setSearchParams({ tab: key }, { replace: true });
    setSidebarOpen(false);
  };

  const [saved, setSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const mod = modules.find(m => m.key === activeModule) ?? modules[0];
  const Icon = mod.icon;

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Content Management
          </h1>
          <p className="text-[#616161] text-sm">Manage website content, slides, and SEO settings</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-medium border border-green-200">
            <CheckCircle size={14} /> Saved successfully
          </div>
        )}
      </div>

      <div className="flex gap-3 md:gap-6 items-start relative">

        {/* ── DESKTOP sidebar (md+): always visible ── */}
        <div className="hidden md:block w-44 flex-shrink-0 sticky top-20">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {modules.map(m => {
              const MIcon = m.icon;
              return (
                <button key={m.key} onClick={() => setActiveModule(m.key)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                    activeModule === m.key
                      ? 'bg-red-50 text-[#D32F2F] border-l-[3px] border-l-[#D32F2F]'
                      : 'text-[#616161] hover:bg-gray-50'
                  }`}>
                  <MIcon size={14} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE icon strip (< md): icons only ── */}
        <div className="md:hidden flex-shrink-0 sticky top-20 z-10">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
            {/* hamburger to open full sidebar */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-12 h-11 text-[#616161] hover:bg-gray-50 border-b border-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            {/* icon-only module buttons */}
            {modules.map(m => {
              const MIcon = m.icon;
              return (
                <button key={m.key} onClick={() => setActiveModule(m.key)}
                  title={m.label}
                  className={`flex items-center justify-center w-12 h-11 border-b border-gray-50 last:border-0 transition-colors ${
                    activeModule === m.key
                      ? 'bg-red-50 text-[#D32F2F] border-l-[3px] border-l-[#D32F2F]'
                      : 'text-[#9E9E9E] hover:bg-gray-50 hover:text-[#616161]'
                  }`}>
                  <MIcon size={16} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE full sidebar overlay ── */}
        {sidebarOpen && (
          <>
            {/* backdrop */}
            <div
              className="md:hidden fixed inset-0 z-40 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            {/* drawer */}
            <div className="md:hidden fixed left-0 top-0 h-full w-56 z-50 bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <span className="text-sm font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Sections
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#616161] hover:bg-gray-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {modules.map(m => {
                  const MIcon = m.icon;
                  return (
                    <button key={m.key} onClick={() => setActiveModule(m.key)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                        activeModule === m.key
                          ? 'bg-red-50 text-[#D32F2F] border-l-[3px] border-l-[#D32F2F]'
                          : 'text-[#616161] hover:bg-gray-50'
                      }`}>
                      <MIcon size={15} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Content area ── */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={17} className="text-[#D32F2F]" />
              </div>
              <h2 className="font-bold text-[#212121] text-base md:text-lg truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {mod.label}
              </h2>
            </div>
            {!SELF_SAVING.has(activeModule) && (
              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors flex-shrink-0">
                <Save size={13} /> Save Changes
              </button>
            )}
          </div>

          {activeModule === 'brand' && <BrandInfoSection />}
          {activeModule === 'homepage' && <HomepageSection />}
          {activeModule === 'about' && <AboutUsSection />}
          {activeModule === 'services' && <ServicesSection />}
          {activeModule === 'gallery' && <GallerySection />}
          {activeModule === 'testimonials' && (
            <TestimonialsSection testimonials={testimonials} setTestimonials={setTestimonials} />
          )}
          {activeModule === 'video-testimonials' && <VideoTestimonialsSection />}
          {activeModule === 'faqs' && (
            <FaqsSection faqs={faqs} setFaqs={setFaqs} />
          )}
        </div>
      </div>
    </div>
  );
}
