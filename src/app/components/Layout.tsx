import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Send, Hash } from 'lucide-react';
import BookingModal from './BookingModal';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Events & Gallery', path: '/events-gallery' },
  { label: 'Contact Us', path: '/contact' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] flex items-center justify-center shadow-sm">
                <Hash size={18} className="text-white" />
              </div>
              <div>
                <div className="text-[#D32F2F] font-bold text-base leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>VIP Numerology</div>
                <div className="text-[#616161] text-xs leading-tight hidden sm:block">Unlock Success Through Powerful Numbers</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive(link.path)
                      ? 'text-[#D32F2F] bg-red-50'
                      : 'text-[#212121] hover:text-[#D32F2F] hover:bg-red-50'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setBookingOpen(true)}
                className="px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm hover:bg-[#B71C1C] transition-colors shadow-sm"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Book Now
              </button>
            </div>

            {/* Mobile */}
            <button className="lg:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path) ? 'text-[#D32F2F] bg-red-50' : 'text-[#212121] hover:text-[#D32F2F]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setBookingOpen(true); setMobileOpen(false); }}
              className="w-full mt-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm"
            >
              Book Now
            </button>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet context={{ openBooking: () => setBookingOpen(true) }} />
      </main>

      {/* Footer */}
      <footer className="bg-[#212121] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#D32F2F] flex items-center justify-center">
                  <Hash size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>VIP Numerology</div>
                  <div className="text-gray-400 text-xs">Unlock Success Through Powerful Numbers</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                India's premier numerology consultancy, helping thousands discover the power of numbers to transform their lives, businesses, and relationships.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2"><Phone size={13} className="text-[#FBC02D]" /><span>+91 98765 43210</span></div>
                <div className="flex items-center gap-2"><Mail size={13} className="text-[#FBC02D]" /><span>support@vipnumerology.com</span></div>
                <div className="flex items-center gap-2"><MapPin size={13} className="text-[#FBC02D]" /><span>Pune, Maharashtra, India</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {navLinks.map(l => (
                  <li key={l.path}><Link to={l.path} className="hover:text-[#FBC02D] transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {['VIP Number Booking', 'Mobile Numerology', 'Business Numerology', 'Name Correction', 'Consultation', 'Premium Suggestions'].map(s => (
                  <li key={s}><Link to="/services" className="hover:text-[#FBC02D] transition-colors">{s}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">Subscribe for numerology insights & exclusive offers.</p>
              <div className="flex gap-2 mb-5">
                <input type="email" placeholder="Your email" className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FBC02D]" />
                <button className="p-2 bg-[#D32F2F] rounded-lg hover:bg-[#B71C1C] transition-colors"><Send size={15} /></button>
              </div>
              <div className="flex gap-3">
                {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#D32F2F] transition-colors">
                    <Icon size={13} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2024 VIP Numerology. All rights reserved. | GST: 27ABCDE1234F1Z5</p>
            <Link to="/admin/login" className="px-4 py-2 border border-[#D32F2F] text-[#D32F2F] rounded-xl text-sm font-medium hover:bg-[#D32F2F] hover:text-white transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} />}
    </div>
  );
}
