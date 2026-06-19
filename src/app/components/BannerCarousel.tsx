import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface BannerSlide {
  img: string;
  title?: string;
  subtitle?: string;
}

interface BannerCarouselProps {
  slides: BannerSlide[];
  pageName: string;
  breadcrumb?: string;
  height?: string;
}

export default function BannerCarousel({ slides, pageName, breadcrumb, height = 'h-72' }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className={`relative ${height} overflow-hidden`}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={slide.img} alt={slide.title || pageName} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#D32F2F]/85 via-[#D32F2F]/50 to-black/40" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Breadcrumb */}
          {breadcrumb && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/70 text-sm mb-3">
              <button className="hover:text-white transition-colors" onClick={() => navigate('/')}>Home</button>
              <ChevronRight size={14} />
              <span className="text-white font-medium">{breadcrumb}</span>
            </nav>
          )}
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {slides[current].title || pageName}
          </h1>
          {slides[current].subtitle && (
            <p className="text-white/85 text-lg max-w-lg">{slides[current].subtitle}</p>
          )}
        </div>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-[#FBC02D] w-6' : 'bg-white/50 w-2'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
