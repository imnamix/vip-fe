import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Hash, Eye, EyeOff, LogIn, Shield, Mail, KeyRound, RotateCcw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { LoginPage, ForgetPasswordOTP, verifyOtp, ResetPassword } from '../../services/LoginService';

type Step = 'login' | 'forgot' | 'verify' | 'reset';

// ── Defined OUTSIDE the component so React never unmounts them on re-render ──

function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212121] via-[#B71C1C] to-[#212121] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Hash size={30} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Admin Portal</h1>
            <p className="text-[#616161] text-sm mt-1">VIP Numerology Management System</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-[#D32F2F] text-sm px-4 py-3 rounded-xl">
      {message}
    </div>
  );
}

function SuccessBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
      <CheckCircle2 size={15} className="flex-shrink-0" />
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const [step, setStep] = useState<Step>('login');

  // login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // shared email across forgot / verify / reset steps
  const [fpEmail, setFpEmail] = useState('');

  // OTP — 4 controlled inputs
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const otpRef0 = useRef<HTMLInputElement>(null);
  const otpRef1 = useRef<HTMLInputElement>(null);
  const otpRef2 = useRef<HTMLInputElement>(null);
  const otpRef3 = useRef<HTMLInputElement>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

  // reset password fields
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // shared ui
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetMessages = () => { setError(''); setSuccess(''); };
  const goTo = (s: Step) => { resetMessages(); setStep(s); };

  // ── Login ────────────────────────────────────────────────────────────────────

  const handleLogin = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res = await LoginPage({ email: loginEmail, password: loginPassword });
      const data = res.data;
      if (data?.success && data?.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
        }));
        navigate('/admin');
      } else {
        setError(data?.message || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ── Send OTP ─────────────────────────────────────────────────────────────────

  const handleSendOtp = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      const res = await ForgetPasswordOTP({ email: fpEmail });
      if (res?.status === 'success') {
        setOtp(['', '', '', '']);
        goTo('verify');
        setSuccess('OTP sent! Check your email inbox.');
      } else {
        setError(res?.data?.message || 'Failed to send OTP. Check the email address.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ───────────────────────────────────────────────────────

  const handleOtpChange = (index: number, rawValue: string) => {
    // Keep only digits, take the last one typed (handles typing over existing value)
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // clear current box
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        // move to previous box and clear it
        const next = [...otp];
        next[index - 1] = '';
        setOtp(next);
        otpRefs[index - 1].current?.focus();
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  // Handles paste anywhere in the OTP field — fills all 4 boxes
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, startIndex: number) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!digits) return;
    const next = [...otp];
    digits.split('').forEach((d, i) => {
      if (startIndex + i < 4) next[startIndex + i] = d;
    });
    setOtp(next);
    // focus the box after the last filled one
    const focusIndex = Math.min(startIndex + digits.length, 3);
    otpRefs[focusIndex].current?.focus();
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────────

  const handleVerifyOtp = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    resetMessages();
    const code = otp.join('');
    if (code.length < 4) { setError('Please enter the complete 4-digit OTP.'); return; }
    setLoading(true);
    try {
      const res = await verifyOtp({ email: fpEmail, otp: Number(code) });
      if (res?.status === 'success') {
        setNewPass('');
        setConfirmPass('');
        goTo('reset');
      } else {
        setError(res?.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    resetMessages();
    setLoading(true);
    try {
      const res = await ForgetPasswordOTP({ email: fpEmail });
      if (res?.status === 'success') {
        setOtp(['', '', '', '']);
        setSuccess('A new OTP has been sent to your email.');
        setTimeout(() => otpRefs[0].current?.focus(), 50);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset password ───────────────────────────────────────────────────────────

  const handleResetPassword = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    resetMessages();
    if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const res = await ResetPassword({ email: fpEmail, newPassword: newPass });
      if (res?.status === 'success') {
        setSuccess('Password reset successfully! Redirecting to login…');
        setTimeout(() => {
          setLoginEmail(fpEmail);
          setLoginPassword('');
          goTo('login');
        }, 2000);
      } else {
        setError(res?.data?.message || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Step: Login ─────────────────────────────────────────────────────────────
  if (step === 'login') return (
    <PageCard>
      {/* <div className="bg-[#FFF8E1] border border-[#FBC02D]/30 rounded-xl p-3 flex items-center gap-2 mb-6">
        <Shield size={16} className="text-[#FBC02D] flex-shrink-0" />
        <p className="text-xs text-[#616161]">Secure admin area. Unauthorised access is prohibited and logged.</p>
      </div> */}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#212121] mb-1.5">Email Address</label>
          <input
            type="email"
            required
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-[#212121]">Password</label>
            <button
              type="button"
              onClick={() => { setFpEmail(loginEmail); goTo('forgot'); }}
              className="text-xs text-[#D32F2F] hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showLoginPass ? 'text' : 'password'}
              required
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowLoginPass(v => !v)}>
              {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <ErrorBox message={error} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-70"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><LogIn size={18} />Sign In to Admin</>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={() => navigate('/')} className="text-[#616161] text-sm hover:text-[#D32F2F] transition-colors">
          ← Back to Website
        </button>
      </div>
    </PageCard>
  );

  // ── Step: Forgot — enter email ───────────────────────────────────────────────
  if (step === 'forgot') return (
    <PageCard>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Mail size={20} className="text-blue-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Forgot Password</h2>
          <p className="text-xs text-[#616161]">We'll send a 4-digit OTP to your email</p>
        </div>
      </div>

      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#212121] mb-1.5">Admin Email Address</label>
          <input
            type="email"
            required
            value={fpEmail}
            onChange={e => setFpEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
          />
        </div>

        <ErrorBox message={error} />
        <SuccessBox message={success} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-70"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Mail size={18} />Send OTP</>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={() => goTo('login')} className="text-[#616161] text-sm hover:text-[#D32F2F] transition-colors flex items-center gap-1 mx-auto">
          <ArrowLeft size={13} /> Back to Login
        </button>
      </div>
    </PageCard>
  );

  // ── Step: Verify OTP ─────────────────────────────────────────────────────────
  if (step === 'verify') return (
    <PageCard>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <KeyRound size={20} className="text-[#FBC02D]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Verify OTP</h2>
          <p className="text-xs text-[#616161]">Sent to <span className="font-semibold text-[#212121]">{fpEmail}</span></p>
        </div>
      </div>
      <p className="text-xs text-[#9e9e9e] mb-5">Enter the 4-digit code. It expires in 5 minutes.</p>

      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <div className="flex gap-3 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={otpRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              onPaste={e => handleOtpPaste(e, i)}
              onFocus={e => e.target.select()}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors text-[#212121] caret-[#D32F2F]"
            />
          ))}
        </div>

        <ErrorBox message={error} />
        <SuccessBox message={success} />

        <button
          type="submit"
          disabled={loading || otp.join('').length < 4}
          className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-70"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><CheckCircle2 size={18} />Verify OTP</>}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <button onClick={() => goTo('forgot')} className="text-[#616161] hover:text-[#D32F2F] transition-colors flex items-center gap-1">
          <ArrowLeft size={13} /> Back
        </button>
        <button
          onClick={handleResendOtp}
          disabled={loading}
          className="text-[#D32F2F] hover:underline disabled:opacity-50 flex items-center gap-1"
        >
          <RotateCcw size={13} /> Resend OTP
        </button>
      </div>
    </PageCard>
  );

  // ── Step: Reset password ─────────────────────────────────────────────────────
  return (
    <PageCard>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield size={20} className="text-green-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Set New Password</h2>
          <p className="text-xs text-[#616161]">OTP verified — create a strong password</p>
        </div>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#212121] mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNewPass ? 'text' : 'password'}
              required
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowNewPass(v => !v)}>
              {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#212121] mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPass ? 'text' : 'password'}
              required
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowConfirmPass(v => !v)}>
              {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirmPass && (
            <p className={`text-xs mt-1.5 ${newPass === confirmPass ? 'text-green-600' : 'text-red-500'}`}>
              {newPass === confirmPass ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <ErrorBox message={error} />
        <SuccessBox message={success} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-70"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><KeyRound size={18} />Reset Password</>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={() => goTo('login')} className="text-[#616161] text-sm hover:text-[#D32F2F] transition-colors flex items-center gap-1 mx-auto">
          <ArrowLeft size={13} /> Back to Login
        </button>
      </div>
    </PageCard>
  );
}
