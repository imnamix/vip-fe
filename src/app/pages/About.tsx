import { useNavigate, useOutletContext } from 'react-router';
import { CheckCircle, Target, Eye, Heart, Play, Star, Shield, Zap, TrendingUp, Users, Award, Sparkles } from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel';

interface OutletCtx { openBooking: () => void }

const bannerSlides = [
  { img: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1440&h=400&fit=crop', title: 'About VIP Numerology', subtitle: '15 years of transforming lives through the power of numbers.' },
  { img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1440&h=400&fit=crop', title: 'Our Story & Mission', subtitle: "India's most trusted numerology consultancy since 2009." },
  { img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1440&h=400&fit=crop', title: 'Meet Our Experts', subtitle: '240+ certified numerologists across India.' },
];

const processSteps = [
  { num: '01', title: 'Submit Inquiry', desc: 'Fill out our simple inquiry form with your details and goals.' },
  { num: '02', title: 'Consultation', desc: 'Schedule a one-on-one session with a certified numerologist.' },
  { num: '03', title: 'Analysis', desc: 'Deep analysis of your birth number, name, and life path.' },
  { num: '04', title: 'Suggestions', desc: 'Receive a personalised list of compatible lucky numbers.' },
  { num: '05', title: 'Selection', desc: 'Choose the perfect number that aligns with your vibration.' },
  { num: '06', title: 'Payment', desc: 'Secure payment through multiple modes including UPI and net banking.' },
  { num: '07', title: 'Activation', desc: 'Your VIP number SIM is activated and dispatched within 24 hours.' },
  { num: '08', title: 'Support', desc: 'Ongoing support and annual numerology check-in included.' },
];

const coreValues = [
  { icon: CheckCircle, title: 'Integrity', desc: 'We provide honest, unbiased numerological analysis grounded in ancient Vedic wisdom.' },
  { icon: Target, title: 'Precision', desc: 'Our calculations are meticulous, combining multiple numerological systems for accuracy.' },
  { icon: Eye, title: 'Transparency', desc: 'No hidden fees, no vague promises — clear reports with actionable insights.' },
  { icon: Heart, title: 'Compassion', desc: "We treat every client's journey as unique and approach it with empathy and care." },
];

const whyChoose = [
  { icon: Star, title: 'Certified Experts', desc: 'All our numerologists hold recognised certifications with 5–20 years of practice.' },
  { icon: Shield, title: 'Money-Back Guarantee', desc: '30-day satisfaction guarantee. If you\'re not happy, we\'ll revise or refund — no questions asked.' },
  { icon: Zap, title: 'Fast Turnaround', desc: 'Consultation reports delivered within 48 hours. SIM activation within 24 hours.' },
  { icon: TrendingUp, title: 'Proven Results', desc: '98% of our clients report measurable positive changes within 90 days.' },
  { icon: Users, title: 'Large Community', desc: 'Join 12,450+ members across India who have transformed their lives through our platform.' },
  { icon: Award, title: 'Industry Awards', desc: 'Winner of the Best Numerology Platform award 4 years in a row by MetaSpirit India.' },
  { icon: Sparkles, title: 'Personalised Approach', desc: 'Every consultation is 100% customised to your birth number, name, and goals.' },
  { icon: Eye, title: 'Transparent Pricing', desc: 'Clear, upfront pricing with no hidden charges. What you see is what you pay.' },
];

export default function About() {
  const navigate = useNavigate();
  const { openBooking } = useOutletContext<OutletCtx>();

  return (
    <div>
      <BannerCarousel slides={bannerSlides} pageName="About Us" breadcrumb="About Us" />

      {/* Company Intro */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Our Story</div>
              <h2 className="text-4xl font-bold text-[#212121] leading-tight mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>15 Years of Transforming Lives Through Numbers</h2>
              <p className="text-[#616161] leading-relaxed mb-4">VIP Numerology was founded in 2009 by Dr. Arjun Sharma, one of India's most celebrated Vedic numerologists with a doctorate in metaphysical sciences. Starting from a modest office in Pune, we've grown into India's foremost numerology consultancy.</p>
              <p className="text-[#616161] leading-relaxed mb-4">Our journey has been driven by a singular belief: that numbers are the language of the universe, and by aligning ourselves with the right vibrations, we can unlock extraordinary potential. Over 12,450 clients across India and 22 countries have experienced the life-altering power of our consultations.</p>
              <p className="text-[#616161] leading-relaxed mb-8">Today, VIP Numerology employs a network of 240+ certified numerologists offering services from VIP mobile number booking to comprehensive business and personal consultations.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[['2009', 'Founded'], ['12K+', 'Clients'], ['240+', 'Experts'], ['22', 'Countries']].map(([v, l]) => (
                  <div key={l} className="text-center p-4 bg-[#FFF8E1] rounded-xl">
                    <div className="text-[#D32F2F] text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{v}</div>
                    <div className="text-[#616161] text-xs mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=500&fit=crop" alt="Our Team" className="rounded-2xl w-full" />
              <div className="absolute -bottom-4 -left-4 bg-[#FBC02D] text-black p-5 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>4.9 ★</div>
                <div className="text-sm font-medium">Google Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose VIP Numerologist */}
      <section className="py-20 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Our Advantage</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Why Choose VIP Numerologist?</h2>
            <p className="text-[#616161] mt-3 max-w-xl mx-auto">We combine ancient Vedic wisdom with modern methodology to deliver measurable, life-changing results.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((w, i) => {
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
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFF8E1] rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#D32F2F] rounded-xl flex items-center justify-center mb-5"><Target size={24} className="text-white" /></div>
              <h3 className="text-2xl font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Mission</h3>
              <p className="text-[#616161] leading-relaxed">To democratise the ancient science of numerology and make its transformative benefits accessible to everyone — individuals, families, and businesses — across India and the world.</p>
            </div>
            <div className="bg-[#D32F2F] rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5"><Eye size={24} className="text-white" /></div>
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Vision</h3>
              <p className="text-red-100 leading-relaxed">To be the world's most trusted numerology platform, where every life decision — from choosing a phone number to launching a company — is empowered by the wisdom of numbers.</p>
            </div>
            <div className="bg-[#FFF8E1] rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#FBC02D] rounded-xl flex items-center justify-center mb-5"><Heart size={24} className="text-white" /></div>
              <h3 className="text-2xl font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Values</h3>
              <p className="text-[#616161] leading-relaxed">Integrity, precision, compassion, and transparency. We believe in building lifelong relationships with our clients based on trust, results, and genuine care for their wellbeing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">What Drives Us</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="text-center p-8 rounded-2xl bg-[#FFF8E1] hover:bg-[#D32F2F] group transition-colors">
                  <div className="w-14 h-14 bg-[#D32F2F] group-hover:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Icon size={24} className="text-white group-hover:text-[#D32F2F] transition-colors" />
                  </div>
                  <h3 className="font-bold text-[#212121] group-hover:text-white text-lg mb-2 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>{v.title}</h3>
                  <p className="text-[#616161] group-hover:text-red-100 text-sm leading-relaxed transition-colors">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 bg-[#212121] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#FBC02D] font-semibold text-xs uppercase tracking-widest mb-3">How It Works</div>
            <h2 className="text-4xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Our Process</h2>
            <p className="text-gray-400 mt-3">Eight simple steps from inquiry to transformation.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {processSteps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white font-bold mb-3 shadow-lg">
                  {step.num}
                </div>
                {i < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute left-[calc(50%+28px)] top-7 w-[calc(100%-56px)] h-0.5 bg-gradient-to-r from-[#D32F2F] to-[#FBC02D] opacity-40" />
                )}
                <h4 className="text-white text-xs font-semibold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{step.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed hidden sm:block">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Real Stories</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Video Testimonials</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { name: 'Dr. Ravi Shankar', title: 'Cardiologist, Mumbai', thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop', desc: 'How my practice grew 3x after business numerology' },
              { name: 'Kavita Desai', title: 'Entrepreneur, Bangalore', thumb: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=300&fit=crop', desc: 'Name correction changed the trajectory of my life' },
              { name: 'Anil Bhatt', title: 'Real Estate Developer, Pune', thumb: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=300&fit=crop', desc: 'VIP 9999 number helped me close ₹50 Cr deal' },
            ].map((v, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                <div className="relative h-52">
                  <img src={v.thumb} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#D32F2F] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-[#FFF8E1]">
                  <h4 className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{v.name}</h4>
                  <div className="text-[#D32F2F] text-xs font-medium mb-1">{v.title}</div>
                  <p className="text-[#616161] text-sm">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#D32F2F] to-[#B71C1C]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Begin Your Numerology Journey</h2>
          <p className="text-red-100 text-lg mb-8">Join 12,450+ clients who've transformed their lives with the power of numbers.</p>
          <button onClick={openBooking} className="px-10 py-4 bg-[#FBC02D] text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Book Your Consultation
          </button>
        </div>
      </section>
    </div>
  );
}
