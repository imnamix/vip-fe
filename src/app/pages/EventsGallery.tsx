import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, X, CheckCircle, Play, ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import BannerCarousel from '../components/BannerCarousel';
import { getAllEvents, getEventsByID } from '../services/EventsService';
import { getAllGalleryItems } from '../services/GalleryService';

const bannerSlides = [
  { img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1440&h=400&fit=crop', title: 'Events & Gallery', subtitle: 'Upcoming workshops, expos, and our visual showcase.' },
  { img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1440&h=400&fit=crop', title: 'Join Our Events', subtitle: 'Live masterclasses, seminars, and VIP number expos across India.' },
  { img: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=1440&h=400&fit=crop', title: 'Our Visual Story', subtitle: 'Explore moments from our events, deliveries, and client journeys.' },
];

interface MediaItem { media_url: string; media_type: string }
interface ScheduleItem { time: string; title: string }

interface EventListItem {
  id: number;
  title: string;
  eventDate: string;
  eventTime?: string;
  endTime?: string;
  location: string;
  seats?: number | null;
  fees?: string;
  eventStatus: string;
  mainImage?: MediaItem[] | null;
  description?: string;
}

interface EventDetail extends EventListItem {
  galleryImages?: MediaItem[] | null;
  schedules?: ScheduleItem[] | null;
}

interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  title: string;
  category: 'event' | 'numerologist' | 'testimonials' | 'others';
  url: string;
}

type GalleryFilter = 'All' | 'Events' | 'Numerologist' | 'Other';
const GALLERY_FILTERS: GalleryFilter[] = ['All', 'Events', 'Numerologist', 'Other'];

const STATUS_BADGE: Record<string, string> = {
  Upcoming: 'bg-green-500',
  Completed: 'bg-gray-500',
  Draft: 'bg-blue-400',
  Cancelled: 'bg-[#D32F2F]',
};

function formatDate(d: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return d; }
}

function formatTime(t: string) {
  if (!t) return '';
  try {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  } catch { return t; }
}

export default function EventsGallery() {
  const [mainTab, setMainTab] = useState<'Events' | 'Gallery'>('Events');

  // Events
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [registered, setRegistered] = useState<number[]>([]);
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '' });

  // Gallery
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    getAllEvents(1, 100)
      .then(res => setEvents(res?.data ?? []))
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, []);

  useEffect(() => {
    getAllGalleryItems(0, 1000)
      .then(res => setGalleryItems(res?.data ?? []))
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, []);

  const filteredGallery = galleryItems.filter(item => {
    if (galleryFilter === 'All') return true;
    if (galleryFilter === 'Events') return item.category === 'event';
    if (galleryFilter === 'Numerologist') return item.category === 'numerologist';
    return item.category === 'testimonials' || item.category === 'others';
  });

  const handleEventClick = async (listEvent: EventListItem) => {
    setSelectedEvent(listEvent as EventDetail);
    setDetailLoading(true);
    try {
      const res = await getEventsByID(listEvent.id);
      if (res?.success && res?.data) setSelectedEvent(res.data);
    } catch {}
    setDetailLoading(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) setRegistered(p => [...p, selectedEvent.id]);
    setShowRegister(false);
  };

  const formatFee = (fee) => {
    const numFee = Number(fee);

    if (fee === 0 || fee === "0") return "Free";

    if (!isNaN(numFee) && fee !== "") {
      return `₹ ${numFee}`;
    }

    return fee; // Show text as-is (e.g. "Contact Us", "Coming Soon")
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

      {/* ═══════ EVENTS LIST ═══════ */}
      {mainTab === 'Events' && !selectedEvent && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-[#D32F2F] font-semibold text-xs uppercase tracking-widest mb-3">Join Us</div>
              <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Upcoming Events</h2>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-20 gap-2 text-[#616161]">
                <Loader2 size={18} className="animate-spin" /> Loading events…
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#9E9E9E]">
                <Calendar size={36} className="opacity-30" />
                <p className="text-sm">No events found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {events.map(event => {
                  const imgUrl = event.mainImage?.[0]?.media_url ?? '';
                  const badgeClass = STATUS_BADGE[event.eventStatus] ?? 'bg-gray-400';
                  const timeRange = (() => {
                    const s = formatTime(event.eventTime ?? '');
                    const e = formatTime(event.endTime ?? '');
                    if (s && e) return `${s} – ${e}`;
                    return s || e || '';
                  })();
                  return (
                    <div
                      key={event.id}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="relative h-52 overflow-hidden bg-gray-100">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff size={32} className="text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div
                          className={`absolute top-4 left-4 ${badgeClass} text-white text-xs font-bold px-3 py-1 rounded-full`}
                        >
                          {event.eventStatus}
                        </div>
                        {registered.includes(event.id) && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={11} /> Registered
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3
                          className="text-xl font-bold text-[#212121] mb-3"
                          style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                          {event.title}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-[#616161]">
                            <Calendar size={13} className="text-[#D32F2F]" />
                            {formatDate(event.eventDate)}
                          </div>
                          {timeRange && (
                            <div className="flex items-center gap-2 text-sm text-[#616161]">
                              <Clock size={13} className="text-[#D32F2F]" />
                              {timeRange}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-[#616161]">
                              <MapPin size={13} className="text-[#D32F2F]" />
                              {event.location}
                            </div>
                          )}
                          {event.seats != null && (
                            <div className="flex items-center gap-2 text-sm text-[#616161]">
                              <Users size={13} className="text-[#D32F2F]" />
                              {event.seats} seats
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          {event.fees !== undefined && event.fees !== null && (
                            <span className="text-[#D32F2F] font-bold">
                              {formatFee(event.fees)}
                            </span>
                          )}
                          <span className="text-[#D32F2F] text-sm font-semibold ml-auto">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════ EVENT DETAIL ═══════ */}
      {mainTab === 'Events' && selectedEvent && (
        <section className="py-12 bg-white min-h-screen">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-[#D32F2F] font-medium mb-6 hover:underline">
              <ChevronLeft size={16} /> Back to Events
            </button>

            {detailLoading && (
              <div className="flex items-center justify-center py-10 gap-2 text-[#616161]">
                <Loader2 size={16} className="animate-spin" /> Loading details…
              </div>
            )}

            {/* Hero */}
            <div className="relative h-64 rounded-2xl overflow-hidden mb-8 bg-gray-100">
              {selectedEvent.mainImage?.[0]?.media_url ? (
                <img src={selectedEvent.mainImage[0].media_url} alt={selectedEvent.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff size={40} className="text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className={`absolute top-4 left-4 ${STATUS_BADGE[selectedEvent.eventStatus] ?? 'bg-gray-400'} text-white text-xs font-bold px-3 py-1 rounded-full`}>{selectedEvent.eventStatus}</div>
              <div className="absolute bottom-6 left-6">
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{selectedEvent.title}</h1>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-[#FFF8E1] rounded-2xl p-5">
              {[
                [<Calendar size={15} />, 'Date', formatDate(selectedEvent.eventDate)],
                [<Clock size={15} />, 'Time', (() => { const s = formatTime(selectedEvent.eventTime ?? ''); const e = formatTime(selectedEvent.endTime ?? ''); return (s && e) ? `${s} – ${e}` : s || e || '—'; })()],
                [<MapPin size={15} />, 'Venue', selectedEvent.location || '—'],
                [<Users size={15} />, 'Seats', selectedEvent.seats != null ? `${selectedEvent.seats} seats` : '—'],
              ].map(([icon, label, value], i) => (
                <div key={i} className="text-center">
                  <div className="flex justify-center text-[#D32F2F] mb-1">{icon as React.ReactNode}</div>
                  <div className="text-xs text-[#616161] mb-0.5">{label as string}</div>
                  <div className="font-semibold text-[#212121] text-sm">{value as string}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>About This Event</h2>
                <div className="text-[#616161] leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedEvent.description }} />
              </div>
            )}

            {/* Schedule */}
            {(selectedEvent.schedules ?? []).filter(s => s.time || s.title).length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#212121] mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>Schedule</h2>
                <div className="space-y-4">
                  {(selectedEvent.schedules ?? []).filter(s => s.time || s.title).map((s, i, arr) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="text-[#D32F2F] font-bold text-sm w-24 flex-shrink-0">{formatTime(s.time) || s.time}</div>
                      <div className="relative flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-[#D32F2F]" />
                        {i < arr.length - 1 && <div className="absolute top-3 left-1.5 w-0.5 h-8 bg-gray-200" />}
                      </div>
                      <div className="bg-[#FFF8E1] rounded-xl px-4 py-2.5 flex-1">
                        <span className="text-sm font-medium text-[#212121]">{s.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Gallery */}
            {(selectedEvent.galleryImages ?? []).filter(g => g.media_url).length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Event Gallery</h2>
                <div className="flex gap-4 flex-wrap">
                  {(selectedEvent.galleryImages ?? []).filter(g => g.media_url).map((g, i) => (
                    <img key={i} src={g.media_url} alt="" className="rounded-2xl h-40 object-cover flex-1 min-w-[140px]" />
                  ))}
                </div>
              </div>
            )}

            {/* Register */}
            <div className="text-center">
              {registered.includes(selectedEvent.id) ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 inline-block">
                  <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                  <div className="font-bold text-green-700">You're Registered!</div>
                  <div className="text-green-600 text-sm mt-1">Confirmation sent to your email & WhatsApp.</div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegister(true)}
                  className="px-12 py-4 bg-[#D32F2F] text-white rounded-xl font-bold text-lg hover:bg-[#B71C1C] transition-colors shadow-lg"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Register Now{selectedEvent.fees ? ` — ${selectedEvent.fees}` : ''}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ GALLERY TAB ═══════ */}
      {mainTab === 'Gallery' && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {GALLERY_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setGalleryFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${galleryFilter === f ? 'bg-[#D32F2F] text-white' : 'bg-gray-100 text-[#616161] hover:bg-gray-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {galleryLoading ? (
              <div className="flex items-center justify-center py-20 gap-2 text-[#616161]">
                <Loader2 size={18} className="animate-spin" /> Loading gallery…
              </div>
            ) : filteredGallery.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#9E9E9E]">
                <ImageOff size={36} className="opacity-40" />
                <p className="text-sm">No items found</p>
              </div>
            ) : (
              <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 640: 2, 900: 3, 1200: 4 }}>
                <Masonry gutter="14px">
                  {filteredGallery.map((item, i) => (
                    <div
                      key={item.id}
                      className="rounded-xl overflow-hidden cursor-pointer group relative"
                      onClick={() => setLightbox(i)}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video src={item.url} className="w-full block" muted playsInline preload="metadata" />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#D32F2F] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play size={18} className="text-white ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <img src={item.url} alt={item.title} className="w-full block group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 rounded-lg px-3 py-1.5">
                              <div className="text-xs font-medium text-[#212121]">{item.title}</div>
                              <div className="text-xs text-[#D32F2F] capitalize">{item.category}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            )}
          </div>
        </section>
      )}

      {/* ═══════ LIGHTBOX ═══════ */}
      {lightbox !== null && filteredGallery[lightbox] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center"
            onClick={e => { e.stopPropagation(); setLightbox(l => ((l! - 1 + filteredGallery.length) % filteredGallery.length)); }}
          >
            <ChevronLeft size={20} />
          </button>

          <div className="max-w-4xl max-h-full px-16" onClick={e => e.stopPropagation()}>
            {filteredGallery[lightbox].type === 'video' ? (
              <video
                src={filteredGallery[lightbox].url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-xl"
              />
            ) : (
              <img
                src={filteredGallery[lightbox].url}
                alt={filteredGallery[lightbox].title}
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            )}
            <div className="text-center mt-4">
              <div className="text-white font-medium">{filteredGallery[lightbox].title}</div>
              <div className="text-[#FBC02D] text-sm capitalize">{filteredGallery[lightbox].category}</div>
            </div>
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center"
            onClick={e => { e.stopPropagation(); setLightbox(l => ((l! + 1) % filteredGallery.length)); }}
          >
            <ChevronRight size={20} />
          </button>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center" onClick={() => setLightbox(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* ═══════ REGISTER POPUP ═══════ */}
      {showRegister && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={() => setShowRegister(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-[#212121] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Register for Event</h3>
                <p className="text-[#D32F2F] text-sm font-medium">{selectedEvent.title}</p>
              </div>
              <button onClick={() => setShowRegister(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                <X size={15} />
              </button>
            </div>

            <div className="bg-[#FFF8E1] rounded-xl p-4 mb-5 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[#616161] text-xs">Date</span><div className="font-medium text-[#212121]">{formatDate(selectedEvent.eventDate)}</div></div>
              <div><span className="text-[#616161] text-xs">Fee</span><div className="font-bold text-[#D32F2F]">{selectedEvent.fees || 'Free'}</div></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Mobile Number', 'phone', 'tel']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-[#212121] mb-1">{label}</label>
                  <input
                    type={type}
                    required
                    value={regForm[key as keyof typeof regForm]}
                    onChange={e => setRegForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50"
                  />
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
