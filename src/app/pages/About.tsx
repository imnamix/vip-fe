import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router';
import { CheckCircle, Target, Eye, Heart, Play, Star, Shield, Zap, TrendingUp, Users, Award, Sparkles, X, BarChart2, Clock, Globe, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench, DollarSign, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel';
import { getAllAboutUs } from '../services/AboutusService';
import { getAllVideoTestimonials } from '../services/VideoTestimonialService';

interface OutletCtx { openBooking: () => void }

interface VideoTestimonial {
  id: number;
  name: string;
  role: string | null;
  review: string | null;
  rating: number | null;
  image: string | null;
  videoUrl: string | null;
}

interface AboutData {
  aboutPageTitle?: string;
  aboutPageDescription?: string;
  aboutPageImage?: string;
  businessDescription?: string;
  mission?: string;
  vision?: string;
  ourValue?: string;
  yearsOfExperience?: number | null;
  whyChooseUs?: Array<{ key: string; value: string; icon: string }>;
  statistics?: Array<{ key: string; value: string; icon?: string }>;
  slides?: Array<{ title: string; description: string; image?: string }>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Star, Shield, Zap, TrendingUp, Users, Award, Sparkles, CheckCircle, Target, Eye, Heart,
  BarChart2, Clock, Globe, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench, DollarSign, Hash,
};

function AboutIcon({ name, size = 20, className = 'text-white' }: { name: string; size?: number; className?: string }) {
  const Comp = ICON_MAP[name];
  return Comp ? <Comp size={size} className={className} /> : <Star size={size} className={className} />;
}

function getEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return url;
}

function getThumb(v: VideoTestimonial): string {
  if (v.image) return v.image;
  const yt = v.videoUrl?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/\s]+)/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
  return '';
}

function isEmbeddable(url: string | null): boolean {
  return !!url && /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

function renderHTML(html: string, textClass = 'text-[#616161]') {
  if (!html?.trim()) return null;
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
              <span className={`${textClass} text-[15px]`} dangerouslySetInnerHTML={{ __html: item }} />
            </li>
          ))}
        </ul>
      );
    }
    if (part.trim()) {
      return <div key={i} className={`${textClass} leading-relaxed`} dangerouslySetInnerHTML={{ __html: part }} />;
    }
    return null;
  });
}

const DEFAULT_BANNER_SLIDES = [
  { img: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1440&h=400&fit=crop', title: 'About VIP Numerology', subtitle: '15 years of transforming lives through the power of numbers.' },
  { img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1440&h=400&fit=crop', title: 'Our Story & Mission', subtitle: "India's most trusted numerology consultancy since 2009." },
  { img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1440&h=400&fit=crop', title: 'Meet Our Experts', subtitle: '240+ certified numerologists across India.' },
];

const processSteps = [
  { num: '01', title: 'Submit Your Requirement', desc: 'Share your details and goals through our simple inquiry form or call us directly.' },
  { num: '02', title: 'Number Collection', desc: 'We collect and curate your most valuable and perfect numbers aligned to your vibration.' },
  { num: '03', title: 'Choose Your Best Number', desc: 'From the top 3 numbers shortlisted as per your requirement, select the best one for you.' },
  { num: '04', title: 'Payment', desc: 'Complete secure payment via UPI, cards, or net banking — quick and hassle-free.' },
  { num: '05', title: 'SIM Card Delivery', desc: 'Your SIM card is dispatched for delivery from your nearest Vi store to your location.' },
  { num: '06', title: 'Future Service Assurance', desc: 'We ensure ongoing service assurance so your SIM is always delivered from your nearest Vi store.' },
  { num: '07', title: 'Activation Process Demo', desc: 'Our team guides you through a step-by-step activation demo to get your VIP number live.' },
  { num: '08', title: 'Exciting Offer for You', desc: 'Receive an exclusive exciting offer delivered as a special gift — part of your VIP package.' },
];

const DEFAULT_WHY_CHOOSE = [
  { icon: Star, title: 'Certified Experts', desc: 'All our numerologists hold recognised certifications with 5–20 years of practice.' },
  { icon: Shield, title: 'Money-Back Guarantee', desc: "30-day satisfaction guarantee. If you're not happy, we'll revise or refund — no questions asked." },
  { icon: Zap, title: 'Fast Turnaround', desc: 'Consultation reports delivered within 48 hours. SIM activation within 24 hours.' },
  { icon: TrendingUp, title: 'Proven Results', desc: '98% of our clients report measurable positive changes within 90 days.' },
  { icon: Users, title: 'Large Community', desc: 'Join 12,450+ members across India who have transformed their lives through our platform.' },
  { icon: Award, title: 'Industry Awards', desc: 'Winner of the Best Numerology Platform award 4 years in a row by MetaSpirit India.' },
  { icon: Sparkles, title: 'Personalised Approach', desc: 'Every consultation is 100% customised to your birth number, name, and goals.' },
  { icon: Eye, title: 'Transparent Pricing', desc: 'Clear, upfront pricing with no hidden charges. What you see is what you pay.' },
];

function VideoCard({ v, cardW, onPlay, dragging }: { v: VideoTestimonial; cardW: number; onPlay: () => void; dragging: boolean }) {
  const thumb = getThumb(v);
  return (
    <div
      className="flex-shrink-0 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 group mb-2"
      style={{ minWidth: cardW, maxWidth: cardW, cursor: 'pointer' }}
      onClick={() => { if (!dragging) onPlay(); }}
    >
      {/* Square image with semi-transparent play button */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {thumb ? (
          <img src={thumb} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable={false} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/60 group-hover:scale-110 transition-all duration-300 shadow-lg">
            <Play size={22} className="text-white ml-1" fill="white" />
          </div>
        </div>
      </div>
      {/* Bottom strip */}
      <div className="px-3 py-3 flex items-start gap-2.5 bg-white">
        {thumb ? (
          <img src={thumb} alt={v.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-gray-100 mt-0.5" draggable={false} />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#D32F2F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[#D32F2F] font-bold text-sm">{v.name?.[0]?.toUpperCase()}</span>
          </div>
        )}
        <div className="min-w-0">
          <div className="font-bold text-[#212121] text-sm leading-tight truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{v.name}</div>
          {v.role && <div className="text-[#9E9E9E] text-xs mt-0.5 truncate">{v.role}</div>}
          {v.rating != null && (
            <div className="flex items-center gap-0.5 mt-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={11} className={s <= v.rating! ? 'text-[#FBC02D] fill-current' : 'text-gray-200 fill-current'} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const { openBooking } = useOutletContext<OutletCtx>();
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  const videoWrapRef = useRef<HTMLDivElement>(null);
  const [videoCardW, setVideoCardW] = useState(0);
  const [vidIdx, setVidIdx] = useState(0);
  const [vidAnim, setVidAnim] = useState(true);
  const vidPausedRef = useRef(false);
  const vidDragX = useRef<number | null>(null);
  const vidIsDragging = useRef(false);

  const VIDEO_GAP = 20;

  useEffect(() => {
    getAllAboutUs(1, 10).then(res => {
      const entry = res?.data?.[0];
      if (entry) setAboutData(entry);
    }).catch(() => {});

    getAllVideoTestimonials(0, 100).then(res => {
      if (res?.data?.length) setVideos(res.data);
    }).catch(() => {});
  }, []);

  // Measure container for card width (4 visible)
  useEffect(() => {
    const el = videoWrapRef.current;
    if (!el) return;
    const calc = () => setVideoCardW((el.clientWidth - VIDEO_GAP * 3) / 4);
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [videos.length]);

  // Seamless loop reset
  useEffect(() => {
    if (videos.length <= 4 || vidIdx < videos.length) return;
    const t = setTimeout(() => {
      setVidAnim(false);
      setVidIdx(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setVidAnim(true)));
    }, 680);
    return () => clearTimeout(t);
  }, [vidIdx, videos.length]);

  // Auto-advance (only when more than 4 videos)
  useEffect(() => {
    if (videos.length <= 4) return;
    const t = setInterval(() => {
      if (!vidPausedRef.current) { setVidAnim(true); setVidIdx(i => i + 1); }
    }, 3500);
    return () => clearInterval(t);
  }, [videos.length]);

  const goVidNext = () => { setVidAnim(true); setVidIdx(i => (i + 1) % videos.length); };
  const goVidPrev = () => { setVidAnim(true); setVidIdx(i => (i - 1 + videos.length) % videos.length); };

  const onVidPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Do NOT use setPointerCapture — it routes pointerup to the track div,
    // preventing the browser from generating click events on child cards.
    vidIsDragging.current = false;
    vidDragX.current = e.clientX;
  };
  const onVidPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (vidDragX.current === null || e.buttons === 0) return;
    if (Math.abs(e.clientX - vidDragX.current) > 8) vidIsDragging.current = true;
  };
  const onVidPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (vidDragX.current === null) return;
    const diff = e.clientX - vidDragX.current;
    vidDragX.current = null;
    if (Math.abs(diff) > 40) { diff < 0 ? goVidNext() : goVidPrev(); }
    // Reset after click fires so the card's onClick check sees false
    requestAnimationFrame(() => { vidIsDragging.current = false; });
  };
  const onVidPointerLeave = () => {
    // Cancel drag if pointer leaves the track without releasing
    vidDragX.current = null;
    vidIsDragging.current = false;
  };

  const bannerSlides = aboutData?.slides?.length
    ? aboutData.slides.map(s => ({ img: s.image ?? '', title: s.title, subtitle: s.description }))
    : DEFAULT_BANNER_SLIDES;

  // Use aboutPageDescription first, fall back to businessDescription
  const description = aboutData?.aboutPageDescription || aboutData?.businessDescription;
  const introTitle = aboutData?.aboutPageTitle;
  const introImage = aboutData?.aboutPageImage;
  const statsData = aboutData?.statistics?.length ? aboutData.statistics : null;
  const whyChooseApi = aboutData?.whyChooseUs?.length ? aboutData.whyChooseUs : null;

  // Extended array for seamless infinite loop (clone first 4 at the end)
  const extVideos = videos.length > 4
    ? [...videos, ...videos.slice(0, 4)]
    : videos;

  return (
    <div>
      <BannerCarousel slides={bannerSlides} pageName="About Us" breadcrumb="About Us" />

      {/* ── Company Intro ── */}
      {(introImage || description || introTitle || statsData) && (
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Left — image with badge */}
              {introImage && (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={introImage} alt="About VIP Numerology" className="w-full object-cover object-top" />
                  {aboutData?.yearsOfExperience != null && (
                    <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
                      <div className="w-10 h-10 bg-[#D32F2F]/80 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-xl leading-none" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {aboutData.yearsOfExperience}+
                        </div>
                        <div className="text-white/75 text-xs mt-0.5">Years of Excellence</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Right — text */}
              <div className={!introImage ? 'lg:col-span-2' : ''}>
                <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Our Story</div>
                {introTitle && (
                  <h2 className="text-4xl font-bold text-[#212121] leading-tight mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {introTitle}
                  </h2>
                )}
                {description && (
                  <div className="mb-6">{renderHTML(description)}</div>
                )}
                {statsData && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {statsData.map(s => (
                      <div key={s.key} className="bg-[#FFF8E1] rounded-xl p-4 flex items-start gap-3">
                        {s.icon && (
                          <div className="w-8 h-8 bg-[#D32F2F]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AboutIcon name={s.icon} size={16} className="text-[#D32F2F]" />
                          </div>
                        )}
                        <div>
                          <div className="text-[#D32F2F] text-2xl font-bold leading-none" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.value}</div>
                          <div className="text-[#616161] text-sm mt-0.5">{s.key}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={openBooking}
                  className="px-6 py-3 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Book 
                </button>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose VIP Numerologist ── */}
      <section className="py-20 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Our Advantage</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Why Choose VIP Numerology?</h2>
            <p className="text-[#616161] mt-3 max-w-xl mx-auto">We combine ancient Vedic wisdom with modern methodology to deliver measurable, life-changing results.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(whyChooseApi ? whyChooseApi.map((w, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#D32F2F]/30 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <AboutIcon name={w.icon} size={20} />
                </div>
                <h3 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{w.key}</h3>
                <p className="text-[#616161] text-sm leading-relaxed">{w.value}</p>
              </div>
            )) : DEFAULT_WHY_CHOOSE.map((w, i) => {
              const Icon = w.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#D32F2F]/30 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{w.title}</h3>
                  <p className="text-[#616161] text-sm leading-relaxed">{w.desc}</p>
                </div>
              );
            }))}
          </div>
        </div>
      </section>

      {/* ── Mission, Vision & Values ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFF8E1] rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#D32F2F] rounded-xl flex items-center justify-center mb-5"><Target size={24} className="text-white" /></div>
              <h3 className="text-2xl font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Mission</h3>
              {aboutData?.mission ? renderHTML(aboutData.mission) : (
                <p className="text-[#616161] leading-relaxed">To democratise the ancient science of numerology and make its transformative benefits accessible to everyone — individuals, families, and businesses — across India and the world.</p>
              )}
            </div>
            <div className="bg-[#D32F2F] rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5"><Eye size={24} className="text-white" /></div>
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Vision</h3>
              {aboutData?.vision ? renderHTML(aboutData.vision, 'text-red-100') : (
                <p className="text-red-100 leading-relaxed">To be the world's most trusted numerology platform, where every life decision — from choosing a phone number to launching a company — is empowered by the wisdom of numbers.</p>
              )}
            </div>
            <div className="bg-[#FFF8E1] rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#FBC02D] rounded-xl flex items-center justify-center mb-5"><Heart size={24} className="text-white" /></div>
              <h3 className="text-2xl font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Values</h3>
              {aboutData?.ourValue ? renderHTML(aboutData.ourValue) : (
                <p className="text-[#616161] leading-relaxed">Integrity, precision, compassion, and transparency. We believe in building lifelong relationships with our clients based on trust, results, and genuine care for their wellbeing.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-20 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">How It Works</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Process</h2>
            <p className="text-[#616161] mt-3">Eight simple steps from your first inquiry to complete transformation.</p>
          </div>

          {/* Row 1: Steps 1–4 (red) */}
          <div className="relative mb-6">
            <div className="absolute top-7 left-[12%] right-[12%] h-0.5 bg-[#D32F2F] z-0 hidden sm:block" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {processSteps.slice(0, 4).map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-[#D32F2F] flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">
                    {step.num}
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 w-full">
                    <h4 className="font-bold text-[#212121] text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{step.title}</h4>
                    <p className="text-[#616161] text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical connector between rows */}
          <div className="flex justify-center my-1">
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-[#D32F2F]/40" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#FBC02D] border-2 border-[#D32F2F]/30 shadow-sm" />
              <div className="w-px h-8 bg-[#FBC02D]/60" />
            </div>
          </div>

          {/* Row 2: Steps 5–8 (yellow) */}
          <div className="relative mt-1">
            <div className="absolute top-7 left-[12%] right-[12%] h-0.5 bg-[#FBC02D] z-0 hidden sm:block" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {processSteps.slice(4).map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-[#FBC02D] flex items-center justify-center text-[#212121] font-bold text-sm shadow-lg flex-shrink-0">
                    {step.num}
                  </div>
                  <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 w-full">
                    <h4 className="font-bold text-[#212121] text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{step.title}</h4>
                    <p className="text-[#616161] text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Video Testimonials ── */}
      {videos.length > 0 && (
        <section className="py-20 bg-[#FFF8E1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Real Stories</div>
              <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Video Testimonials</h2>
              <p className="text-[#616161] mt-3">Hear directly from our clients about their transformation.</p>
            </div>

            {videos.length <= 4 ? (
              /* ── ≤4 videos: centered static grid ── */
              <div className="flex justify-center gap-5 flex-wrap">
                {videos.map(v => <VideoCard key={v.id} v={v} cardW={videoCardW > 0 ? videoCardW : 260} onPlay={() => setActiveVideo(v)} dragging={false} />)}
              </div>
            ) : (
              /* ── >4 videos: auto-scroll carousel with arrows ── */
              <div
                className="relative group/vidcarousel"
                ref={videoWrapRef}
                onMouseEnter={() => { vidPausedRef.current = true; }}
                onMouseLeave={() => { vidPausedRef.current = false; vidDragX.current = null; }}
              >
                {/* Left arrow */}
                <button
                  onClick={goVidPrev}
                  className="absolute -left-5 top-[45%] -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-all opacity-0 group-hover/vidcarousel:opacity-100 duration-300"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Track */}
                <div className="overflow-hidden ">
                  <div
                    className="flex select-none cursor-grab active:cursor-grabbing"
                    style={{
                      gap: VIDEO_GAP,
                      transform: `translateX(-${vidIdx * (videoCardW + VIDEO_GAP)}px)`,
                      transition: vidAnim ? 'transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
                    }}
                    onPointerDown={onVidPointerDown}
                    onPointerMove={onVidPointerMove}
                    onPointerUp={onVidPointerUp}
                    onPointerLeave={onVidPointerLeave}
                  >
                    {extVideos.map((v, i) => (
                      <VideoCard key={i} v={v} cardW={videoCardW > 0 ? videoCardW : 260} onPlay={() => { if (!vidIsDragging.current) setActiveVideo(v); }} dragging={vidIsDragging.current} />
                    ))}
                  </div>
                </div>

                {/* Right arrow */}
                <button
                  onClick={goVidNext}
                  className="absolute -right-5 top-[45%] -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-all opacity-0 group-hover/vidcarousel:opacity-100 duration-300"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-[#D32F2F] to-[#B71C1C]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Begin Your Numerology Journey</h2>
          <p className="text-red-100 text-lg mb-8">Join 12,450+ clients who've transformed their lives with the power of numbers.</p>
          <button onClick={openBooking} className="px-10 py-4 bg-[#FBC02D] text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Book Your Number
          </button>
        </div>
      </section>

      {/* ── Video Popup ── */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: '100%',
              maxWidth: isEmbeddable(activeVideo.videoUrl) ? '896px' : '720px',
              maxHeight: '85vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/15 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <X size={18} />
            </button>

            {/* YouTube / Vimeo → fixed 16:9 iframe */}
            {activeVideo.videoUrl && isEmbeddable(activeVideo.videoUrl) ? (
              <div style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={getEmbedUrl(activeVideo.videoUrl)}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : activeVideo.videoUrl ? (
              /* Direct MP4 (S3) → let video size itself, max 85vh */
              <video
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full block"
                style={{ maxHeight: '85vh', objectFit: 'contain' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-white/60 p-16">
                <Play size={48} className="opacity-30" />
                <span className="text-sm">No video URL provided</span>
              </div>
            )}
          </div>

          {/* Name + role below the video */}
          {(activeVideo.name || activeVideo.role) && (
            <div className="flex items-center gap-3 pointer-events-none">
              {activeVideo.image && (
                <img src={activeVideo.image} alt={activeVideo.name} className="w-9 h-9 rounded-full object-cover border-2 border-white/20" />
              )}
              <div className="text-center">
                <div className="font-semibold text-white text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{activeVideo.name}</div>
                {activeVideo.role && <div className="text-[#FBC02D] text-xs mt-0.5">{activeVideo.role}</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
