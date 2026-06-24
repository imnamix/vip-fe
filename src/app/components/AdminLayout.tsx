import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { AdminThemeContext } from '../context/AdminThemeContext';
import {
  LayoutDashboard, Users, MessageSquare, UserCheck, Calendar,
  FileText, Shield, Truck, Bell, ChevronLeft, Menu, Search,
  LogOut, ChevronDown, User, X, Sun, Moon, Hash, Settings, ExternalLink,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard',          path: '/admin',                      icon: LayoutDashboard },
  { label: 'Inquiries',          path: '/admin/inquiries',            icon: MessageSquare   },
  { label: 'General Enquiries',  path: '/admin/general-inquiries',    icon: MessageSquare   },
  { label: 'Events',             path: '/admin/events',               icon: Calendar        },
  { label: 'Top VIP Numbers',    path: '/admin/vip-numbers',          icon: Hash            },
  { label: 'Content',            path: '/admin/content',              icon: FileText        },
  { label: 'User & Roles',       path: '/admin/roles',                icon: Shield          },
  { label: 'Delivery',           path: '/admin/delivery',             icon: Truck           },
  { label: 'Settings',           path: '/admin/settings',             icon: Settings        },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('admin-theme') === 'dark'; } catch { return false; }
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleTheme = () => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem('admin-theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-white/5 gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>V</span>
        </div>
        {(sidebarOpen || mobileSidebarOpen) && (
          <div className="overflow-hidden">
            <div className="text-[#D32F2F] font-bold text-sm leading-tight truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>VIP Numerology</div>
            <div className="text-gray-400 dark:text-gray-500 text-xs truncate">Admin Portal</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
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

      {/* Collapse (desktop only) */}
      <div className="p-3 border-t border-gray-100 dark:border-white/5 flex-shrink-0 hidden lg:block">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={15} className={`transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          {sidebarOpen && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen`}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f1115] transition-colors duration-300">

        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex ${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 bg-white dark:bg-[#13151e] border-r border-gray-100 dark:border-white/5 flex-col z-40 fixed top-0 left-0 h-screen`}>
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
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

        {/* Main content */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-16'}`}>

          {/* Top Header */}
          <header className="h-14 bg-white dark:bg-[#1a1d26] border-b border-gray-100 dark:border-white/5 flex items-center px-4 gap-3 sticky top-0 z-30 transition-colors duration-300">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-sm relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-4 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] focus:bg-white dark:focus:bg-white/10 transition-colors text-[#212121] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center gap-1.5 ml-auto">

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-all text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-200"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark
                  ? <Sun size={18} className="text-[#FBC02D]" />
                  : <Moon size={18} />
                }
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
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">SA</span>
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-[#212121] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Super Admin</span>
                  <ChevronDown size={13} className="text-gray-400 dark:text-gray-500" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#1e2133] rounded-xl border border-gray-100 dark:border-white/10 shadow-lg dark:shadow-black/50 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                        <div className="text-sm font-semibold text-[#212121] dark:text-white">Super Admin</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">admin@vipnumerology.com</div>
                      </div>
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/admin/profile'); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#212121] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <User size={14} className="text-[#616161] dark:text-gray-400" /> Profile
                      </button>
                      {/* Theme toggle inside dropdown too */}
                      <button
                        onClick={() => { setProfileOpen(false); toggleTheme(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#212121] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        {isDark
                          ? <Sun size={14} className="text-[#FBC02D]" />
                          : <Moon size={14} className="text-[#616161]" />
                        }
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <div className="border-t border-gray-100 dark:border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => navigate('/admin/login')}
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
