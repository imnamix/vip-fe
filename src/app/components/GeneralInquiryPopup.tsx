import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { createGeneralInquiry } from '../services/GeneralInquiryService';

interface Props {
  lookingFor: string;
  title: string;
  onClose: () => void;
}

export default function GeneralInquiryPopup({ lookingFor, title, onClose }: Props) {
  const [form, setForm] = useState({ name: '', mobile: '', message: '' });
  const [errors, setErrors] = useState({ name: '', mobile: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { name: '', mobile: '' };
    if (!form.name.trim())   errs.name   = 'Name is required';
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile.trim())) errs.mobile = 'Enter a valid 10-digit mobile number';
    if (errs.name || errs.mobile) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await createGeneralInquiry({
        name:      form.name.trim(),
        mobile:    form.mobile.trim(),
        message:   form.message.trim() || undefined,
        lookingFor,
      });
      setSuccess(true);
    } catch {
      // keep popup open so user can retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Send Inquiry
            </h2>
            <p className="text-xs text-[#9E9E9E] mt-0.5">Fill in your details and we'll get back to you</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} className="text-[#616161]" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-[#212121] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Inquiry Submitted!
            </h3>
            <p className="text-[#616161] text-sm mb-6">
              Our team will contact you shortly regarding{' '}
              <span className="font-semibold text-[#D32F2F]">{title}</span>.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm hover:bg-[#B71C1C] transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Looking For */}
            {/* <div>
              <label className="block text-xs font-semibold text-[#212121] mb-1">Looking For</label>
              <input
                readOnly
                value={lookingFor}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-[#616161] cursor-default"
              />
            </div> */}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#212121] mb-1">
                Name <span className="text-[#D32F2F]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(err => ({ ...err, name: '' })); }}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-[#212121] mb-1">
                Mobile Number <span className="text-[#D32F2F]">*</span>
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={form.mobile}
                maxLength={10}
                onChange={e => { setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') })); setErrors(err => ({ ...err, mobile: '' })); }}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white transition-colors ${errors.mobile ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-[#212121] mb-1">
                Message <span className="text-[#9E9E9E] font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Any specific requirements or questions..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {submitting ? 'Submitting…' : 'Submit Inquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
