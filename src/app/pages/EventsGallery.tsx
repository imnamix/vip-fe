import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, X, CheckCircle, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import BannerCarousel from '../components/BannerCarousel';

const bannerSlides = [
  { img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1440&h=400&fit=crop', title: 'Events & Gallery', subtitle: 'Upcoming workshops, expos, and our visual showcase.' },
  { img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1440&h=400&fit=crop', title: 'Join Our Events', subtitle: 'Live masterclasses, seminars, and VIP number expos across India.' },
  { img: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1440&h=400&fit=crop', title: 'Our Visual Story', subtitle: 'Explore moments from our events, deliveries, and client journeys.' },
];

const events = [
  { id: 1, title: 'Numerology Masterclass 2024', date: 'Aug 15, 2024', time: '10:00 AM – 5:00 PM', venue: 'The Westin, Pune', fee: '₹4,999', available: 47, img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=350&fit=crop', badge: 'Upcoming', badgeColor: 'bg-green-500', desc: 'A full-day intensive masterclass covering Vedic numerology fundamentals, VIP number selection, business applications, and live case studies. Taught by Dr. Arjun Sharma.', schedule: [{ time: '10:00 AM', title: 'Registration & Welcome' }, { time: '10:30 AM', title: 'Foundations of Vedic Numerology' }, { time: '12:00 PM', title: 'Personal Number Analysis Workshop' }, { time: '1:00 PM', title: 'Lunch Break' }, { time: '2:00 PM', title: 'Business Numerology Deep Dive' }, { time: '4:30 PM', title: 'Q&A and Networking' }, { time: '5:00 PM', title: 'Certificate Distribution' }], gallery: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=200&fit=crop'] },
  { id: 2, title: 'VIP Number Expo 2024', date: 'Sep 7–8, 2024', time: '9:00 AM – 8:00 PM', venue: 'Bombay Exhibition Centre, Mumbai', fee: 'Free Entry', available: 1240, img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=350&fit=crop', badge: 'Free', badgeColor: 'bg-[#FBC02D] text-black', desc: "India's largest VIP number exhibition featuring 50+ exhibitors, live demonstrations, expert panel discussions, and exclusive number auctions.", schedule: [{ time: '9:00 AM', title: 'Expo Opens' }, { time: '10:00 AM', title: 'Expert Panel: Power of Numbers in Business' }, { time: '12:00 PM', title: 'VIP Number Auction (Day 1)' }, { time: '3:00 PM', title: 'Numerology Workshop for Beginners' }, { time: '6:00 PM', title: 'Evening Networking Gala' }], gallery: ['https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop'] },
  { id: 3, title: 'Spiritual Growth Seminar', date: 'Sep 22, 2024', time: '6:00 PM – 9:00 PM', venue: 'Taj Vivanta, Bangalore', fee: '₹2,499', available: 32, img: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=600&h=350&fit=crop', badge: 'Limited', badgeColor: 'bg-[#D32F2F]', desc: 'An evening of spiritual awakening, guided meditation, and numerological insight. Connect with like-minded individuals on a journey of self-discovery and inner transformation.', schedule: [{ time: '6:00 PM', title: 'Welcome & Registration' }, { time: '6:30 PM', title: 'Guided Chakra Meditation' }, { time: '7:15 PM', title: 'Talk: Numbers & Spiritual Awakening' }, { time: '8:00 PM', title: 'Personal Reading Sessions' }, { time: '9:00 PM', title: 'Closing & Networking' }], gallery: ['https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop'] },
  { id: 4, title: 'Business Numerology Workshop', date: 'Oct 5, 2024', time: '10:00 AM – 4:00 PM', venue: 'Hilton, Hyderabad', fee: '₹8,999', available: 18, img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=350&fit=crop', badge: 'Premium', badgeColor: 'bg-purple-500', desc: 'An exclusive half-day workshop for entrepreneurs, CEOs, and business leaders. Learn how to apply numerology to make better business decisions, hire the right team, and maximise profitability.', schedule: [{ time: '10:00 AM', title: 'Welcome & Breakfast Networking' }, { time: '10:30 AM', title: 'Business Numerology Framework' }, { time: '12:00 PM', title: 'Live Business Analysis Session' }, { time: '1:00 PM', title: 'Networking Lunch' }, { time: '2:00 PM', title: 'HR and Team Building Through Numbers' }, { time: '4:00 PM', title: 'Closing' }], gallery: ['https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&h=200&fit=crop'] },
];

type GalleryCategory = 'All' | 'Events' | 'Testimonials' | 'VIP Deliveries' | 'Consultations';

const images = [
  { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=350&fit=crop', category: 'Events' as const, alt: 'Numerology Masterclass 2023' },
  { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&h=700&fit=crop', category: 'Events' as const, alt: 'VIP Number Expo Mumbai' },
  { src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=400&fit=crop', category: 'Consultations' as const, alt: 'Personal Consultation Session' },
  { src: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&h=300&fit=crop', category: 'Consultations' as const, alt: 'Business Numerology Consultation' },
  { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=500&fit=crop', category: 'VIP Deliveries' as const, alt: 'Premium SIM Delivery Package' },
  { src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=400&fit=crop', category: 'VIP Deliveries' as const, alt: 'VIP 9999 Number Delivery' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop', category: 'Testimonials' as const, alt: 'Client Rajesh Success Story' },
  { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=400&fit=crop', category: 'Testimonials' as const, alt: 'Client Priya Testimonial' },
  { src: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=500&h=350&fit=crop', category: 'Events' as const, alt: 'Spiritual Growth Seminar' },
  { src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=450&fit=crop', category: 'Events' as const, alt: 'Business Workshop Hyderabad' },
  { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop', category: 'Testimonials' as const, alt: 'Client Meena Success' },
  { src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=350&fit=crop', category: 'VIP Deliveries' as const, alt: 'Corporate Package Delivery' },
];

const videos = [
  { thumb: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=240&fit=crop', title: 'How 8888 Changed My Business', name: 'Arjun Kapoor', duration: '4:32' },
  { thumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=240&fit=crop', title: 'Name Correction Transformation', name: 'Priya Sharma', duration: '3:15' },
  { thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=240&fit=crop', title: 'VIP Number Success Story', name: 'Rajesh Patel', duration: '5:47' },
  { thumb: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=240&fit=crop', title: "Child's Academic Success", name: 'Meena Iyer', duration: '2:58' },
];

const galleryCategories: GalleryCategory[] = ['All', 'Events', 'Testimonials', 'VIP Deliveries', 'Consultations'];

export default function EventsGallery() {
  const [mainTab, setMainTab] = useState<'Events' | 'Gallery'>('Events');
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registered, setRegistered] = useState<number[]>([]);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '' });
  const [galleryTab, setGalleryTab] = useState<'Images' | 'Videos'>('Images');
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategory>('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filteredImages = galleryCategory === 'All' ? images : images.filter(i => i.category === galleryCategory);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) setRegistered(p => [...p, selectedEvent.id]);
    setShowRegisterForm(false);
  };

  return (
    <div>
      <BannerCarousel slides={bannerSlides} pageName="Events & Gallery" breadcrumb="Events & Gallery" />

      {/* Main Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[64px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {(['Events', 'Gallery'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMainTab(tab)}
                className={`px-8 py-4 font-semibold text-sm border-b-2 transition-colors ${mainTab === tab ? 'border-[#D32F2F] text-[#D32F2F]' : 'border-transparent text-[#616161] hover:text-[#212121]'}`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ EVENTS TAB ═══════ */}
      {mainTab === 'Events' && !selectedEvent && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Join Us</div>
              <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Upcoming Events</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {events.map(event => (
                <div key={event.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <div className="relative h-52 overflow-hidden">
                    <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className={`absolute top-4 left-4 ${event.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>{event.badge}</div>
                    {registered.includes(event.id) && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle size={11} /> Registered
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#212121] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{event.title}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#616161]"><Calendar size={13} className="text-[#D32F2F]" />{event.date}</div>
                      <div className="flex items-center gap-2 text-sm text-[#616161]"><Clock size={13} className="text-[#D32F2F]" />{event.time}</div>
                      <div className="flex items-center gap-2 text-sm text-[#616161]"><MapPin size={13} className="text-[#D32F2F]" />{event.venue}</div>
                      <div className="flex items-center gap-2 text-sm text-[#616161]"><Users size={13} className="text-[#D32F2F]" />{event.available} seats left</div>
                    </div>
                    <p className="text-[#616161] text-sm leading-relaxed mb-4 line-clamp-2">{event.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#D32F2F] font-bold">{event.fee}</span>
                      <span className="text-[#D32F2F] text-sm font-semibold">View Details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ EVENT DETAIL PAGE ═══════ */}
      {mainTab === 'Events' && selectedEvent && (
        <section className="py-12 bg-white min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back */}
            <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-[#D32F2F] font-medium mb-6 hover:underline">
              <ChevronLeft size={16} /> Back to Events
            </button>

            {/* Hero */}
            <div className="relative h-64 rounded-2xl overflow-hidden mb-8">
              <img src={selectedEvent.img} alt={selectedEvent.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className={`absolute top-4 left-4 ${selectedEvent.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>{selectedEvent.badge}</div>
              <div className="absolute bottom-6 left-6">
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{selectedEvent.title}</h1>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-[#FFF8E1] rounded-2xl p-5">
              {[
                [<Calendar size={15} />, 'Date', selectedEvent.date],
                [<Clock size={15} />, 'Time', selectedEvent.time],
                [<MapPin size={15} />, 'Venue', selectedEvent.venue],
                [<Users size={15} />, 'Seats Left', `${selectedEvent.available} available`],
              ].map(([icon, label, value], i) => (
                <div key={i} className="text-center">
                  <div className="flex justify-center text-[#D32F2F] mb-1">{icon as React.ReactNode}</div>
                  <div className="text-xs text-[#616161] mb-0.5">{label as string}</div>
                  <div className="font-semibold text-[#212121] text-sm">{value as string}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>About This Event</h2>
              <p className="text-[#616161] leading-relaxed">{selectedEvent.desc}</p>
            </div>

            {/* Schedule Timeline */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#212121] mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Schedule</h2>
              <div className="space-y-4">
                {selectedEvent.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="text-[#D32F2F] font-bold text-sm w-24 flex-shrink-0">{s.time}</div>
                    <div className="relative flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-[#D32F2F]" />
                      {i < selectedEvent.schedule.length - 1 && <div className="absolute top-3 left-1.5 w-0.5 h-8 bg-gray-200" />}
                    </div>
                    <div className="bg-[#FFF8E1] rounded-xl px-4 py-2.5 flex-1">
                      <span className="text-sm font-medium text-[#212121]">{s.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Event Gallery</h2>
              <div className="flex gap-4">
                {selectedEvent.gallery.map((img, i) => (
                  <img key={i} src={img} alt="" className="flex-1 rounded-2xl h-40 object-cover" />
                ))}
              </div>
            </div>

            {/* Register Button */}
            <div className="text-center">
              {registered.includes(selectedEvent.id) ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 inline-block">
                  <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-green-700">You're Registered!</div>
                  <div className="text-green-600 text-sm mt-1">Confirmation sent to your email & WhatsApp.</div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="px-12 py-4 bg-[#D32F2F] text-white rounded-xl font-bold text-lg hover:bg-[#B71C1C] transition-colors shadow-lg"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Register Now — {selectedEvent.fee}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ GALLERY TAB ═══════ */}
      {mainTab === 'Gallery' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Sub tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {(['Images', 'Videos'] as const).map(t => (
                <button key={t} onClick={() => setGalleryTab(t)}
                  className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px ${galleryTab === t ? 'border-[#D32F2F] text-[#D32F2F]' : 'border-transparent text-[#616161]'}`}>
                  {t}
                </button>
              ))}
            </div>

            {galleryTab === 'Images' && (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  {galleryCategories.map(c => (
                    <button key={c} onClick={() => setGalleryCategory(c)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${galleryCategory === c ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}>
                  <Masonry gutter="14px">
                    {filteredImages.map((img, i) => (
                      <div key={img.src} className="rounded-xl overflow-hidden cursor-pointer group relative" onClick={() => setLightbox(i)}>
                        <img src={img.src} alt={img.alt} className="w-full block group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
              </>
            )}

            {galleryTab === 'Videos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      )}

      {/* ═══════ LIGHTBOX ═══════ */}
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center" onClick={e => { e.stopPropagation(); setLightbox(l => ((l! - 1 + filteredImages.length) % filteredImages.length)); }}>
            <ChevronLeft size={20} />
          </button>
          <div className="max-w-4xl max-h-full px-16" onClick={e => e.stopPropagation()}>
            <img src={filteredImages[lightbox].src} alt={filteredImages[lightbox].alt} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            <div className="text-center mt-4">
              <div className="text-white font-medium">{filteredImages[lightbox].alt}</div>
              <div className="text-[#FBC02D] text-sm">{filteredImages[lightbox].category}</div>
            </div>
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center" onClick={e => { e.stopPropagation(); setLightbox(l => ((l! + 1) % filteredImages.length)); }}>
            <ChevronRight size={20} />
          </button>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center" onClick={() => setLightbox(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* ═══════ REGISTER POPUP ═══════ */}
      {showRegisterForm && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setShowRegisterForm(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-[#212121] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Register for Event</h3>
                <p className="text-[#D32F2F] text-sm font-medium">{selectedEvent.title}</p>
              </div>
              <button onClick={() => setShowRegisterForm(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={15} />
              </button>
            </div>

            <div className="bg-[#FFF8E1] rounded-xl p-4 mb-5 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[#616161] text-xs">Date</span><div className="font-medium text-[#212121]">{selectedEvent.date}</div></div>
              <div><span className="text-[#616161] text-xs">Fee</span><div className="font-bold text-[#D32F2F]">{selectedEvent.fee}</div></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Mobile Number', 'phone', 'tel']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-[#212121] mb-1">{label}</label>
                  <input type={type} required value={regForm[key as keyof typeof regForm]} onChange={e => setRegForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50" />
                </div>
              ))}
              <button type="submit" className="w-full py-3 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Confirm Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
