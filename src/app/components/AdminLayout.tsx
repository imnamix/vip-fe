import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { AdminThemeContext } from '../context/AdminThemeContext';
import { clearAuth } from '../store/slice/PermissionSlice';
import { usePermission } from '../hooks/usePermission';
import type { AppDispatch, RootState } from '../store/Store';
import {
  LayoutDashboard, Users, MessageSquare, Calendar,
  FileText, Shield, Truck, Bell, Menu, Search,
  LogOut, ChevronDown, User, X, Sun, Moon, Hash, Settings, ExternalLink,
  Home, Info, Wrench, Image, Star, HelpCircle, Video, Phone,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard',         path: '/admin',                   icon: LayoutDashboard, module: 'Dashboard'        },
  { label: 'Inquiries',         path: '/admin/inquiries',         icon: MessageSquare,   module: 'Inquiry'          },
  { label: 'General Inquiries', path: '/admin/general-inquiries', icon: MessageSquare,   module: 'General Inquiry'  },
  { label: 'Events',            path: '/admin/events',            icon: Calendar,        module: 'Events'           },
  { label: 'Top VIP Numbers',   path: '/admin/vip-numbers',       icon: Hash,            module: 'Top VIP Numbers'  },
  { label: 'Content',           path: '/admin/content',           icon: FileText,        module: 'Content'     },
  { label: 'Roles',             path: '/admin/roles',             icon: Shield,          module: 'Roles'       },
  { label: 'Users',             path: '/admin/users',             icon: Users,           module: 'Users'       },
  { label: 'Delivery',          path: '/admin/delivery',          icon: Truck,           module: 'Delivery'    },
  { label: 'Settings',          path: '/admin/settings',          icon: Settings,        module: 'Settings'    },
];

const SEARCH_MODULES = [
  /* ── Top-level Modules ── */
  { label: 'Dashboard',         path: '/admin',                              desc: 'Overview & analytics',                icon: LayoutDashboard, kw: ['home', 'overview', 'stats', 'analytics'],                     group: 'Modules'  },
  { label: 'Inquiries',         path: '/admin/inquiries',                   desc: 'Customer & lead management',          icon: MessageSquare,   kw: ['leads', 'customers', 'orders', 'bookings', 'inquiry'],         group: 'Modules'  },
  { label: 'General Inquiries', path: '/admin/general-inquiries',           desc: 'Contact form submissions',            icon: MessageSquare,   kw: ['contact', 'general', 'form', 'messages'],                     group: 'Modules'  },
  { label: 'Events',            path: '/admin/events',                      desc: 'Events & seminars management',        icon: Calendar,        kw: ['seminars', 'workshops', 'calendar'],                           group: 'Modules'  },
  { label: 'Top VIP Numbers',   path: '/admin/vip-numbers',                 desc: 'Manage premium VIP numbers',          icon: Hash,            kw: ['vip', 'phone', 'mobile', 'numbers', 'premium'],               group: 'Modules'  },
  { label: 'Content',           path: '/admin/content',                     desc: 'Website content management',          icon: FileText,        kw: ['homepage', 'pages', 'cms', 'text', 'website'],                group: 'Modules'  },
  { label: 'Roles',             path: '/admin/roles',                       desc: 'User roles & permissions',            icon: Shield,          kw: ['permissions', 'access', 'admin'],                             group: 'Modules'  },
  { label: 'Users',             path: '/admin/users',                       desc: 'Admin user management',               icon: Users,           kw: ['staff', 'team', 'employees', 'admins'],                       group: 'Modules'  },
  { label: 'Delivery',          path: '/admin/delivery',                    desc: 'SIM card delivery tracking',          icon: Truck,           kw: ['shipping', 'tracking', 'dispatch', 'sim'],                    group: 'Modules'  },
  { label: 'Settings',          path: '/admin/settings',                    desc: 'System configuration',                icon: Settings,        kw: ['config', 'system', 'preferences', 'setup'],                   group: 'Modules'  },
  { label: 'Notifications',     path: '/admin/notifications',               desc: 'Alerts & notifications',              icon: Bell,            kw: ['alerts', 'messages', 'push', 'notify'],                       group: 'Modules'  },
  { label: 'Profile',           path: '/admin/profile',                     desc: 'Your admin profile & account',        icon: User,            kw: ['account', 'me', 'personal', 'picture', 'password'],          group: 'Modules'  },

  /* ── Content Sections ── */
  { label: 'Brand Info',        path: '/admin/content?tab=brand',           desc: 'Brand name, logo & tagline',          icon: Info,            kw: ['brand', 'logo', 'name', 'tagline', 'identity'],               group: 'Content'  },
  { label: 'Homepage',          path: '/admin/content?tab=homepage',        desc: 'Hero section & homepage banners',     icon: Home,            kw: ['hero', 'banner', 'landing', 'home', 'slider'],                group: 'Content'  },
  { label: 'About Us',          path: '/admin/content?tab=about',           desc: 'Company story & team section',        icon: Info,            kw: ['about', 'story', 'team', 'mission', 'vision'],                group: 'Content'  },
  { label: 'Services',          path: '/admin/content?tab=services',        desc: 'Services offered by the business',    icon: Wrench,          kw: ['service', 'offerings', 'products', 'features'],               group: 'Content'  },
  { label: 'Gallery',           path: '/admin/content?tab=gallery',         desc: 'Photo & media gallery',               icon: Image,           kw: ['photos', 'images', 'media', 'pictures'],                      group: 'Content'  },
  { label: 'Reviews',           path: '/admin/content?tab=testimonials',    desc: 'Customer testimonials & reviews',     icon: Star,            kw: ['testimonials', 'feedback', 'rating', 'customers'],            group: 'Content'  },
  { label: 'Video Reviews',     path: '/admin/content?tab=video-testimonials', desc: 'Video testimonials from clients',  icon: Video,           kw: ['video', 'testimonials', 'youtube', 'reel', 'watch'],          group: 'Content'  },
  { label: 'FAQs',              path: '/admin/content?tab=faqs',            desc: 'Frequently asked questions',          icon: HelpCircle,      kw: ['faq', 'questions', 'answers', 'help', 'support'],             group: 'Content'  },
  { label: 'Contact',           path: '/admin/content?tab=contact',         desc: 'Contact details & map location',      icon: Phone,           kw: ['contact', 'address', 'phone', 'email', 'map', 'location'],   group: 'Content'  },

  /* ── Settings Sections ── */
  { label: 'WhatsApp Settings', path: '/admin/settings',                    desc: 'WhatsApp Business API credentials',   icon: MessageSquare,   kw: ['whatsapp', 'api', 'webhook', 'token', 'integration', 'waba'], group: 'Settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen]           = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('admin-theme') === 'dark'; } catch { return false; }
  });
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch<AppDispatch>();
  const { can }   = usePermission();
  const authUser  = useSelector((state: RootState) => state.permission.user);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/admin/login', { replace: true });
  }, [navigate]);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem('admin-theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    setProfileOpen(false);
    navigate('/admin/login', { replace: true });
  };

  const displayName     = authUser?.name || 'Admin';
  const displayInitials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const profilePicture  = authUser?.profilePicture || null;

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  /* Single toggle: desktop=sidebarOpen, mobile=mobileSidebarOpen */
  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) setSidebarOpen(s => !s);
    else setMobileSidebarOpen(s => !s);
  };

  /* Profile avatar helper (not a component — avoids remount issues) */
  const avatar = (cls: string) =>
    profilePicture
      ? <img src={profilePicture} alt={displayName} className={`${cls} rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-white/10`} />
      : <div className={`${cls} rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-bold">{displayInitials}</span>
        </div>;

  /* Search filtering */
  const q = searchQuery.trim().toLowerCase();
  const filteredModules = q.length > 0
    ? SEARCH_MODULES.filter(m =>
        m.label.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.kw.some(k => k.includes(q))
      )
    : SEARCH_MODULES;

  /* Group the filtered list by group field */
  const GROUP_ORDER = ['Modules', 'Content', 'Settings'] as const;
  const grouped = GROUP_ORDER.reduce((acc, g) => {
    const items = filteredModules.filter(m => m.group === g);
    if (items.length) acc.push({ group: g, items });
    return acc;
  }, [] as { group: string; items: typeof SEARCH_MODULES }[]);

  const handleModuleClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setSearchFocused(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo — no collapse arrow here */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-white/5 gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>V</span>
        </div>
        {(sidebarOpen || mobileSidebarOpen) && (
          <div className="overflow-hidden flex-1">
            <div className="text-[#D32F2F] font-bold text-sm leading-tight truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>VIP Numerology</div>
            <div className="text-gray-400 dark:text-gray-500 text-xs truncate">Admin Portal</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.filter(item => can(item.module, 'read')).map(item => {
          const Icon   = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-red-50 dark:bg-red-900/20 text-[#D32F2F] border-l-[3px] border-[#D32F2F]'
                  : 'text-[#616161] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#212121] dark:hover:text-white'
              }`}
              title={!sidebarOpen && !mobileSidebarOpen ? item.label : undefined}
            >
              <Icon size={17} className={`flex-shrink-0 ${active ? 'text-[#D32F2F]' : ''}`} />
              {(sidebarOpen || mobileSidebarOpen) && (
                <>
                  <span className="truncate">{item.label}</span>
                  {active && <div className="ml-auto w-2 h-2 rounded-full bg-[#FBC02D]" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Go to Website */}
      <div className="px-2 pb-1 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#616161] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#212121] dark:hover:text-white transition-all"
          title={!sidebarOpen ? 'Go to Website' : undefined}
        >
          <ExternalLink size={17} className="flex-shrink-0" />
          {sidebarOpen && <span className="truncate">Go to Website</span>}
        </a>
      </div>
    </>
  );

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen`}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f1115] transition-colors duration-300">

        {/* ── Desktop Sidebar ── */}
        <aside className={`hidden lg:flex ${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 bg-white dark:bg-[#13151e] border-r border-gray-100 dark:border-white/5 flex-col z-40 fixed top-0 left-0 h-screen`}>
          <SidebarContent />
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="relative w-64 bg-white dark:bg-[#13151e] h-full flex flex-col shadow-xl z-10">
              <button
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* ── Main content ── */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-16'}`}>

          {/* ── Top Header ── */}
          <header className="h-14 bg-white dark:bg-[#1a1d26] border-b border-gray-100 dark:border-white/5 flex items-center px-4 gap-3 sticky top-0 z-30 transition-colors duration-300">

            {/* Menu toggle — always visible, toggles sidebar on desktop / drawer on mobile */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              title="Toggle sidebar"
            >
              <Menu size={18} />
            </button>

            {/* ── Search with module suggestions ── */}
            <div className="flex-1 max-w-sm relative" ref={searchRef}>
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setSearchFocused(false); setSearchQuery(''); }
                }}
                placeholder="Search modules..."
                className="w-full pl-8 pr-8 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] focus:bg-white dark:focus:bg-white/10 transition-colors text-[#212121] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchFocused(false); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={13} />
                </button>
              )}

              {/* Suggestions dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1e2133] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-black/50 overflow-hidden z-50">
                  {grouped.length > 0 ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          {q ? `${filteredModules.length} result${filteredModules.length !== 1 ? 's' : ''}` : 'All Modules'}
                        </p>
                        {q && <p className="text-[10px] text-gray-300 dark:text-gray-600">Press Esc to clear</p>}
                      </div>
                      <div className="max-h-80 overflow-y-auto py-1">
                        {grouped.map(({ group, items }) => (
                          <div key={group}>
                            {/* Group header — always shown when there are multiple groups */}
                            {(grouped.length > 1 || !q) && (
                              <div className="px-4 pt-3 pb-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                  {group}
                                </p>
                              </div>
                            )}
                            {items.map(m => {
                              const Icon = m.icon;
                              const active = isActive(m.path.split('?')[0]);
                              return (
                                <button
                                  key={m.path}
                                  onMouseDown={() => handleModuleClick(m.path)}
                                  className={`w-full flex items-center gap-3 px-4 py-2 transition-colors text-left group ${
                                    active ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                  }`}
                                >
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                    active ? 'bg-[#D32F2F]' : 'bg-red-50 dark:bg-red-900/20 group-hover:bg-[#D32F2F]'
                                  }`}>
                                    <Icon size={13} className={`transition-colors ${active ? 'text-white' : 'text-[#D32F2F] group-hover:text-white'}`} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-semibold truncate ${active ? 'text-[#D32F2F]' : 'text-[#212121] dark:text-white'}`}>
                                      {m.label}
                                      {active && <span className="ml-2 text-[10px] bg-red-100 dark:bg-red-900/30 text-[#D32F2F] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Current</span>}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{m.desc}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Search size={22} className="mx-auto text-gray-200 dark:text-gray-600 mb-2" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No results found</p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">Try "homepage", "gallery", or "events"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-all text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun size={18} className="text-[#FBC02D]" /> : <Moon size={18} />}
              </button>

              {/* Bell */}
              <button className="relative p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#D32F2F] text-white text-[9px] rounded-full flex items-center justify-center font-bold">5</span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  {avatar('w-7 h-7')}
                  <span className="hidden md:block text-sm font-semibold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{displayName}</span>
                  <ChevronDown size={13} className="text-gray-400 dark:text-gray-500" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#1e2133] rounded-xl border border-gray-100 dark:border-white/10 shadow-lg dark:shadow-black/50 py-1 z-50">
                      {/* Profile header with avatar */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
                        {avatar('w-9 h-9')}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[#212121] dark:text-white truncate">{displayName}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{authUser?.email || ''}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/admin/profile'); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#212121] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <User size={14} className="text-[#616161] dark:text-gray-400" /> Profile
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); toggleTheme(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#212121] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        {isDark ? <Sun size={14} className="text-[#FBC02D]" /> : <Moon size={14} className="text-[#616161]" />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <div className="border-t border-gray-100 dark:border-white/10 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#D32F2F] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <AdminThemeContext.Provider value={isDark}>
              <Outlet />
            </AdminThemeContext.Provider>
          </main>
        </div>
      </div>
    </div>
  );
}
