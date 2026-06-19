import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { ChevronLeft, ChevronRight, Star, ChevronDown, TrendingUp, Briefcase, Heart, Award, Zap, Users, CheckCircle, Hash, Sparkles, Quote } from 'lucide-react';

interface OutletCtx { openBooking: () => void }

const heroSlides = [
  {
    title: 'Discover Your VIP Numerology Numbers',
    desc: 'Unlock the hidden power of premium numbers that attract wealth, health, and success into your life.',
    cta: 'Explore VIP Numbers',
    bg: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1440&h=700&fit=crop&auto=format',
    overlay: 'from-black/75 via-black/40 to-transparent',
  },
  {
    title: 'Personal Numerology Consultation',
    desc: "Get a one-on-one session with India's top numerologists. Align your mobile, name & business with cosmic energy.",
    cta: 'Book Consultation',
    bg: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1440&h=700&fit=crop&auto=format',
    overlay: 'from-[#D32F2F]/80 via-[#D32F2F]/30 to-transparent',
  },
  {
    title: 'Business Numerology Solutions',
    desc: 'Transform your business with numerologically optimised company names, launch dates, and lucky numbers.',
    cta: 'Grow Your Business',
    bg: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1440&h=700&fit=crop&auto=format',
    overlay: 'from-black/75 via-black/35 to-transparent',
  },
];

const vipNumbers = [
  { number: '9999999999', category: 'Supreme Luck', desc: 'The ultimate power number — attracts abundance and universal energy.', price: '₹4,99,000', badge: 'SOLD OUT' },
  { number: '8888888888', category: 'Wealth Magnet', desc: 'Eight signifies infinite wealth and material prosperity.', price: '₹3,99,000', badge: 'HOT' },
  { number: '7777777777', category: 'Spiritual Master', desc: 'Divine seven resonates with wisdom and enlightenment.', price: '₹2,99,000', badge: '' },
  { number: '6666666666', category: 'Harmony & Love', desc: 'Perfect balance for relationships and family prosperity.', price: '₹1,99,000', badge: 'NEW' },
  { number: '5555555555', category: 'Freedom & Change', desc: 'Dynamic five accelerates growth and new opportunities.', price: '₹1,49,000', badge: '' },
  { number: '1111111111', category: 'Leadership', desc: 'The master leader number — ideal for entrepreneurs.', price: '₹2,49,000', badge: 'HOT' },
  { number: '3333333333', category: 'Creative Power', desc: 'Creativity, expression, and joyful manifestation.', price: '₹99,000', badge: '' },
  { number: '4444444444', category: 'Foundation', desc: 'Stability, trust, and unshakeable business foundation.', price: '₹1,24,000', badge: 'NEW' },
];

const services = [
  { title: 'VIP Number Booking', desc: 'Reserve exclusive premium mobile numbers aligned with your numerology profile.', icon: Hash, img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop' },
  { title: 'Mobile Numerology', desc: 'Analyse your existing mobile number and its impact on your life path.', icon: Sparkles, img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop' },
  { title: 'Business Numerology', desc: 'Align your business name, registration date, and brand with success vibrations.', icon: Briefcase, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=250&fit=crop' },
  { title: 'Name Correction', desc: 'Optimise your name spelling for maximum positive energy and opportunities.', icon: Sparkles, img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop' },
  { title: 'Numerology Consultation', desc: 'Deep personal analysis by certified numerologists with 10+ years experience.', icon: Users, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop' },
  { title: 'Premium Suggestions', desc: 'Curated list of powerful numbers matching your birth date and life purpose.', icon: Award, img: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=400&h=250&fit=crop' },
];

const benefits = [
  { icon: TrendingUp, title: 'Wealth Attraction', desc: 'Harness number vibrations that magnetically draw financial abundance.' },
  { icon: Briefcase, title: 'Career Growth', desc: 'Align your numbers with your professional path for rapid advancement.' },
  { icon: Zap, title: 'Positive Energy', desc: 'Surround yourself with frequencies that boost vitality and enthusiasm.' },
  { icon: Award, title: 'Business Success', desc: 'Numerologically optimised decisions for sustainable business growth.' },
  { icon: Heart, title: 'Better Relationships', desc: 'Improve harmony in personal and professional relationships.' },
  { icon: Sparkles, title: 'Improved Confidence', desc: 'Numbers that resonate with your core identity build lasting confidence.' },
];

const reviews = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, review: 'Switched to a VIP number recommended by VIP Numerology and my business revenue doubled within 3 months!', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', tag: 'Business Owner' },
  { name: 'Rajesh Patel', city: 'Ahmedabad', rating: 5, review: 'The name correction service changed my life completely. Got promoted twice in one year!', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', tag: 'Corporate Executive' },
  { name: 'Ananya Reddy', city: 'Hyderabad', rating: 5, review: 'Best investment I made. The 8888 series number brought incredible prosperity to my family.', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop', tag: 'Entrepreneur' },
  { name: 'Vikram Singh', city: 'Delhi', rating: 4, review: 'Professional, knowledgeable, and truly transformative. Highly recommend the business numerology package.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', tag: 'Real Estate Developer' },
  { name: 'Meena Iyer', city: 'Chennai', rating: 5, review: 'Changed my daughter\'s name spelling and she started excelling in school. Magic!', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', tag: 'Parent' },
  { name: 'Suresh Kumar', city: 'Bangalore', rating: 5, review: 'Got a 9999 series number for my startup. First funding round was a massive success!', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', tag: 'Startup Founder' },
  { name: 'Deepa Nair', city: 'Kochi', rating: 5, review: 'The personal consultation was eye-opening. I now understand the role numbers play in our destiny.', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop', tag: 'Teacher' },
  { name: 'Karan Mehta', city: 'Pune', rating: 4, review: 'Highly professional team. The premium number suggestions were spot-on for my career transition.', img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop', tag: 'IT Professional' },
  { name: 'Sunita Rao', city: 'Hyderabad', rating: 5, review: 'My marriage date was selected by VIP Numerology. We just completed our 5th anniversary with so much joy!', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', tag: 'Homemaker' },
  { name: 'Anil Bhatt', city: 'Surat', rating: 5, review: 'Business tripled after switching our company number. Incredible results within 6 months.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', tag: 'Textile Merchant' },
  { name: 'Nisha Gupta', city: 'Jaipur', rating: 5, review: 'Name correction for my son brought remarkable improvements in his confidence and performance.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', tag: 'Parent' },
  { name: 'Rohit Kapoor', city: 'Chandigarh', rating: 4, review: 'Excellent consultation service. Dr. Sharma\'s insights were accurate and his advice practical.', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', tag: 'Doctor' },
];

const REVIEWS_PER_PAGE = 8;

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewPage, setReviewPage] = useState(0);
  const { openBooking } = useOutletContext<OutletCtx>();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const visibleReviews = reviews.slice(reviewPage * REVIEWS_PER_PAGE, (reviewPage + 1) * REVIEWS_PER_PAGE);

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero Slider ─────────────────────── */}
      <section className="relative h-[85vh] min-h-[520px] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={slide.bg} alt={slide.title} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-[#FBC02D]/20 border border-[#FBC02D]/40 text-[#FBC02D] px-4 py-1.5 rounded-full text-sm font-medium mb-5">
                    <Sparkles size={13} /> India's #1 Numerology Platform
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {slide.title}
                  </h1>
                  <p className="text-lg text-white/85 mb-8 leading-relaxed">{slide.desc}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={openBooking}
                      className="px-8 py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors shadow-lg"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {slide.cta}
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
        ))}

        <button onClick={() => setCurrentSlide(s => (s - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/30">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setCurrentSlide(s => (s + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/30">
          <ChevronRight size={20} />
        </button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-[#FBC02D] w-8' : 'bg-white/50 w-3'}`} />
          ))}
        </div>
      </section>

      {/* ─── About Preview ───────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=500&fit=crop" alt="Numerology Consultation" className="w-full rounded-2xl object-cover" />
              <div className="absolute -bottom-6 -right-6 bg-[#D32F2F] text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>15+</div>
                <div className="text-sm opacity-90">Years of Excellence</div>
              </div>
              <div className="absolute -top-4 -left-4 bg-[#FBC02D] p-4 rounded-xl shadow-lg">
                <CheckCircle size={26} className="text-white" />
              </div>
            </div>
            <div>
              <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">About VIP Numerology</div>
              <h2 className="text-4xl font-bold text-[#212121] leading-tight mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>India's Most Trusted<br />Numerology Authority</h2>
              <p className="text-[#616161] leading-relaxed mb-4">Founded in Pune, Maharashtra, VIP Numerology has guided over 12,000 individuals and businesses to harness the ancient science of numbers. Our certified numerologists combine Vedic numerology with modern analytical methods.</p>
              <p className="text-[#616161] leading-relaxed mb-8">From premium VIP mobile numbers to comprehensive life path consultations, we deliver transformative results backed by science and spirituality.</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[['12,450+', 'Customers Served'], ['240+', 'Certified Experts'], ['50+', 'Cities Covered'], ['98%', 'Success Rate']].map(([v, l]) => (
                  <div key={l} className="bg-[#FFF8E1] rounded-xl p-4">
                    <div className="text-[#D32F2F] text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{v}</div>
                    <div className="text-[#616161] text-sm">{l}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/about')} className="px-6 py-3 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Read More About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VIP Numbers ─────────────────────── */}
      <section className="py-20 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Premium Collection</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Top VIP Numbers</h2>
            <p className="text-[#616161] mt-3 max-w-lg mx-auto">Exclusive premium numbers curated for maximum positive vibrations and life-changing energy.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vipNumbers.map((n, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#D32F2F]/30 hover:shadow-lg transition-all group relative overflow-hidden">
                {n.badge && (
                  <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-bold ${n.badge === 'SOLD OUT' ? 'bg-gray-200 text-gray-500' : n.badge === 'HOT' ? 'bg-[#D32F2F] text-white' : 'bg-[#FBC02D] text-black'}`}>{n.badge}</div>
                )}
                <div className="w-12 h-12 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Hash size={22} className="text-white" />
                </div>
                <div className="font-bold text-lg text-[#212121] tracking-wider mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{n.number.slice(0, 5) + ' ' + n.number.slice(5)}</div>
                <div className="inline-block bg-[#FFF8E1] text-[#D32F2F] text-xs font-semibold px-2 py-0.5 rounded-full mb-2">{n.category}</div>
                <p className="text-[#616161] text-sm mb-4 leading-relaxed">{n.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#D32F2F] font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{n.price}</span>
                  <button
                    onClick={openBooking}
                    disabled={n.badge === 'SOLD OUT'}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${n.badge === 'SOLD OUT' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]'}`}
                  >
                    {n.badge === 'SOLD OUT' ? 'Sold Out' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate('/services')} className="px-8 py-3 border-2 border-[#D32F2F] text-[#D32F2F] rounded-xl font-semibold hover:bg-[#D32F2F] hover:text-white transition-colors">
              View All Numbers
            </button>
          </div>
        </div>
      </section>

      {/* ─── Services ────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">What We Offer</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Services</h2>
            <p className="text-[#616161] mt-3 max-w-lg mx-auto">Comprehensive numerology solutions designed to transform every dimension of your life.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                  <div className="relative h-44 overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 w-8 h-8 bg-[#FBC02D] rounded-lg flex items-center justify-center">
                      <Icon size={15} className="text-black" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-[#212121] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.title}</h3>
                    <p className="text-[#616161] text-sm leading-relaxed mb-4">{s.desc}</p>
                    <button onClick={() => navigate('/services')} className="text-[#D32F2F] text-sm font-semibold hover:underline flex items-center gap-1">
                      View Details <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Social Proof</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>What Our Clients Say</h2>
            <p className="text-[#616161] mt-3">Over 12,450 happy clients across India and abroad.</p>

            {/* Rating summary */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#D32F2F]" style={{ fontFamily: 'Poppins, sans-serif' }}>4.9</div>
                <div className="flex justify-center gap-0.5 my-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-[#FBC02D] fill-current" />)}
                </div>
                <div className="text-[#616161] text-sm">Average Rating</div>
              </div>
              <div className="h-14 w-px bg-gray-200" />
              {[['12K+', 'Happy Clients'], ['98%', 'Satisfaction'], ['4.9★', 'Google Rating']].map(([v, l]) => (
                <div key={l} className="text-center hidden sm:block">
                  <div className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{v}</div>
                  <div className="text-[#616161] text-xs mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {visibleReviews.map((r, i) => (
              <article key={i} className="bg-[#FFF8E1] rounded-2xl p-5 hover:shadow-md transition-shadow relative">
                <Quote size={28} className="text-[#D32F2F]/15 absolute top-4 right-4" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.rating)].map((_, j) => <Star key={j} size={13} className="text-[#FBC02D] fill-current" />)}
                  {[...Array(5 - r.rating)].map((_, j) => <Star key={j} size={13} className="text-gray-300" />)}
                </div>
                <p className="text-[#616161] text-sm leading-relaxed mb-4 italic">"{r.review}"</p>
                <div className="flex items-center gap-3">
                  <img src={r.img} alt={r.name} className="w-10 h-10 rounded-full object-cover border-2 border-[#D32F2F]/20" />
                  <div>
                    <div className="font-semibold text-[#212121] text-sm">{r.name}</div>
                    <div className="text-[#616161] text-xs">{r.tag} · {r.city}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination for reviews */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setReviewPage(p => Math.max(0, p - 1))} disabled={reviewPage === 0}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#616161] disabled:opacity-40 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalReviewPages }, (_, i) => (
              <button key={i} onClick={() => setReviewPage(i)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${reviewPage === i ? 'bg-[#D32F2F] text-white' : 'border border-gray-200 text-[#616161] hover:border-[#D32F2F]'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setReviewPage(p => Math.min(totalReviewPages - 1, p + 1))} disabled={reviewPage === totalReviewPages - 1}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#616161] disabled:opacity-40 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-[#212121] to-[#B71C1C]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Ready to Unlock Your Destiny?</h2>
          <p className="text-white/80 text-lg mb-8">Book a free 15-minute numerology consultation today and discover your life path number.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={openBooking} className="px-8 py-4 bg-[#FBC02D] text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Book Free Consultation
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
