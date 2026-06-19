import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, MapPin, Users, IndianRupee, ChevronRight, Clock, X, CheckCircle } from 'lucide-react';

const events = [
  {
    id: 1,
    title: 'Numerology Masterclass 2024',
    date: 'Aug 15, 2024',
    time: '10:00 AM – 5:00 PM',
    venue: 'The Westin, Pune',
    fee: '₹4,999',
    seats: '200 seats',
    available: 47,
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=350&fit=crop',
    desc: 'A full-day intensive masterclass covering Vedic numerology fundamentals, VIP number selection, business applications, and live case studies. Taught by Dr. Arjun Sharma.',
    schedule: [
      { time: '10:00 AM', title: 'Registration & Welcome' },
      { time: '10:30 AM', title: 'Foundations of Vedic Numerology' },
      { time: '12:00 PM', title: 'Personal Number Analysis Workshop' },
      { time: '1:00 PM', title: 'Lunch Break' },
      { time: '2:00 PM', title: 'Business Numerology Deep Dive' },
      { time: '3:30 PM', title: 'VIP Number Selection Live Demo' },
      { time: '4:30 PM', title: 'Q&A and Networking' },
      { time: '5:00 PM', title: 'Certificate Distribution' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=300&h=200&fit=crop',
    ],
    badge: 'Upcoming',
    badgeColor: 'bg-green-500',
  },
  {
    id: 2,
    title: 'VIP Number Expo 2024',
    date: 'Sep 7–8, 2024',
    time: '9:00 AM – 8:00 PM',
    venue: 'Bombay Exhibition Centre, Mumbai',
    fee: 'Free Entry',
    seats: '5,000 seats',
    available: 1240,
    img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=350&fit=crop',
    desc: 'India\'s largest VIP number exhibition featuring 50+ exhibitors, live demonstrations, expert panel discussions, and exclusive number auctions. First come, first served.',
    schedule: [
      { time: '9:00 AM', title: 'Expo Opens' },
      { time: '10:00 AM', title: 'Expert Panel: Power of Numbers in Business' },
      { time: '12:00 PM', title: 'VIP Number Auction (Day 1)' },
      { time: '3:00 PM', title: 'Numerology Workshop for Beginners' },
      { time: '6:00 PM', title: 'Evening Networking Gala' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
    ],
    badge: 'Free',
    badgeColor: 'bg-[#FBC02D]',
  },
  {
    id: 3,
    title: 'Spiritual Growth Seminar',
    date: 'Sep 22, 2024',
    time: '6:00 PM – 9:00 PM',
    venue: 'Taj Vivanta, Bangalore',
    fee: '₹2,499',
    seats: '150 seats',
    available: 32,
    img: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=600&h=350&fit=crop',
    desc: 'An evening of spiritual awakening, guided meditation, and numerological insight. Connect with like-minded individuals on a journey of self-discovery and inner transformation.',
    schedule: [
      { time: '6:00 PM', title: 'Welcome & Registration' },
      { time: '6:30 PM', title: 'Guided Chakra Meditation' },
      { time: '7:15 PM', title: 'Talk: Numbers & Spiritual Awakening' },
      { time: '8:00 PM', title: 'Personal Reading Sessions' },
      { time: '9:00 PM', title: 'Closing & Networking' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop',
    ],
    badge: 'Limited',
    badgeColor: 'bg-[#D32F2F]',
  },
  {
    id: 4,
    title: 'Business Numerology Workshop',
    date: 'Oct 5, 2024',
    time: '10:00 AM – 4:00 PM',
    venue: 'Hilton, Hyderabad',
    fee: '₹8,999',
    seats: '80 seats',
    available: 18,
    img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=350&fit=crop',
    desc: 'An exclusive half-day workshop for entrepreneurs, CEOs, and business leaders. Learn how to apply numerology to make better business decisions, hire the right team, and maximise profitability.',
    schedule: [
      { time: '10:00 AM', title: 'Welcome & Breakfast Networking' },
      { time: '10:30 AM', title: 'Business Numerology Framework' },
      { time: '12:00 PM', title: 'Live Business Analysis Session' },
      { time: '1:00 PM', title: 'Networking Lunch' },
      { time: '2:00 PM', title: 'HR and Team Building Through Numbers' },
      { time: '3:30 PM', title: 'Individual Business Consultations' },
      { time: '4:00 PM', title: 'Closing' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&h=200&fit=crop',
    ],
    badge: 'Premium',
    badgeColor: 'bg-purple-500',
  },
];

export default function Events() {
  const [selected, setSelected] = useState<typeof events[0] | null>(null);
  const [registered, setRegistered] = useState<number[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      setRegistered(prev => [...prev, selected.id]);
    }
  };

  return (
    <div>
      {/* Banner Slider */}
      <section className="relative h-64 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1440&h=400&fit=crop" alt="Events" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#D32F2F]/90 to-black/60 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <span className="cursor-pointer hover:text-white" onClick={() => navigate('/')}>Home</span>
              <ChevronRight size={14} />
              <span className="text-white">Events</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Upcoming Events</h1>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D32F2F] font-semibold text-sm uppercase tracking-widest mb-3">Join Us</div>
            <h2 className="text-4xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Events & Workshops</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {events.map(event => (
              <div key={event.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                <div className="relative h-52 overflow-hidden">
                  <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className={`absolute top-4 left-4 ${event.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    {event.badge}
                  </div>
                  {registered.includes(event.id) && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={12} /> Registered
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#212121] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>{event.title}</h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#616161]">
                      <Calendar size={14} className="text-[#D32F2F]" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#616161]">
                      <Clock size={14} className="text-[#D32F2F]" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#616161]">
                      <MapPin size={14} className="text-[#D32F2F]" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#616161]">
                      <Users size={14} className="text-[#D32F2F]" />
                      <span>{event.available} seats left</span>
                    </div>
                  </div>

                  <p className="text-[#616161] text-sm leading-relaxed mb-4 line-clamp-2">{event.desc}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <IndianRupee size={14} className="text-[#D32F2F]" />
                      <span className="text-[#D32F2F] font-bold">{event.fee}</span>
                    </div>
                    <button
                      onClick={() => setSelected(event)}
                      className="px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8" onClick={e => e.stopPropagation()}>
            {/* Hero */}
            <div className="relative h-52 rounded-t-2xl overflow-hidden">
              <img src={selected.img} alt={selected.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 border border-white/30 text-white rounded-full flex items-center justify-center">
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-4">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{selected.title}</h2>
              </div>
            </div>

            <div className="p-6">
              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-6 bg-[#FFF8E1] rounded-xl p-4">
                {[
                  [<Calendar size={14} />, selected.date],
                  [<Clock size={14} />, selected.time],
                  [<MapPin size={14} />, selected.venue],
                  [<Users size={14} />, `${selected.available} seats available`],
                ].map(([icon, text], i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[#616161]">
                    <span className="text-[#D32F2F]">{icon}</span>
                    <span>{text as string}</span>
                  </div>
                ))}
              </div>

              <p className="text-[#616161] leading-relaxed mb-6">{selected.desc}</p>

              {/* Schedule */}
              <h4 className="font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Schedule</h4>
              <div className="space-y-3 mb-6">
                {selected.schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-xs font-semibold text-[#D32F2F] w-20 flex-shrink-0">{s.time}</div>
                    <div className="flex-1 h-px bg-gray-200" />
                    <div className="text-sm text-[#616161] w-48 text-right">{s.title}</div>
                  </div>
                ))}
              </div>

              {/* Gallery */}
              <div className="flex gap-3 mb-6">
                {selected.gallery.map((img, i) => (
                  <img key={i} src={img} alt="" className="flex-1 rounded-xl h-20 object-cover" />
                ))}
              </div>

              {/* Registration Form */}
              {registered.includes(selected.id) ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                  <h4 className="font-bold text-green-700 mb-1">Successfully Registered!</h4>
                  <p className="text-green-600 text-sm">Confirmation sent to your email & WhatsApp.</p>
                </div>
              ) : (
                <form onSubmit={handleRegister}>
                  <h4 className="font-bold text-[#212121] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Register Now — {selected.fee}</h4>
                  <div className="space-y-3 mb-4">
                    {[['Name', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel']].map(([label, key, type]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-[#212121] mb-1">{label}</label>
                        <input
                          type={type}
                          required
                          value={form[key as keyof typeof form]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                        />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors">
                    Register for {selected.fee}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
