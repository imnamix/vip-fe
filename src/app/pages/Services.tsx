import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { X, ChevronRight, CheckCircle, Hash, Phone, Briefcase, Sparkles, Users, Award, Star, Zap, Heart, TrendingUp, Shield } from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel';

interface OutletCtx { openBooking: () => void }

const bannerSlides = [
  { img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1440&h=400&fit=crop', title: 'Our Services', subtitle: '12 premium numerology services for every aspect of life.' },
  { img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1440&h=400&fit=crop', title: 'Business Numerology', subtitle: 'Align your business with the universe for unstoppable growth.' },
  { img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1440&h=400&fit=crop', title: 'Personal Consultations', subtitle: '90-minute deep-dive sessions with India\'s top numerologists.' },
];

const services = [
  { id: 1, title: 'VIP Number Booking', icon: Hash, img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=350&fit=crop', short: 'Reserve exclusive premium mobile numbers aligned with your numerology profile.', desc: "Our VIP Number Booking service gives you access to India's largest collection of premium mobile numbers. Each number is carefully analysed by our team of certified numerologists to ensure perfect alignment with your life path number.", benefits: ['Exclusive premium number inventory', 'Full numerological compatibility analysis', 'Pan-India delivery within 7 days', 'Post-purchase annual numerology review', 'Money-back satisfaction guarantee'], gallery: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop'] },
  { id: 2, title: 'Mobile Numerology', icon: Phone, img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=350&fit=crop', short: 'Analyse your existing mobile number and its impact on your life path.', desc: 'Is your current mobile number working for you or against you? Our Mobile Numerology service provides a comprehensive analysis of your existing number\'s vibrational energy and its compatibility with your personal numerology profile.', benefits: ['Complete number vibration analysis', 'Compatibility score with your life path', 'Impact assessment on health, wealth, relationships', 'Recommendations for enhancement or change', 'Detailed PDF report within 48 hours'], gallery: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop'] },
  { id: 3, title: 'Business Numerology', icon: Briefcase, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=350&fit=crop', short: 'Align your business name, launch date, and brand with cosmic success vibrations.', desc: 'Transform your business destiny through the power of numerology. Our Business Numerology service covers company name analysis, logo colour recommendations, ideal launch dates, GST registration timing, and brand identity alignment.', benefits: ['Business name numerological scoring', 'Optimal launch and registration dates', 'Brand colour and logo recommendations', 'Employee numerology compatibility', 'Quarterly business numerology updates'], gallery: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=300&h=200&fit=crop'] },
  { id: 4, title: 'Name Correction', icon: Sparkles, img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=350&fit=crop', short: 'Optimise your name spelling for maximum positive energy and opportunities.', desc: 'A small change in name spelling can have a profound impact on your vibrational frequency. Our Name Correction service analyses your full name and suggests optimal spelling adjustments to maximise alignment with your birth number.', benefits: ['Complete name numerological analysis', 'Multiple spelling suggestions ranked by power', 'Birth number and destiny number alignment', 'Legal name change guidance', 'Free one-year follow-up consultation'], gallery: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop'] },
  { id: 5, title: 'Personal Consultation', icon: Users, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=350&fit=crop', short: 'One-on-one deep analysis by certified numerologists with 10+ years experience.', desc: 'Our flagship personal consultation is a comprehensive 90-minute session with one of our senior numerologists. We cover your life path number, destiny number, soul urge number, personality number, and maturity number.', benefits: ['90-minute one-on-one video consultation', '30-page comprehensive numerology report', 'Life path, destiny, and soul urge analysis', 'Lucky dates, colours, and gemstone recommendations', 'Annual update consultation included'], gallery: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&h=200&fit=crop'] },
  { id: 6, title: 'Premium Suggestions', icon: Award, img: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=600&h=350&fit=crop', short: 'Curated list of powerful numbers matching your birth date and life purpose.', desc: 'Our Premium Suggestions service generates a curated shortlist of 20+ powerful numbers perfectly matched to your numerological profile. Each suggestion comes with a compatibility score and vibrational analysis.', benefits: ['20+ personalised number suggestions', 'Compatibility scores for each number', 'Network availability check', 'Price range filter to match budget', '7-day reservation for chosen numbers'], gallery: ['https://images.unsplash.com/photo-1518655048521-f130df041f66?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop'] },
  { id: 7, title: 'Relationship Numerology', icon: Heart, img: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&h=350&fit=crop', short: 'Analyse compatibility between partners, friends, or business associates.', desc: 'Understand the numerological dynamics between you and important people in your life. Perfect for couples, business partners, and even parent-child relationships.', benefits: ['Partner compatibility analysis', 'Communication style recommendations', 'Optimal dates for important decisions', 'Conflict resolution through number alignment', 'Ideal wedding date calculation'], gallery: ['https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&h=200&fit=crop'] },
  { id: 8, title: 'Property Numerology', icon: Shield, img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=350&fit=crop', short: 'Find the perfect home or office address numerologically aligned with your success.', desc: 'Your home or office address carries a powerful vibration that influences your life every single day. Our Property Numerology service analyses prospective addresses to find the most auspicious property for your specific profile.', benefits: ['Address vibration analysis', 'Flat and unit number scoring', 'Optimal moving date calculation', 'Vastu and numerology integration', 'Portfolio of recommended properties'], gallery: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&h=200&fit=crop'] },
  { id: 9, title: 'Career Guidance', icon: TrendingUp, img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=350&fit=crop', short: 'Numerologically aligned career path analysis for students and professionals.', desc: 'Discover which career paths resonate most strongly with your numerological profile. Whether you\'re a student choosing a stream or a professional considering a switch, our Career Guidance service provides data-backed insights.', benefits: ['Life path to career mapping', 'Optimal timing for career changes', 'Company compatibility analysis', 'Interview lucky dates and times', 'Salary negotiation timing guidance'], gallery: ['https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop'] },
  { id: 10, title: 'Baby Name Numerology', icon: Star, img: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&h=350&fit=crop', short: 'Choose an auspicious name for your newborn with perfect numerological alignment.', desc: 'Give your child the greatest gift — a name that vibrates with success, health, and happiness. Our Baby Name service generates a personalised list of names perfectly aligned with your baby\'s birth date and time.', benefits: ['50+ name suggestions per consultation', 'Alignment with baby\'s birth numerology', 'Compatibility with parents\' numbers', 'Meaning and numerological value', 'Certificate of numerological approval'], gallery: ['https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop'] },
  { id: 11, title: 'Annual Forecast', icon: Zap, img: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=600&h=350&fit=crop', short: 'Month-by-month numerological forecast for the year ahead.', desc: 'Plan your year with the wisdom of numerology. Our Annual Forecast service provides a detailed month-by-month breakdown of your personal year number, pinnacle cycles, and challenge numbers.', benefits: ['12-month detailed numerological forecast', 'Best months for key decisions', 'Challenge period preparation strategies', 'Health, wealth, and relationship cycles', 'Printed premium report + digital PDF'], gallery: ['https://images.unsplash.com/photo-1464802686167-b939a6910659?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=300&h=200&fit=crop'] },
  { id: 12, title: 'Corporate Packages', icon: Briefcase, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=350&fit=crop', short: 'Comprehensive numerology solutions for corporates, teams, and HR departments.', desc: 'Leverage numerology for strategic corporate advantage. Our Corporate Packages include team compatibility analysis, HR hiring numerology, company-wide lucky number strategy, and product launch timing. Trusted by 500+ businesses.', benefits: ['Team compatibility and synergy analysis', 'HR recruitment numerology filters', 'Board meeting and launch date optimisation', 'Executive personal numerology reports', 'Quarterly corporate numerology updates'], gallery: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&h=200&fit=crop'] },
];

export default function Services() {
  const [selected, setSelected] = useState<typeof services[0] | null>(null);
  const { openBooking } = useOutletContext<OutletCtx>();

  return (
    <div>
      <BannerCarousel slides={bannerSlides} pageName="Services" breadcrumb="Services" />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">What We Offer</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>12 Premium Services</h2>
            <p className="text-[#616161] mt-3 max-w-lg mx-auto">Comprehensive numerology solutions for every aspect of life.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer" onClick={() => setSelected(s)}>
                  <div className="relative h-40 overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 w-8 h-8 bg-[#FBC02D] rounded-lg flex items-center justify-center">
                      <Icon size={15} className="text-black" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#212121] mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{s.title}</h3>
                    <p className="text-[#616161] text-xs leading-relaxed mb-3">{s.short}</p>
                    <span className="text-[#D32F2F] text-xs font-semibold hover:underline">View Details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-52">
              <img src={selected.img} alt={selected.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-white/40">
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-4">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{selected.title}</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[#616161] leading-relaxed mb-6">{selected.desc}</p>
              <h4 className="font-bold text-[#212121] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Key Benefits</h4>
              <ul className="space-y-2 mb-6">
                {selected.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#616161]">
                    <CheckCircle size={15} className="text-[#4CAF50] mt-0.5 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 mb-5">
                {selected.gallery.map((img, i) => <img key={i} src={img} alt="" className="flex-1 rounded-xl h-24 object-cover" />)}
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
    </div>
  );
}
