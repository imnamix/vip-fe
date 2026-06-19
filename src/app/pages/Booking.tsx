import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Briefcase, CheckCircle, Mail, MessageCircle, ChevronRight, ChevronLeft, Hash } from 'lucide-react';

type UserType = 'customer' | 'professional' | null;
type Step = 1 | 2 | 3;

const customerFields = [
  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter your full name' },
  { label: 'Date of Birth', key: 'dob', type: 'date', placeholder: '' },
  { label: 'Mobile Number', key: 'mobile', type: 'tel', placeholder: '+91 98765 43210' },
  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
  { label: 'City', key: 'city', type: 'text', placeholder: 'Mumbai' },
  { label: 'What are your goals?', key: 'goals', type: 'textarea', placeholder: 'Wealth, career, relationships...' },
];

const professionalFields = [
  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter your full name' },
  { label: 'Organisation / Practice Name', key: 'org', type: 'text', placeholder: 'Your business name' },
  { label: 'Certification Details', key: 'cert', type: 'text', placeholder: 'Certification body and year' },
  { label: 'Mobile Number', key: 'mobile', type: 'tel', placeholder: '+91 98765 43210' },
  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
  { label: 'Years of Experience', key: 'experience', type: 'number', placeholder: '5' },
  { label: 'Specialisation', key: 'specialisation', type: 'text', placeholder: 'Vedic numerology, name correction...' },
  { label: 'Referral Code (optional)', key: 'referral', type: 'text', placeholder: 'VIP-XXXXX' },
];

export default function Booking() {
  const [step, setStep] = useState<Step>(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const fields = userType === 'customer' ? customerFields : professionalFields;

  const handleNext = () => {
    if (step === 1 && userType) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E1] py-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#D32F2F] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Hash size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>Book a Consultation</h1>
          <p className="text-[#616161] mt-2">Complete the wizard to begin your numerology journey.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                step > s ? 'bg-[#4CAF50] border-[#4CAF50] text-white' :
                step === s ? 'bg-[#D32F2F] border-[#D32F2F] text-white' :
                'bg-white border-gray-300 text-gray-400'
              }`}>
                {step > s ? <CheckCircle size={18} /> : s}
              </div>
              {i < 2 && (
                <div className={`w-20 h-0.5 ${step > s + 1 ? 'bg-[#4CAF50]' : step === s + 1 ? 'bg-[#D32F2F]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#616161] mb-10 px-2">
          <span>User Type</span>
          <span>Your Details</span>
          <span>Confirmation</span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Who are you?</h2>
            <p className="text-[#616161] text-sm mb-8">Select your profile to get a personalised consultation experience.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setUserType('customer')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${userType === 'customer' ? 'border-[#D32F2F] bg-red-50' : 'border-gray-200 hover:border-[#D32F2F]/50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${userType === 'customer' ? 'bg-[#D32F2F]' : 'bg-gray-100'}`}>
                  <User size={22} className={userType === 'customer' ? 'text-white' : 'text-gray-500'} />
                </div>
                <h3 className="font-bold text-[#212121] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Customer</h3>
                <p className="text-[#616161] text-sm">I want to book a VIP number or numerology consultation for myself.</p>
                {userType === 'customer' && <CheckCircle size={18} className="text-[#D32F2F] mt-3" />}
              </button>

              <button
                onClick={() => setUserType('professional')}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${userType === 'professional' ? 'border-[#D32F2F] bg-red-50' : 'border-gray-200 hover:border-[#D32F2F]/50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${userType === 'professional' ? 'bg-[#D32F2F]' : 'bg-gray-100'}`}>
                  <Briefcase size={22} className={userType === 'professional' ? 'text-white' : 'text-gray-500'} />
                </div>
                <h3 className="font-bold text-[#212121] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Professional Numerologist</h3>
                <p className="text-[#616161] text-sm">I am a certified numerologist wanting to join the VIP Numerology network.</p>
                {userType === 'professional' && <CheckCircle size={18} className="text-[#D32F2F] mt-3" />}
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={!userType}
              className="w-full py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {userType === 'customer' ? 'Your Details' : 'Professional Profile'}
            </h2>
            <p className="text-[#616161] text-sm mb-8">Please fill in your information accurately for best results.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-[#212121] mb-1.5">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={form[f.key] || ''}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type={f.type}
                      required={f.key !== 'referral'}
                      value={form[f.key] || ''}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 focus:bg-white transition-colors"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border-2 border-gray-200 text-[#616161] rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  type="submit"
                  className="flex-2 flex-1 py-3.5 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Submit <ChevronRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#212121] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Booking Confirmed! 🎉
            </h2>
            <p className="text-[#616161] mb-8">
              Thank you, <strong>{form.name || 'Valued Client'}</strong>! Your inquiry has been received. Our team will contact you within 24 hours.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#FFF8E1] rounded-2xl p-5">
                <Mail size={24} className="text-[#D32F2F] mb-2 mx-auto" />
                <div className="font-semibold text-[#212121] text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Email Sent</div>
                <div className="text-[#616161] text-xs">Confirmation sent to {form.email || 'your email'}</div>
              </div>
              <div className="bg-[#FFF8E1] rounded-2xl p-5">
                <MessageCircle size={24} className="text-green-500 mb-2 mx-auto" />
                <div className="font-semibold text-[#212121] text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>WhatsApp Sent</div>
                <div className="text-[#616161] text-xs">Message sent to {form.mobile || 'your number'}</div>
              </div>
            </div>

            <div className="bg-[#D32F2F]/5 border border-[#D32F2F]/20 rounded-xl p-4 mb-8 text-left">
              <h4 className="font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>What happens next?</h4>
              <ul className="space-y-1 text-sm text-[#616161]">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Our team reviews your inquiry</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Numerologist assigned within 2 hours</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Consultation scheduled via WhatsApp</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Full analysis report delivered in 48 hours</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 border-2 border-[#D32F2F] text-[#D32F2F] rounded-xl font-semibold hover:bg-red-50 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => { setStep(1); setUserType(null); setForm({}); }}
                className="flex-1 py-3 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
              >
                New Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
