import { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Play, ChevronLeft, ChevronRight, ChevronRight as CRight } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

type Category = 'All' | 'Events' | 'Testimonials' | 'VIP Deliveries' | 'Consultations';

const images: { src: string; category: Exclude<Category, 'All'>; alt: string }[] = [
  { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=350&fit=crop', category: 'Events', alt: 'Numerology Masterclass 2023' },
  { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&h=700&fit=crop', category: 'Events', alt: 'VIP Number Expo Mumbai' },
  { src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=400&fit=crop', category: 'Consultations', alt: 'Personal Consultation Session' },
  { src: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&h=300&fit=crop', category: 'Consultations', alt: 'Business Numerology Consultation' },
  { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=500&fit=crop', category: 'VIP Deliveries', alt: 'Premium SIM Delivery Package' },
  { src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=400&fit=crop', category: 'VIP Deliveries', alt: 'VIP 9999 Number Delivery' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop', category: 'Testimonials', alt: 'Client Rajesh Success Story' },
  { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=400&fit=crop', category: 'Testimonials', alt: 'Client Priya Testimonial' },
  { src: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=500&h=350&fit=crop', category: 'Events', alt: 'Spiritual Growth Seminar' },
  { src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=450&fit=crop', category: 'Events', alt: 'Business Workshop Hyderabad' },
  { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop', category: 'Testimonials', alt: 'Client Meena Success' },
  { src: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=500&h=350&fit=crop', category: 'Consultations', alt: 'Annual Numerology Review' },
  { src: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&h=600&fit=crop', category: 'Consultations', alt: 'Corporate Business Session' },
  { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=400&fit=crop', category: 'Testimonials', alt: 'Client Suresh Testimonial' },
  { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=350&fit=crop', category: 'VIP Deliveries', alt: 'Corporate Package Delivery' },
  { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop', category: 'Testimonials', alt: 'Client Vikram Success' },
];

const videos = [
  { thumb: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=240&fit=crop', title: 'How 8888 Changed My Business', name: 'Arjun Kapoor', duration: '4:32' },
  { thumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=240&fit=crop', title: 'Name Correction Transformation', name: 'Priya Sharma', duration: '3:15' },
  { thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=240&fit=crop', title: 'VIP Number Success Story', name: 'Rajesh Patel', duration: '5:47' },
  { thumb: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=240&fit=crop', title: 'Child\'s Academic Success', name: 'Meena Iyer', duration: '2:58' },
  { thumb: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=240&fit=crop', title: 'Business Numerology Impact', name: 'Ananya Reddy', duration: '6:12' },
  { thumb: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=240&fit=crop', title: 'Career Transformation Story', name: 'Vikram Singh', duration: '4:05' },
];

const categories: Category[] = ['All', 'Events', 'Testimonials', 'VIP Deliveries', 'Consultations'];

export default function Gallery() {
  const [tab, setTab] = useState<'Images' | 'Videos'>('Images');
  const [category, setCategory] = useState<Category>('All');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const navigate = useNavigate();

  const filtered = category === 'All' ? images : images.filter(i => i.category === category);

  const prev = () => setLightbox(l => l !== null ? (l - 1 + filtered.length) % filtered.length : null);
  const next = () => setLightbox(l => l !== null ? (l + 1) % filtered.length : null);

  return (
    <div>
      {/* Banner */}
      <section className="relative h-64 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1440&h=400&fit=crop" alt="Gallery" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#D32F2F]/90 to-black/60 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <span className="cursor-pointer hover:text-white" onClick={() => navigate('/')}>Home</span>
              <CRight size={14} />
              <span className="text-white">Gallery</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Gallery</h1>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-gray-200">
            {(['Images', 'Videos'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${tab === t ? 'border-[#D32F2F] text-[#D32F2F]' : 'border-transparent text-[#616161] hover:text-[#212121]'}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Categories (images only) */}
          {tab === 'Images' && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === c ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {tab === 'Images' ? (
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}>
              <Masonry gutter="16px">
                {filtered.map((img, i) => (
                  <div
                    key={img.src}
                    className="rounded-xl overflow-hidden cursor-pointer group relative"
                    onClick={() => setLightbox(i)}
                  >
                    <img src={img.src} alt={img.alt} className="w-full block group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                      <div className="bg-white/90 rounded-lg px-3 py-1.5">
                        <div className="text-xs font-medium text-[#212121]">{img.alt}</div>
                        <div className="text-xs text-[#D32F2F]">{img.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v, i) => (
                <div key={i} className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group cursor-pointer">
                  <div className="relative h-44">
                    <img src={v.thumb} alt={v.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-14 h-14 bg-[#D32F2F] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play size={22} className="text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">{v.duration}</div>
                  </div>
                  <div className="p-4 bg-[#FFF8E1]">
                    <h4 className="font-semibold text-[#212121] text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{v.title}</h4>
                    <div className="text-[#616161] text-xs">{v.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20" onClick={e => { e.stopPropagation(); prev(); }}>
            <ChevronLeft size={20} />
          </button>
          <div className="max-w-4xl max-h-full px-16" onClick={e => e.stopPropagation()}>
            <img src={filtered[lightbox].src} alt={filtered[lightbox].alt} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <div className="text-center mt-4">
              <div className="text-white font-medium">{filtered[lightbox].alt}</div>
              <div className="text-[#FBC02D] text-sm">{filtered[lightbox].category}</div>
            </div>
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20" onClick={e => { e.stopPropagation(); next(); }}>
            <ChevronRight size={20} />
          </button>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center" onClick={() => setLightbox(null)}>
            <X size={20} />
          </button>
          <div className="absolute bottom-6 text-white/50 text-sm">{lightbox + 1} / {filtered.length}</div>
        </div>
      )}
    </div>
  );
}
