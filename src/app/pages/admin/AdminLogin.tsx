import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Hash, Eye, EyeOff, LogIn, Shield } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@vipnumerology.com');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      if (password === 'admin123' || password.length > 0) {
        navigate('/admin');
      } else {
        setError('Invalid credentials. Use any password to demo login.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212121] via-[#B71C1C] to-[#212121] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Hash size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Admin Portal</h1>
            <p className="text-[#616161] text-sm mt-1">VIP Numerology Management System</p>
          </div>

          {/* Security badge */}
          <div className="bg-[#FFF8E1] border border-[#FBC02D]/30 rounded-xl p-3 flex items-center gap-2 mb-6">
            <Shield size={16} className="text-[#FBC02D] flex-shrink-0" />
            <p className="text-xs text-[#616161]">Secure admin area. Unauthorised access is prohibited and logged.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#212121] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#212121] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter any password to demo"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-[#D32F2F] text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-70"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In to Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-[#616161] text-sm hover:text-[#D32F2F] transition-colors"
            >
              ← Back to Website
            </button>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2024 VIP Numerology. Admin Portal v2.4.1
        </p>
      </div>
    </div>
  );
}
