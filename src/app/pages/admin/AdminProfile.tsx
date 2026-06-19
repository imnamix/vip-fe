import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Camera, Save, Lock, Bell, Shield, CheckCircle } from 'lucide-react';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Super Admin',
    email: 'admin@vipnumerology.com',
    phone: '+91 98765 00000',
    role: 'Super Admin',
    joinedDate: 'Jan 1, 2022',
    lastLogin: 'Today, 10:32 AM',
    city: 'Pune',
    avatar: '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [notifs, setNotifs] = useState({ email: true, whatsapp: true, browser: false, weekly: true });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const field = (label: string, key: keyof typeof profile, type = 'text', disabled = false) => (
    <div key={key}>
      <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={profile[key]}
        onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] transition-colors ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>My Profile</h1>
        {saved && (
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl font-medium">
            <CheckCircle size={13} /> Saved
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* Avatar + Basic */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                SA
              </div>
              <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#D32F2F] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#B71C1C] transition-colors">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{profile.name}</h2>
              <div className="inline-block bg-red-50 text-[#D32F2F] text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 mb-2">{profile.role}</div>
              <div className="flex flex-wrap gap-4 text-xs text-[#616161]">
                <span>Joined: {profile.joinedDate}</span>
                <span>Last login: {profile.lastLogin}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Full Name', 'name')}
            {field('Email Address', 'email', 'email', true)}
            {field('Phone Number', 'phone', 'tel')}
            {field('City', 'city')}
            {field('Role', 'role', 'text', true)}
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm hover:bg-[#B71C1C] transition-colors">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center"><Lock size={15} className="text-[#D32F2F]" /></div>
            <h3 className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Change Password</h3>
          </div>
          <div className="space-y-3">
            {[['Current Password', 'current'], ['New Password', 'newPass'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">{label}</label>
                <input
                  type="password"
                  value={passwords[key as keyof typeof passwords]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white"
                  placeholder="••••••••"
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#212121] text-white rounded-xl font-semibold text-sm hover:bg-black transition-colors">
              <Lock size={14} /> Update Password
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center"><Bell size={15} className="text-[#D32F2F]" /></div>
            <h3 className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Notification Preferences</h3>
          </div>
          <div className="space-y-3">
            {[
              ['email', 'Email Notifications', 'Receive updates via email'],
              ['whatsapp', 'WhatsApp Notifications', 'Receive alerts on WhatsApp'],
              ['browser', 'Browser Notifications', 'Push notifications in browser'],
              ['weekly', 'Weekly Summary Report', 'Weekly digest every Monday'],
            ].map(([key, title, desc]) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-[#212121]">{title}</div>
                  <div className="text-xs text-[#616161]">{desc}</div>
                </div>
                <div
                  onClick={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof notifs] }))}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${notifs[key as keyof typeof notifs] ? 'bg-[#D32F2F]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${notifs[key as keyof typeof notifs] ? 'left-5' : 'left-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center"><Shield size={15} className="text-[#D32F2F]" /></div>
            <h3 className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Security</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['2FA', 'Two-Factor Auth', 'Not Enabled'], ['Sessions', 'Active Sessions', '1 Device'], ['Logs', 'Login Attempts', '2 today']].map(([, title, val]) => (
              <div key={title} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-sm font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{val}</div>
                <div className="text-xs text-[#616161] mt-0.5">{title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
