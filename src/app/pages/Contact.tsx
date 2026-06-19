import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel';

interface OutletCtx { openBooking: () => void }

const bannerSlides = [
  { img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1440&h=400&fit=crop', title: 'Contact Us', subtitle: "We'd love to hear from you. Reach out anytime." },
  { img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1440&h=400&fit=crop', title: 'Get in Touch', subtitle: 'Our team responds within 24 hours.' },
  { img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1440&h=400&fit=crop', title: 'Book a Consultation', subtitle: 'Start your numerology journey with us today.' },
];

export default function Contact() {
  const [tab, setTab] = useState<'inquiry' | 'booking'>('inquiry');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' });
  const { openBooking } = useOutletContext<OutletCtx>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <BannerCarousel slides={bannerSlides} pageName="Contact Us" breadcrumb="Contact Us" />

      {/* Contact Cards */}
      <section className="py-16 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Phone, title: 'Call Us', lines: ['+91 98765 43210', '+91 91234 56789'], color: '#D32F2F', bg: '#FFF8E1' },
              { icon: Mail, title: 'Email Us', lines: ['support@vipnumerology.com', 'info@vipnumerology.com'], color: '#FBC02D', bg: '#FFFDE7' },
              { icon: MapPin, title: 'Visit Us', lines: ['123, Prosperity Plaza', 'Pune, Maharashtra 411001'], color: '#4CAF50', bg: '#E8F5E9' },
              { icon: Clock, title: 'Working Hours', lines: ['Mon–Sat: 9 AM – 8 PM', 'Sunday: 10 AM – 5 PM'], color: '#9C27B0', bg: '#F3E5F5' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: c.bg }}>
                    <Icon size={26} style={{ color: c.color }} />
                  </div>
                  <h3 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{c.title}</h3>
                  {c.lines.map(l => <p key={l} className="text-[#616161] text-sm">{l}</p>)}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Map + Form */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div>
              <h2 className="text-3xl font-bold text-[#212121] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Find Us</h2>
              <div className="rounded-2xl overflow-hidden h-80 bg-gray-100">
                <iframe
                  title="VIP Numerology Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242119.28695716207!2d73.72305847246944!3d18.524564757498543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1699000000000!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                />
              </div>
              <div className="mt-6 bg-[#FFF8E1] rounded-2xl p-5">
                <h4 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>VIP Numerology HQ</h4>
                <p className="text-[#616161] text-sm leading-relaxed">123, Prosperity Plaza, Baner Road,<br />Near Westend Mall, Pune, Maharashtra 411045<br />GST: 27ABCDE1234F1Z5</p>
              </div>
            </div>

            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-[#212121] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Get in Touch</h2>
              <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
                {[['inquiry', 'General Inquiry'], ['booking', 'Book Now']].map(([v, l]) => (
                  <button key={v} onClick={() => setTab(v as 'inquiry' | 'booking')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === v ? 'bg-white text-[#D32F2F] shadow-sm' : 'text-[#616161]'}`}>
                    {l}
                  </button>
                ))}
              </div>

              {tab === 'booking' ? (
                <div className="text-center py-12 bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] rounded-2xl text-white">
                  <div className="text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Book Now</div>
                  <p className="text-red-100 mb-8 px-4">Ready to transform your life with the power of numbers?</p>
                  <button onClick={openBooking}
                    className="px-10 py-4 bg-[#FBC02D] text-black rounded-xl font-bold text-lg hover:bg-yellow-400 transition-colors"
                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Open Booking Form
                  </button>
                </div>
              ) : submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-green-700 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Message Sent!</h4>
                  <p className="text-green-600">Our team will get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-4 text-[#D32F2F] text-sm font-medium hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[['Full Name', 'name', 'text'], ['Mobile Number', 'mobile', 'tel'], ['Email Address', 'email', 'email']].map(([label, key, type]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-[#212121] mb-1.5">{label}</label>
                      <input type={type} required value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
                        placeholder={`Enter your ${(label as string).toLowerCase()}`} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-[#212121] mb-1.5">Message</label>
                    <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors resize-none"
                      placeholder="Tell us how we can help you..." />
                  </div>
                  <button type="submit"
                    className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors"
                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <Send size={15} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
