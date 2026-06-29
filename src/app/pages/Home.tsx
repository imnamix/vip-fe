import { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { ChevronLeft, ChevronRight, ChevronDown, Star, TrendingUp, Briefcase, Heart, Award, Zap, Users, CheckCircle, Hash, Sparkles, Quote, TrendingUp as TrendingUpIcon, Building2, BarChart2, Clock, Globe, Shield, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench, DollarSign, Target, Crown, Phone, X } from 'lucide-react';

const VIP_ICON_MAP: Record<string, React.ElementType> = {
  Star, Crown, Gem, Trophy, Phone, Hash, DollarSign, Zap, Heart, Shield,
  Award, Rocket, Target, TrendingUp: TrendingUpIcon, Globe, Users, Building2,
  BarChart2, Clock, ThumbsUp, Lightbulb, Wrench,
};
function VipIcon({ name, size = 22 }: { name: string | null; size?: number }) {
  const Comp = name ? VIP_ICON_MAP[name] : null;
  return Comp ? <Comp size={size} className="text-white" /> : <Hash size={size} className="text-white" />;
}

function VipDescTooltip({ text }: { text: string }) {
  const pRef = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);
  useEffect(() => {
    const el = pRef.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight);
  }, [text]);
  return (
    <div className={`relative flex-1 mb-4 ${clamped ? 'group/desc' : ''}`}>
      <p ref={pRef} className="text-[#616161] text-sm leading-relaxed line-clamp-3">{text}</p>
      {clamped && (
        <div className="pointer-events-none absolute bottom-full left-0 right-0 z-20 mb-2 hidden group-hover/desc:block">
          <div className="bg-gray-900 text-white text-xs rounded-xl p-3 leading-relaxed shadow-xl">{text}</div>
        </div>
      )}
    </div>
  );
}

import { getAllHomepage } from '../services/HomepageService';
import { getAllAboutUs } from '../services/AboutusService';
import { getAllVipNumbers } from '../services/VipNumbersService';
import { getAllServices } from '../services/ServicesService';
import { getAllTestimonials } from '../services/TestimonialService';
import { getAllFaqs } from '../services/FaqService';
import GeneralInquiryPopup from '../components/GeneralInquiryPopup';

interface VipNumber {
  id: number;
  vipNumber: string;
  category: string;
  description: string;
  price: number | null;
  tag: string | null;
  icon: string | null;
  rating: number | null;
  status: number;
}

interface FetchedService {
  id: number;
  title: string;
  image: string;
  description: string;
  icon: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  review: string;
  rating: number;
  image: string | null;
}

interface Faq {
  id: number;
  question: string;
  answer: string;
}

interface AboutStatItem { key: string; value: string; icon: string }
interface AboutUsData {
  homepageAboutUsTitle?: string;
  homepageAboutUsDescription?: string;
  homepageAboutUsImage?: string;
  yearsOfExperience?: number | null;
  statistics?: AboutStatItem[];
}

const STAT_ICONS: Record<string, React.ElementType> = {
  TrendingUp: TrendingUpIcon, Users, Building2, Award, Star, Target, BarChart2, Clock, Globe,
  Shield, Zap, Heart, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench, DollarSign, CheckCircle,
};

function StatIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Comp = STAT_ICONS[name];
  return Comp ? <Comp size={size} /> : null;
}

function renderServiceDescription(html: string) {
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

function renderAboutDescription(html: string) {
  const parts = html.split(/(<ul[\s\S]*?<\/ul>)/gi);
  return parts.map((part, i) => {
    if (/<ul/i.test(part)) {
      const liMatches = part.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [];
      const items = liMatches.map(li => li.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '').trim());
      return (
        <ul key={i} className="space-y-3 my-3">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2">
              <CheckCircle size={18} className="text-[#FBC02D] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
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

interface OutletCtx { openBooking: () => void }

interface ApiSlide { title: string; description: string; image?: string }

const OVERLAYS = [
  "from-black/75 via-black/40 to-transparent",
  "from-black/75 via-black/40 to-transparent",
  "from-black/75 via-black/35 to-transparent",
];


const benefits = [
  { icon: TrendingUp, title: 'Wealth Attraction', desc: 'Harness number vibrations that magnetically draw financial abundance.' },
  { icon: Briefcase, title: 'Career Growth', desc: 'Align your numbers with your professional path for rapid advancement.' },
  { icon: Zap, title: 'Positive Energy', desc: 'Surround yourself with frequencies that boost vitality and enthusiasm.' },
  { icon: Award, title: 'Business Success', desc: 'Numerologically optimised decisions for sustainable business growth.' },
  { icon: Heart, title: 'Better Relationships', desc: 'Improve harmony in personal and professional relationships.' },
  { icon: Sparkles, title: 'Improved Confidence', desc: 'Numbers that resonate with your core identity build lasting confidence.' },
];

const CAROUSEL_GAP = 20;

function ReviewsCarousel({ reviews }: { reviews: Testimonial[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(true);
  const [cardW, setCardW] = useState(0);
  const pausedRef = useRef(false);
  const dragStartX = useRef<number | null>(null);

  const extended = reviews.length > 0 ? [...reviews, ...reviews.slice(0, Math.min(3, reviews.length))] : [];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.clientWidth;
      const v = w >= 768 ? 3 : w >= 480 ? 2 : 1;
      setCardW((w - CAROUSEL_GAP * (v - 1)) / v);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  // re-run when reviews load so cardW is set after the async fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length === 0 || idx < reviews.length) return;
    const t = setTimeout(() => {
      setAnim(false);
      setIdx(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
    }, 680);
    return () => clearTimeout(t);
  }, [idx, reviews.length]);

  useEffect(() => {
    if (reviews.length === 0) return;
    const t = setInterval(() => {
      if (!pausedRef.current) { setAnim(true); setIdx(i => i + 1); }
    }, 3500);
    return () => clearInterval(t);
  }, [reviews.length]);

  const goNext = () => { setAnim(true); setIdx(i => (i + 1) % reviews.length); };
  const goPrev = () => { setAnim(true); setIdx(i => (i - 1 + reviews.length) % reviews.length); };
  const dotIdx = idx >= reviews.length ? 0 : idx;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(diff) > 40) { diff < 0 ? goNext() : goPrev(); }
    setTimeout(() => { pausedRef.current = false; }, 800);
  };

  return (
    <div
      className="relative group/carousel select-none"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
        dragStartX.current = null;
      }}
    >
      {/* Cards row — containerRef is always mounted so ResizeObserver measures on first render */}
      <div className="relative overflow-visible">
        {" "}
        {reviews.length > 0 && (
          <button
            onClick={goPrev}
            className="absolute -left-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-all opacity-0 group-hover/carousel:opacity-100 duration-300"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div
          ref={containerRef}
          className="overflow-hidden cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {reviews.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-[#9E9E9E] text-sm">
              No reviews yet.
            </div>
          ) : (
            cardW > 0 && (
              <div
                className="flex"
                style={{
                  gap: CAROUSEL_GAP,
                  transform: `translateX(-${idx * (cardW + CAROUSEL_GAP)}px)`,
                  transition: anim
                    ? "transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    : "none",
                  userSelect: "none",
                }}
              >
                {extended.map((r, i) => (
                  <article
                    key={i}
                    style={{ minWidth: cardW, maxWidth: cardW }}
                    className="flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D32F2F] to-[#FBC02D] rounded-l-2xl" />
                    <Quote
                      size={40}
                      className="text-[#D32F2F]/8 absolute top-4 right-4"
                    />
                    <div className="flex items-center gap-0.5 mb-4">
                      {[...Array(r.rating)].map((_, j) => (
                        <Star
                          key={j}
                          size={14}
                          className="text-[#FBC02D] fill-current"
                        />
                      ))}
                      {[...Array(Math.max(0, 5 - r.rating))].map((_, j) => (
                        <Star
                          key={j}
                          size={14}
                          className="text-gray-200 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-[#424242] text-sm leading-relaxed mb-5 italic line-clamp-4">
                      "{r.review}"
                    </p>
                    <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#D32F2F]/20 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#D32F2F]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#D32F2F] font-bold text-lg">
                            {r.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-[#212121] text-sm truncate">
                          {r.name}
                        </div>
                        {r.role && (
                          <div className="text-[#9E9E9E] text-xs mt-0.5 truncate">
                            {r.role}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
        </div>
        {reviews.length > 0 && (
          <button
            onClick={goNext}
            className="absolute -right-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-all opacity-0 group-hover/carousel:opacity-100 duration-300"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setAnim(true);
                setIdx(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${dotIdx === i ? "w-6 bg-[#D32F2F]" : "w-1.5 bg-gray-300 hover:bg-gray-400"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [slides, setSlides] = useState<ApiSlide[]>([]);
  const [slidesLoaded, setSlidesLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [aboutUs, setAboutUs] = useState<AboutUsData | null>(null);
  const [vipNumbers, setVipNumbers] = useState<VipNumber[]>([]);
  const [fetchedServices, setFetchedServices] = useState<FetchedService[]>([]);
  const [selectedService, setSelectedService] = useState<FetchedService | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqPage, setFaqPage] = useState(1);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const FAQ_PER_PAGE = 5;
  const [aboutVisible, setAboutVisible] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const { openBooking } = useOutletContext<OutletCtx>();
  const navigate = useNavigate();

  const [inquiryContext, setInquiryContext] = useState<{ lookingFor: string; title: string } | null>(null);

  useEffect(() => {
    getAllHomepage(1, 1).then(res => {
      const record = res?.data?.[0];
      if (record?.slides?.length) setSlides(record.slides);
      setSlidesLoaded(true);
    }).catch(() => { setSlidesLoaded(true); });

    getAllAboutUs(1, 1).then(res => {
      const record = res?.data?.[0];
      if (record) setAboutUs(record as AboutUsData);
    }).catch(() => {});

    getAllVipNumbers(1, 8).then(res => {
      if (res?.data?.length) setVipNumbers(res.data);
    }).catch(() => {});

    getAllServices(0, 6).then(res => {
      if (res?.data?.length) setFetchedServices(res.data);
    }).catch(() => {});

    getAllTestimonials(0, 100).then(res => {
      if (res?.data?.length) setTestimonials(res.data);
      if (res?.averageRating != null) setAvgRating(res.averageRating);
    }).catch(() => {});

    getAllFaqs(0, 1000).then(res => {
      if (res?.data?.length) setFaqs(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = aboutRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAboutVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [aboutUs]);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const prevSlide = () => setCurrentSlide(s => (s - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide(s => (s + 1) % slides.length);

  const openVipInquiry = (vip: VipNumber) =>
    setInquiryContext({ lookingFor: `Enquiry for ${vip.vipNumber}`, title: vip.vipNumber });

  const openServiceInquiry = (service: FetchedService) =>
    setInquiryContext({ lookingFor: `Enquiry for ${service.title}`, title: service.title });

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Slider ─────────────────────── */}
      {(!slidesLoaded || slides.length > 0) && (
      <section className="group relative h-[85vh] min-h-[520px] overflow-hidden bg-[#1a1a1a]">
        {slides.length === 0 ? (
          /* Loading skeleton */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl animate-pulse space-y-4">
                <div className="h-6 w-48 bg-white/10 rounded-full" />
                <div className="h-14 w-3/4 bg-white/10 rounded-xl" />
                <div className="h-5 w-2/3 bg-white/10 rounded-lg" />
              </div>
            </div>
          </div>
        ) : (
          slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              {slide.image ? (
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#212121] to-[#B71C1C]" />
              )}
              <div className={`absolute inset-0 bg-gradient-to-r ${OVERLAYS[i % OVERLAYS.length]}`} />
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-[#FBC02D]/20 border border-[#FBC02D]/40 text-[#FBC02D] px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                      <Sparkles size={13} /> India's #1 Numerology Platform
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {slide.title}
                    </h1>
                    <p className="text-lg text-white/85 mb-8 leading-relaxed">{slide.description}</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={openBooking}
                        className="px-8 py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors shadow-lg"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Book Your Number
                      </button>
                      <button
                        onClick={() => navigate('/about')}
                        className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Arrows — hidden by default, visible on section hover */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 duration-300"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-[#FBC02D] w-8' : 'bg-white/50 w-3'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>
      )}

      {/* ─── About Preview ───────────────────── */}
      {aboutUs && (aboutUs.homepageAboutUsTitle || aboutUs.homepageAboutUsDescription || aboutUs.homepageAboutUsImage) && (
      <section ref={aboutRef} className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — image, slides in from left */}
            <div className={`relative transition-all duration-700 ease-out ${aboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              {aboutUs?.homepageAboutUsImage && (
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={aboutUs.homepageAboutUsImage}
                    alt="Numerology Consultation"
                    className="w-full object-cover object-top"
                  />
                  {aboutUs.yearsOfExperience != null && (
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                      <div className="w-10 h-10 bg-[#D32F2F]/80 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-xl leading-none" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {aboutUs.yearsOfExperience}+
                        </div>
                        <div className="text-white/75 text-xs mt-0.5">Years of Excellence</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            
            </div>

            {/* Right — text, slides in from right */}
            <div className={`transition-all duration-700 ease-out delay-150 ${aboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">About VIP Numerology</div>
              {aboutUs?.homepageAboutUsTitle && (
                <h2 className="text-4xl font-bold text-[#212121] leading-tight mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {aboutUs.homepageAboutUsTitle}
                </h2>
              )}

              {/* Full description — paragraphs + bullet lists with yellow icons */}
              {aboutUs?.homepageAboutUsDescription && (
                <div className="mb-6">
                  {renderAboutDescription(aboutUs.homepageAboutUsDescription)}
                </div>
              )}

              {/* Statistics from API only */}
              {!!aboutUs?.statistics?.length && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {aboutUs.statistics.map(s => (
                    <div key={s.key} className="bg-[#FFF8E1] rounded-xl p-4 flex items-start gap-3">
                      {s.icon && (
                        <div className="w-8 h-8 bg-[#D32F2F]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <StatIcon name={s.icon} size={16} />
                        </div>
                      )}
                      <div>
                        <div className="text-[#D32F2F] text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</div>
                        <div className="text-[#616161] text-sm">{s.key}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => navigate('/about')} className="px-6 py-3 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Read More About Us
              </button>
            </div>

          </div>
        </div>
      </section>
      )}

      {/* ─── VIP Numbers ─────────────────────── */}
      {vipNumbers.length > 0 && (
      <section className="py-20 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Premium Collection</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Top VIP Numbers</h2>
            <p className="text-[#616161] mt-3 max-w-lg mx-auto">Exclusive premium numbers curated for maximum positive vibrations and life-changing energy.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vipNumbers.map(n => (
              <div key={n.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#D32F2F]/30 hover:shadow-lg transition-all group relative flex flex-col overflow-hidden">
                {/* Tag badge */}
                {n.tag && (
                  <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-bold ${n.tag === 'SOLD OUT' ? 'bg-gray-200 text-gray-500' : n.tag === 'HOT' ? 'bg-[#D32F2F] text-white' : 'bg-[#FBC02D] text-black'}`}>
                    {n.tag}
                  </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform flex-shrink-0">
                  <VipIcon name={n.icon} size={22} />
                </div>

                {/* Number + Rating */}
              <div className="flex items-center justify-between mb-1">
  <div
    className="flex-1 font-bold text-lg text-[#212121] tracking-wider truncate"
    style={{ fontFamily: "Poppins, sans-serif" }}
  >
    {n.vipNumber?.replace(/(\d{5})(\d{5})/, "$1 $2")}
  </div>

  {n.rating != null && (
    <div className="ml-3 flex items-center gap-1 text-xs font-semibold text-[#D32F2F] flex-shrink-0">
      <span>{parseFloat(Number(n.rating).toFixed(1))}/10</span>
      <Star size={11} className="fill-[#D32F2F] text-[#D32F2F]" />
    </div>
  )}
</div>

                {/* Category */}
                <div className="inline-block bg-[#FFF8E1] text-[#D32F2F] text-xs font-semibold px-2 py-0.5 rounded-full mb-3 self-start">{n.category}</div>

                {/* Description — tooltip only when text exceeds 3 lines */}
                <VipDescTooltip text={n.description ?? ''} />

                {/* Price + Button — always at bottom */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[#D32F2F] font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {n.price != null ? `₹${Number(n.price).toLocaleString('en-IN')}` : '—'}
                  </span>
                  <button
                    onClick={() => n.tag !== 'SOLD OUT' && openVipInquiry(n)}
                    disabled={n.tag === 'SOLD OUT'}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${n.tag === 'SOLD OUT' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]'}`}
                  >
                    {n.tag === 'SOLD OUT' ? 'Sold Out' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* <div className="text-center mt-10">
            <button onClick={() => navigate('/services')} className="px-8 py-3 border-2 border-[#D32F2F] text-[#D32F2F] rounded-xl font-semibold hover:bg-[#D32F2F] hover:text-white transition-colors">
              View All Numbers
            </button>
          </div> */}
        </div>
      </section>
      )}

      {/* ─── Services ────────────────────────── */}
      {fetchedServices.length > 0 && (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">What We Offer</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Services</h2>
            <p className="text-[#616161] mt-3 max-w-lg mx-auto">Comprehensive numerology solutions designed to transform every dimension of your life.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {fetchedServices.slice(0, 6).map(s => (
              <div key={s.id} className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                <div className="relative h-44 overflow-hidden">
                  {s.image ? (
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#D32F2F]/20 to-[#FBC02D]/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 bg-[#FBC02D] rounded-lg flex items-center justify-center">
                    <StatIcon name={s.icon} size={15} />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-[#212121] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.title}</h3>
                  <div className="text-[#616161] text-sm leading-relaxed mb-4 line-clamp-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: s.description }} />
                  <button onClick={() => setSelectedService(s)} className="text-[#D32F2F] text-sm font-semibold hover:underline flex items-center gap-1">
                    View Details <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ─── Service Detail Popup ─────────────── */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-72 flex-shrink-0">
              {selectedService.image ? (
                <img src={selectedService.image} alt={selectedService.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#D32F2F] to-[#B71C1C]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelectedService(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                {selectedService.icon && (
                  <div className="w-9 h-9 bg-[#FBC02D] rounded-xl flex items-center justify-center flex-shrink-0">
                    <StatIcon name={selectedService.icon} size={18} />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{selectedService.title}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                {renderServiceDescription(selectedService.description)}
              </div>
              <button
                onClick={() => { openServiceInquiry(selectedService); setSelectedService(null); }}
                className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Book This Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── General Inquiry Popup ───────────── */}
      {inquiryContext && (
        <GeneralInquiryPopup
          lookingFor={inquiryContext.lookingFor}
          title={inquiryContext.title}
          onClose={() => setInquiryContext(null)}
        />
      )}

      {/* ─── Benefits ────────────────────────── */}
      <section className="py-20 bg-[#D32F2F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#FBC02D] font-semibold text-xs uppercase tracking-widest mb-3">Why Choose Us</div>
            <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Premium Benefits</h2>
            <p className="text-red-100 mt-3 max-w-lg mx-auto">Experience the transformative power of numerology across every aspect of your life.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-colors">
                  <div className="w-12 h-12 bg-[#FBC02D] rounded-xl flex items-center justify-center mb-4">
                    <Icon size={22} className="text-[#212121]" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{b.title}</h3>
                  <p className="text-red-100 text-sm leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Social Proof / Testimonials ─────── */}
      {testimonials.length > 0 && (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Social Proof</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>What Our Clients Say</h2>
            <p className="text-[#616161] mt-3">Trusted by clients across Pan India.</p>
            {avgRating > 0 && (
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#D32F2F]" style={{ fontFamily: 'Poppins, sans-serif' }}>{avgRating.toFixed(1)}</div>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} className={s <= Math.round(avgRating) ? 'text-[#FBC02D] fill-current' : 'text-gray-300'} />
                    ))}
                  </div>
                  <div className="text-[#616161] text-sm">Average Rating</div>
                </div>
                <div className="h-14 w-px bg-gray-200" />
                <div className="text-center hidden sm:block">
                  <div className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>97%</div>
                  <div className="text-[#616161] text-xs mt-1">Client Satisfaction</div>
                </div>
                <div className="h-14 w-px bg-gray-200 hidden sm:block" />
                <div className="text-center hidden sm:block">
                  <div className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>10K+</div>
                  <div className="text-[#616161] text-xs mt-1">Numbers Delivered</div>
                </div>
              </div>
            )}
          </div>

          <ReviewsCarousel reviews={testimonials} />
        </div>
      </section>
      )}

      {/* ─── FAQ ─────────────────────────────── */}
      {faqs.length > 0 && (() => {
        const totalPages = Math.ceil(faqs.length / FAQ_PER_PAGE);
        const pageFaqs = faqs.slice((faqPage - 1) * FAQ_PER_PAGE, faqPage * FAQ_PER_PAGE);
        const goPage = (p: number) => { setFaqPage(p); setOpenFaqId(null); };
        return (
          <section className="py-20 bg-[#F5F5F5]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Got Questions?</div>
                <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Frequently Asked Questions</h2>
                <p className="text-[#616161] mt-3">Everything you need to know about VIP numerology and our services.</p>
              </div>

              {/* Accordion */}
              <div className="space-y-3">
                {pageFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      >
                        <span className="font-semibold text-[#212121] text-sm sm:text-base leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {faq.question}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`flex-shrink-0 text-[#D32F2F] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <div
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{ maxHeight: isOpen ? '600px' : '0px' }}
                      >
                        <div className="px-6 pb-5 text-[#616161] text-sm leading-relaxed border-t border-gray-100 pt-4">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => goPage(faqPage - 1)}
                    disabled={faqPage === 1}
                    className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => goPage(p)}
                      className={`w-9 h-9 rounded-full border text-sm font-semibold transition-colors shadow-sm ${
                        p === faqPage
                          ? 'bg-[#D32F2F] border-[#D32F2F] text-white'
                          : 'bg-white border-gray-200 text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => goPage(faqPage + 1)}
                    disabled={faqPage === totalPages}
                    className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* ─── CTA Banner ──────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-[#212121] to-[#B71C1C]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Ready to Unlock Your Destiny?</h2>
          <p className="text-white/80 text-lg mb-8">Book Your Personalised Numerology Number</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={openBooking} className="px-8 py-4 bg-[#FBC02D] text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Book Your Number
            </button>
            <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
