import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { useSelector } from 'react-redux';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel';
import { createGeneralInquiry } from '../services/GeneralInquiryService';
import type { RootState } from '../store/Store';
import type { Address } from '../store/slice/ContactSlice';

interface OutletCtx { openBooking: () => void }

const fallbackSlides = [
  { img: '', title: 'Contact Us', subtitle: "We'd love to hear from you. Reach out anytime." },
];

function formatAddress(addr: Address): string[] {
  const line1 = [addr.officeNumber, addr.building, addr.landmark].filter(Boolean).join(', ');
  const line2 = [addr.street, addr.city].filter(Boolean).join(', ');
  const line3 = [addr.state, addr.pincode].filter(Boolean).join(' – ');
  const line4 = addr.country;
  return [line1, line2, line3, line4].filter(Boolean);
}

// Convert any Google Maps share/view URL to an embeddable src.
// Falls back to an address-based search embed when the URL can't be parsed.
function toEmbedUrl(url: string, fallbackAddress?: string): string {
  const searchEmbed = (q: string) =>
    `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

  if (url) {
    // Already a proper embed URL
    if (url.includes('/maps/embed')) return url;

    // Contains @lat,lng — most Google Maps share links have this
    const coord = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coord) return searchEmbed(`${coord[1]},${coord[2]}`);

    // Contains explicit ?q= param
    const q = url.match(/[?&]q=([^&]+)/);
    if (q) return `https://maps.google.com/maps?q=${q[1]}&output=embed`;

    // Contains /place/Name in the path
    const place = url.match(/\/place\/([^/@?]+)/);
    if (place) return searchEmbed(decodeURIComponent(place[1].replace(/\+/g, ' ')));

    // Any other google.com/maps URL — try appending output=embed directly
    if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
      return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
    }
    // Short URLs (goo.gl / maps.app.goo.gl) can't be resolved in-browser — fall through
  }

  // Last resort: embed a search for the saved address
  if (fallbackAddress) return searchEmbed(fallbackAddress);

  return '';
}

export default function Contact() {
  const [tab, setTab] = useState<'inquiry' | 'booking'>('inquiry');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', message: '' });
  const { openBooking } = useOutletContext<OutletCtx>();

  const contact = useSelector((state: RootState) => state.contact.data);

  const bannerSlides = contact.slides.length > 0 && contact.slides.some(s => s.image)
    ? contact.slides.filter(s => s.image).map(s => ({ img: s.image, title: s.title, subtitle: s.description }))
    : fallbackSlides;

  const addressLines = formatAddress(contact.address);
  const addressString = addressLines.join(', ');
  const embedUrl = toEmbedUrl(contact.googleMapLink, addressString || undefined);

  const cards = [
    {
      icon: Phone, title: 'Call Us', color: '#D32F2F', bg: '#FFF8E1',
      lines: [contact.contactNumber, contact.whatsappNumber].filter(Boolean),
    },
    {
      icon: Mail, title: 'Email Us', color: '#FBC02D', bg: '#FFFDE7',
      lines: [contact.officeEmail, contact.alternateOfficeEmail].filter(Boolean),
    },
    {
      icon: MapPin, title: 'Visit Us', color: '#4CAF50', bg: '#E8F5E9',
      lines: addressLines.slice(0, 2),
    },
    {
      icon: Clock, title: 'Working Hours', color: '#9C27B0', bg: '#F3E5F5',
      lines: contact.workingHours ? contact.workingHours.split('\n').filter(Boolean) : [],
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createGeneralInquiry({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        message: form.message.trim() || undefined,
        lookingFor: 'General Contact Inquiry',
      });
      setSubmitted(true);
      setForm({ name: '', mobile: '', email: '', message: '' });
    } catch {
      // keep form open so user can retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <BannerCarousel slides={bannerSlides} pageName="Contact Us" breadcrumb="Contact Us" />

      {/* Contact Cards */}
      <section className="py-16 bg-[#FFF8E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map(({ icon: Icon, title, color, bg, lines }) => (
              <div key={title} className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: bg }}>
                  <Icon size={26} style={{ color }} />
                </div>
                <h3 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
                {lines.length > 0
                  ? lines.map((l, i) => <p key={i} className="text-[#616161] text-sm">{l}</p>)
                  : <p className="text-[#9E9E9E] text-sm italic">Not available</p>
                }
              </div>
            ))}
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
                {embedUrl ? (
                  <iframe
                    title="Location Map"
                    src={embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9E9E9E] text-sm">
                    <MapPin size={24} className="mr-2 text-gray-300" /> Map not available
                  </div>
                )}
              </div>

              {/* Address details box */}
              {(addressLines.length > 0 || contact.gstNumber) && (
                <div className="mt-6 bg-[#FFF8E1] rounded-2xl p-5">
                  <h4 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {contact.address.building || 'Our Office'}
                  </h4>
                  <p className="text-[#616161] text-sm leading-relaxed">
                    {addressLines.join(', ')}
                  </p>
                  {contact.gstNumber && (
                    <p className="text-[#9E9E9E] text-xs mt-2">GST: {contact.gstNumber}</p>
                  )}
                </div>
              )}
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
                  {[['Full Name', 'name', 'text'], ['Mobile Number', 'mobile', 'tel']].map(([label, key, type]) => (
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
                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <Send size={15} /> {submitting ? 'Sending…' : 'Send Message'}
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
