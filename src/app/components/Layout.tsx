import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter, Linkedin, Send } from 'lucide-react';
import BookingModal from './BookingModal';
import { fetchBrandInfo } from '../store/slice/BrandInfoSlice';
import { fetchContact } from '../store/slice/ContactSlice';
import type { RootState, AppDispatch } from '../store/Store';
import type { Address, SocialLinks } from '../store/slice/ContactSlice';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Events & Gallery', path: '/events-gallery' },
  { label: 'Contact Us', path: '/contact' },
];

const quickLinks = [
  ...navLinks,
  { label: 'Admin', path: '/admin/login' },
];

const socialConfig: { key: keyof SocialLinks; Icon: React.ElementType }[] = [
  { key: 'facebook', Icon: Facebook },
  { key: 'instagram', Icon: Instagram },
  { key: 'youtube', Icon: Youtube },
  { key: 'x', Icon: Twitter },
  { key: 'linkedin', Icon: Linkedin },
];

function formatAddress(addr: Address): string {
  const parts = [
    addr.officeNumber,
    addr.building,
    addr.landmark,
    addr.street,
    addr.city,
    addr.state && addr.pincode ? `${addr.state} – ${addr.pincode}` : addr.state || addr.pincode,
    addr.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export default function Layout() {
  const dispatch = useDispatch<AppDispatch>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const location = useLocation();

  const { data: brand, initialized: brandInit } = useSelector((state: RootState) => state.brandInfo);
  const { data: contact, initialized: contactInit } = useSelector((state: RootState) => state.contact);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!brandInit) dispatch(fetchBrandInfo());
  }, [dispatch, brandInit]);

  useEffect(() => {
    if (!contactInit) dispatch(fetchContact());
  }, [dispatch, contactInit]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const activeSocialLinks = socialConfig.filter(({ key }) => contact.socialLinks[key]);
  const addressText = formatAddress(contact.address);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo from Redux */}
            <Link to="/" className="flex items-center flex-shrink-0">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.companyName || 'Logo'} className="h-12 w-auto object-contain" />
              ) : (
                <span className="text-[#D32F2F] font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {brand.companyName || 'VIP Numerology'}
                </span>
              )}
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

            {/* Mobile toggle */}
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

            {/* Brand + Contact Info */}
            <div className="lg:col-span-2">
              <div className="mb-5">
                {brand?.logo ? (
                  <img src={brand?.logo} alt={brand.companyName || 'Logo'} className="h-12 w-auto object-contain" />
                ) : (
                  <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {brand.companyName || 'VIP Numerology'}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                India's premier numerology consultancy, helping thousands discover the power of numbers to transform their lives, businesses, and relationships.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                {contact.contactNumber && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#FBC02D] flex-shrink-0" />
                    <span>{contact.contactNumber}</span>
                  </div>
                )}
                {contact.officeEmail && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-[#FBC02D] flex-shrink-0" />
                    <span>{contact.officeEmail}</span>
                  </div>
                )}
                {addressText && (
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-[#FBC02D] flex-shrink-0 mt-0.5" />
                    <span>{addressText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {quickLinks.map(l => (
                  <li key={l.path}>
                    <Link to={l.path} className="hover:text-[#FBC02D] transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {['VIP Number Booking', 'Mobile Numerology', 'Business Numerology', 'Name Correction', 'Consultation', 'Premium Suggestions'].map(s => (
                  <li key={s}><Link to="/services" className="hover:text-[#FBC02D] transition-colors">{s}</Link></li>
                ))}
              </ul>
            </div>

            {/* Newsletter + Social */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Social Links</h4>
              <p className="text-gray-400 text-sm mb-4">Subscribe for numerology insights & exclusive offers.</p>
              {/* <div className="flex gap-2 mb-5">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FBC02D]"
                />
                <button className="p-2 bg-[#D32F2F] rounded-lg hover:bg-[#B71C1C] transition-colors"><Send size={15} /></button>
              </div> */}
              {activeSocialLinks.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {activeSocialLinks.map(({ key, Icon }) => (
                    <a
                      key={key}
                      href={contact.socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#D32F2F] transition-colors"
                    >
                      <Icon size={13} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 VIP Numerology. All rights reserved.</p>
            <p className="text-gray-500 text-sm">
              Design by{' '}
              <a
                href="https://infeonit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:underline transition-all"
              >
                Infeon IT Services
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} />}
    </div>
  );
}
