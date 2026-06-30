import { useState } from 'react';
import { X, User, Briefcase, CheckCircle, ChevronRight, ChevronLeft, Hash } from 'lucide-react';
import { createInquiry } from '../services/EnquiresService';

type UserType = 'customer' | 'numerologist' | null;
type Step = 1 | 2 | 3 | 4;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

const STEP_LABELS = ['User Type', 'Details', 'Requirements', 'Confirmation'];

interface BookingModalProps {
  onClose: () => void;
}

const emptyCustomer = {
  name: '', mobile: '', address: '', taluka: '', district: '', state: '',
  pinCode: '', nearestViStore: '',
};

const emptyNumerologist = {
  name: '', mobile: '', clientName: '', clientMobile: '',
  address: '', district: '', state: '', pinCode: '', nearestViStore: '',
};

const emptyRequirements = {
  hasNumerologistRef: 'no' as 'yes' | 'no',
  numerologistRefName: '',
  numerologistRefMobile: '',
  requireDigits: '',
  notRequireDigits: '',
  total: '',
  specialRequirements: '',
};

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-gray-50';
const labelCls = 'block text-xs font-semibold text-[#212121] mb-1';

export default function BookingModal({ onClose }: BookingModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [userType, setUserType] = useState<UserType>("customer");
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [numForm, setNumForm] = useState(emptyNumerologist);
  const [requirements, setRequirements] = useState(emptyRequirements);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const base =
        userType === 'customer'
          ? { inquiryType: 'customer', source: 'Website', ...customerForm }
          : { inquiryType: 'numerologist', source: 'Website', ...numForm };

      const payload = {
        ...base,
        requireDigits: requirements.requireDigits,
        notRequireDigits: requirements.notRequireDigits,
        total: requirements.total,
        specialRequirements: requirements.specialRequirements,
        ...(userType === 'customer' && {
          hasNumerologistRef: requirements.hasNumerologistRef === 'yes',
          numerologistRefName:
            requirements.hasNumerologistRef === 'yes'
              ? requirements.numerologistRefName
              : '',
          numerologistRefMobile:
            requirements.hasNumerologistRef === 'yes'
              ? requirements.numerologistRefMobile
              : '',
        }),
      };

      await createInquiry(payload);
      setStep(4);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = userType === 'customer' ? customerForm.name : numForm.name;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg my-4 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D32F2F] rounded-xl flex items-center justify-center flex-shrink-0">
              <Hash size={18} className="text-white" />
            </div>
            <div>
              <h2
                className="font-bold text-[#212121] text-lg leading-tight"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Book Your Number
              </h2>
              <p className="text-[#616161] text-xs">
                Step {step} of 4 — {STEP_LABELS[step - 1]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Progress ── */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-4 items-center mb-2">
            {[1, 2, 3, 4].map((s, i) => (
              <div key={s} className="relative flex justify-center">
                {i < 3 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 transition-colors ${
                      step > s ? "bg-[#D32F2F]" : "bg-gray-200"
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                    step > s
                      ? "bg-[#FBC02D] border-[#FBC02D] text-white"
                      : step === s
                        ? "bg-[#D32F2F] border-[#D32F2F] text-white"
                        : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {step > s ? <CheckCircle size={13} /> : s}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 text-center mb-3">
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`text-[10px] font-medium leading-tight px-0.5 ${
                  step === i + 1 ? "text-[#D32F2F] font-bold" : "text-[#9E9E9E]"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* ══ STEP 1 — User Type ══ */}
          {step === 1 && (
            <div>
              <p className="text-[#616161] text-sm mb-5">
                Select your profile to get started.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  {
                    type: "customer" as const,
                    icon: User,
                    title: "Customer",
                    desc: "I want to book a VIP number for myself.",
                  },
                  {
                    type: "numerologist" as const,
                    icon: Briefcase,
                    title: "Numerologist",
                    desc: "I am a numerologist booking for my client.",
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const selected = userType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => setUserType(opt.type)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        selected
                          ? "border-[#D32F2F] bg-red-50"
                          : "border-gray-200 hover:border-[#D32F2F]/40"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                          selected ? "bg-[#D32F2F]" : "bg-gray-100"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={selected ? "text-white" : "text-gray-500"}
                        />
                      </div>
                      <div
                        className="font-bold text-[#212121] text-sm mb-1"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {opt.title}
                      </div>
                      <div className="text-[#616161] text-xs">{opt.desc}</div>
                      {selected && (
                        <CheckCircle
                          size={14}
                          className="text-[#D32F2F] mt-2"
                        />
                      )}
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

          {/* ══ STEP 2 — Details ══ */}
          {step === 2 && (
            <div>
              <div className="max-h-[58vh] overflow-y-auto pr-1 space-y-3">
                {userType === "customer" ? (
                  <>
                    {/* Customer details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Customer Name *</label>
                        <input
                          type="text"
                          value={customerForm.name}
                          onChange={(e) =>
                            setCustomerForm((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Full name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Mobile Number *</label>
                        <input
                          type="tel"
                          value={customerForm.mobile}
                          onChange={(e) =>
                            setCustomerForm((p) => ({
                              ...p,
                              mobile: e.target.value,
                            }))
                          }
                          placeholder="98765 43210"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Address</label>
                      <input
                        type="text"
                        value={customerForm.address}
                        onChange={(e) =>
                          setCustomerForm((p) => ({
                            ...p,
                            address: e.target.value,
                          }))
                        }
                        placeholder="House/Flat no., Street"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Taluka</label>
                        <input
                          type="text"
                          value={customerForm.taluka}
                          onChange={(e) =>
                            setCustomerForm((p) => ({
                              ...p,
                              taluka: e.target.value,
                            }))
                          }
                          placeholder="Taluka"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>District</label>
                        <input
                          type="text"
                          value={customerForm.district}
                          onChange={(e) =>
                            setCustomerForm((p) => ({
                              ...p,
                              district: e.target.value,
                            }))
                          }
                          placeholder="District"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>State</label>
                        <select
                          value={customerForm.state}
                          onChange={(e) =>
                            setCustomerForm((p) => ({
                              ...p,
                              state: e.target.value,
                              nearestViStore: "",
                            }))
                          }
                          className={inputCls}
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Pin Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={customerForm.pinCode}
                          onChange={(e) =>
                            setCustomerForm((p) => ({
                              ...p,
                              pinCode: e.target.value,
                            }))
                          }
                          placeholder="400001"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Nearest Vi Store (km)</label>
                      <input
                        type="text"
                        value={customerForm.nearestViStore}
                        onChange={(e) =>
                          setCustomerForm((p) => ({
                            ...p,
                            nearestViStore: e.target.value,
                          }))
                        }
                        placeholder="e.g. Andheri West - 5km"
                        className={inputCls}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Numerologist details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Numerologist Name *</label>
                        <input
                          type="text"
                          value={numForm.name}
                          onChange={(e) =>
                            setNumForm((p) => ({ ...p, name: e.target.value }))
                          }
                          placeholder="Your full name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Numerologist Mobile *
                        </label>
                        <input
                          type="tel"
                          value={numForm.mobile}
                          onChange={(e) =>
                            setNumForm((p) => ({
                              ...p,
                              mobile: e.target.value,
                            }))
                          }
                          placeholder="98765 43210"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Client Name *</label>
                        <input
                          type="text"
                          value={numForm.clientName}
                          onChange={(e) =>
                            setNumForm((p) => ({
                              ...p,
                              clientName: e.target.value,
                            }))
                          }
                          placeholder="Client's full name"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Client Mobile *</label>
                        <input
                          type="tel"
                          value={numForm.clientMobile}
                          onChange={(e) =>
                            setNumForm((p) => ({
                              ...p,
                              clientMobile: e.target.value,
                            }))
                          }
                          placeholder="98765 43210"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Address</label>
                      <input
                        type="text"
                        value={numForm.address}
                        onChange={(e) =>
                          setNumForm((p) => ({ ...p, address: e.target.value }))
                        }
                        placeholder="House/Flat no., Street"
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>District</label>
                        <input
                          type="text"
                          value={numForm.district}
                          onChange={(e) =>
                            setNumForm((p) => ({
                              ...p,
                              district: e.target.value,
                            }))
                          }
                          placeholder="District"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>State</label>
                        <select
                          value={numForm.state}
                          onChange={(e) =>
                            setNumForm((p) => ({
                              ...p,
                              state: e.target.value,
                              nearestViStore: "",
                            }))
                          }
                          className={inputCls}
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Pin Code</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={numForm.pinCode}
                          onChange={(e) =>
                            setNumForm((p) => ({
                              ...p,
                              pinCode: e.target.value,
                            }))
                          }
                          placeholder="400001"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Nearest Vi Store (km)
                        </label>
                        <input
                          type="text"
                          value={numForm.nearestViStore}
                          onChange={(e) =>
                            setNumForm((p) => ({
                              ...p,
                              nearestViStore: e.target.value,
                            }))
                          }
                          placeholder="e.g. Andheri West - 5km"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Step 2 nav */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border-2 border-gray-200 text-[#616161] rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:border-[#D32F2F] hover:text-[#D32F2F]"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nameOk =
                      userType === "customer"
                        ? customerForm.name.trim() && customerForm.mobile.trim()
                        : numForm.name.trim() &&
                          numForm.mobile.trim() &&
                          numForm.clientName.trim() &&
                          numForm.clientMobile.trim();
                    if (!nameOk) {
                      setError("Please fill in all required fields (*).");
                      return;
                    }
                    setError("");
                    setStep(3);
                  }}
                  className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:bg-[#B71C1C]"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
              )}
            </div>
          )}

          {/* ══ STEP 3 — Requirements ══ */}
          {step === 3 && (
            <div>
              <div className="max-h-[58vh] overflow-y-auto pr-1 space-y-4">
                {/* Numerologist reference — customers only */}
                {userType === "customer" && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-[#212121] uppercase tracking-wider mb-3">
                      Numerologist Reference
                    </p>
                    <div className="flex gap-6 mb-3">
                      {(["yes", "no"] as const).map((v) => (
                        <label
                          key={v}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="hasNumerologistRef"
                            value={v}
                            checked={requirements.hasNumerologistRef === v}
                            onChange={() =>
                              setRequirements((p) => ({
                                ...p,
                                hasNumerologistRef: v,
                                numerologistRefName: "",
                                numerologistRefMobile: "",
                              }))
                            }
                            className="accent-[#D32F2F] w-4 h-4"
                          />
                          <span className="text-sm font-medium text-[#212121] capitalize">
                            {v}
                          </span>
                        </label>
                      ))}
                    </div>

                    {requirements.hasNumerologistRef === "yes" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>
                            Numerologist Name *
                          </label>
                          <input
                            type="text"
                            value={requirements.numerologistRefName}
                            onChange={(e) =>
                              setRequirements((p) => ({
                                ...p,
                                numerologistRefName: e.target.value,
                              }))
                            }
                            placeholder="Numerologist name"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>
                            Numerologist Mobile *
                          </label>
                          <input
                            type="tel"
                            value={requirements.numerologistRefMobile}
                            onChange={(e) =>
                              setRequirements((p) => ({
                                ...p,
                                numerologistRefMobile: e.target.value,
                              }))
                            }
                            placeholder="98765 43210"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Requirements */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-[#212121] uppercase tracking-wider mb-3">
                    Number Requirements
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Require Digits</label>
                        <input
                          type="text"
                          value={requirements.requireDigits}
                          onChange={(e) =>
                            setRequirements((p) => ({
                              ...p,
                              requireDigits: e.target.value,
                            }))
                          }
                          placeholder="e.g. 8, 1, 5"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Not Require Digits</label>
                        <input
                          type="text"
                          value={requirements.notRequireDigits}
                          onChange={(e) =>
                            setRequirements((p) => ({
                              ...p,
                              notRequireDigits: e.target.value,
                            }))
                          }
                          placeholder="e.g. 4, 8"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Total</label>
                      <input
                        type="text"
                        value={requirements.total}
                        onChange={(e) =>
                          setRequirements((p) => ({
                            ...p,
                            total: e.target.value,
                          }))
                        }
                        placeholder="e.g. 5, 9"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Any Special Requirements
                      </label>
                      <textarea
                        rows={3}
                        value={requirements.specialRequirements}
                        onChange={(e) =>
                          setRequirements((p) => ({
                            ...p,
                            specialRequirements: e.target.value,
                          }))
                        }
                        placeholder="Describe any special requirements..."
                        className={inputCls + " resize-none"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
              )}

              {/* Step 3 nav */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(2);
                  }}
                  className="flex-1 py-2.5 border-2 border-gray-200 text-[#616161] rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:border-[#D32F2F] hover:text-[#D32F2F]"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    if (
                      userType === "customer" &&
                      requirements.hasNumerologistRef === "yes" &&
                      (!requirements.numerologistRefName.trim() ||
                        !requirements.numerologistRefMobile.trim())
                    ) {
                      setError("Please fill in numerologist name and mobile.");
                      return;
                    }
                    setError("");
                    handleFinalSubmit();
                  }}
                  className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1 hover:bg-[#B71C1C] disabled:opacity-50"
                >
                  {loading ? (
                    "Submitting…"
                  ) : (
                    <>
                      Submit <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 4 — Confirmation ══ */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3
                className="text-xl font-bold text-[#212121] mb-2"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Inquiry Submitted!
              </h3>
              <p className="text-[#616161] text-sm mb-6">
                Thank you, <strong>{displayName || "Valued Client"}</strong>!
                Our team will contact you within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#B71C1C] transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
