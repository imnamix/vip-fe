import { useState } from 'react';
import { X, User, Briefcase, CheckCircle, Mail, MessageCircle, ChevronRight, ChevronLeft, Hash } from 'lucide-react';

type UserType = 'customer' | 'professional' | null;
type Step = 1 | 2 | 3;

interface BookingModalProps {
  onClose: () => void;
}

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

export default function BookingModal({ onClose }: BookingModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const fields = userType === 'customer' ? customerFields : professionalFields;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D32F2F] rounded-xl flex items-center justify-center">
              <Hash size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[#212121] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Book a Consultation</h2>
              <p className="text-[#616161] text-xs">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-0 mb-1">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                  step > s ? 'bg-[#4CAF50] border-[#4CAF50] text-white' :
                  step === s ? 'bg-[#D32F2F] border-[#D32F2F] text-white' :
                  'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle size={14} /> : s}
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 ${step > s + 1 ? 'bg-[#4CAF50]' : step === s + 1 ? 'bg-[#D32F2F]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[#616161] mb-4">
            <span>User Type</span><span>Details</span><span>Confirmation</span>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <p className="text-[#616161] text-sm mb-5">Select your profile to get a personalised experience.</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { type: 'customer' as const, icon: User, title: 'Customer', desc: 'Book a VIP number or consultation for myself.' },
                  { type: 'professional' as const, icon: Briefcase, title: 'Professional', desc: 'Join the VIP Numerology network.' },
                ].map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => setUserType(opt.type)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${userType === opt.type ? 'border-[#D32F2F] bg-red-50' : 'border-gray-200 hover:border-[#D32F2F]/40'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${userType === opt.type ? 'bg-[#D32F2F]' : 'bg-gray-100'}`}>
                        <Icon size={18} className={userType === opt.type ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <div className="font-bold text-[#212121] text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{opt.title}</div>
                      <div className="text-[#616161] text-xs">{opt.desc}</div>
                      {userType === opt.type && <CheckCircle size={14} className="text-[#D32F2F] mt-2" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => userType && setStep(2)}
                disabled={!userType}
                className="w-full py-3 bg-[#D32F2F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="max-h-80 overflow-y-auto pr-1 space-y-3">
                {fields.map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-[#212121] mb-1">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea rows={2} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50 resize-none" />
                    ) : (
                      <input type={f.type} required={f.key !== 'referral'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border-2 border-gray-200 text-[#616161] rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:border-[#D32F2F] hover:text-[#D32F2F]">
                  <ChevronLeft size={14} /> Back
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:bg-[#B71C1C]">
                  Submit <ChevronRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Booking Confirmed! 🎉</h3>
              <p className="text-[#616161] text-sm mb-6">Thank you, <strong>{form.name || 'Valued Client'}</strong>! Our team will contact you within 24 hours.</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#FFF8E1] rounded-xl p-4">
                  <Mail size={20} className="text-[#D32F2F] mb-1 mx-auto" />
                  <div className="font-semibold text-[#212121] text-xs mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>Email Sent</div>
                  <div className="text-[#616161] text-xs truncate">{form.email || 'your email'}</div>
                </div>
                <div className="bg-[#FFF8E1] rounded-xl p-4">
                  <MessageCircle size={20} className="text-green-500 mb-1 mx-auto" />
                  <div className="font-semibold text-[#212121] text-xs mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>WhatsApp Sent</div>
                  <div className="text-[#616161] text-xs">{form.mobile || 'your number'}</div>
                </div>
              </div>
              <button onClick={onClose}
                className="w-full py-3 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
