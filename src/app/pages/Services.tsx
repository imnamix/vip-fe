import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import {
  X, Loader2,
  TrendingUp, Users, Building2, Award, Star, Target, BarChart2, Clock, Globe,
  Shield, Zap, Heart, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench,
  DollarSign, CheckCircle,
} from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel';
import { getAllServices } from '../services/ServicesService';
import { getServicePage } from '../services/ServicePageService';

interface OutletCtx { openBooking: () => void }

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, Users, Building2, Award, Star, Target, BarChart2, Clock, Globe,
  Shield, Zap, Heart, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench,
  DollarSign, CheckCircle,
};

interface ServiceItem {
  id: number;
  title: string;
  image: string;
  description: string;
  icon: string;
}

const FALLBACK_SLIDES = [
  { img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1440&h=400&fit=crop', title: 'Our Services', subtitle: 'Premium services for every aspect of life.' },
];

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').trim();
}

function renderDescription(html: string) {
  const parts = html.split(/(<ul[\s\S]*?<\/ul>)/gi);
  return parts.map((part, i) => {
    if (/<ul/i.test(part)) {
      const liMatches = part.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [];
      const items = liMatches.map(li => li.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '').trim());
      return (
        <ul key={i} className="space-y-3 my-3">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2">
              <CheckCircle size={18} className="text-[#D32F2F] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <span className="text-[#616161] text-[15px]" dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      );
    }
    if (part.trim()) {
      return <div key={i} className="text-[#616161] leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: part }} />;
    }
    return null;
  });
}

export default function Services() {
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bannerSlides, setBannerSlides] = useState(FALLBACK_SLIDES);
  const [loading, setLoading] = useState(true);
  const { openBooking } = useOutletContext<OutletCtx>();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [svcRes, pageRes] = await Promise.all([
          getAllServices(0, 1000),
          getServicePage(),
        ]);

        const svcs: any[] = svcRes?.data ?? [];
        setServices(
          svcs.map(s => ({
            id: s.id,
            title: s.title ?? '',
            image: s.image ?? '',
            description: s.description ?? '',
            icon: s.icon ?? '',
          })),
        );

        const rawSlides: any[] = pageRes?.data?.slides ?? [];
        if (rawSlides.length) {
          setBannerSlides(
            rawSlides.map(s => ({
              img: s.image ?? '',
              title: s.title ?? '',
              subtitle: s.description ?? '',
            })),
          );
        }
      } catch {
        // keep fallback banner and empty services
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <BannerCarousel slides={bannerSlides} pageName="Services" breadcrumb="Services" />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">What We Offer</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {loading ? 'Our Services' : `${services.length} Premium Service${services.length !== 1 ? 's' : ''}`}
            </h2>
            <p className="text-[#616161] mt-3 max-w-lg mx-auto">Comprehensive numerology solutions for every aspect of life.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-[#616161] text-sm">
              <Loader2 size={20} className="animate-spin" /> Loading services…
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 text-[#616161]">No services available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map(s => {
                const Icon = s.icon ? ICON_MAP[s.icon] : null;
                return (
                  <div
                    key={s.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                    onClick={() => setSelected(s)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {Icon && (
                        <div className="absolute bottom-3 left-3 w-8 h-8 bg-[#FBC02D] rounded-lg flex items-center justify-center">
                          <Icon size={15} className="text-black" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-[#212121] mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.title}</h3>
                      <p className="text-[#616161] text-xs leading-relaxed mb-3 line-clamp-3">{stripHtml(s.description)}</p>
                      <span className="text-[#D32F2F] text-xs font-semibold hover:underline">View Details →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Service Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-72">
              <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/40"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                {selected.icon && ICON_MAP[selected.icon] && (() => {
                  const Icon = ICON_MAP[selected.icon];
                  return (
                    <div className="w-9 h-9 bg-[#FBC02D] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-black" />
                    </div>
                  );
                })()}
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{selected.title}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                {renderDescription(selected.description)}
              </div>
              <button
                onClick={() => { setSelected(null); openBooking(); }}
                className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Book This Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Consultation CTA */}
      <section className="py-20 bg-gradient-to-r from-[#212121] to-[#B71C1C]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to Transform Your Life?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Book a personalised numerology consultation and unlock the power of your numbers today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={openBooking}
              className="px-8 py-4 bg-[#FBC02D] text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Book Consultation
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
