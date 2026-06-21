import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronLeft, Save, Loader2, CheckCircle, AlertCircle, ChevronDown,
  TrendingUp, Users, Building2, Award, Star, Target, BarChart2, Clock, Globe,
  Shield, Zap, Heart, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench,
  DollarSign, Hash, Phone, Crown,
} from 'lucide-react';
import { createVipNumber, getVipNumberById, updateVipNumber } from '../../services/VipNumbersService';

const VIP_ICONS = [
  { name: 'Star',        Component: Star        },
  { name: 'Crown',       Component: Crown       },
  { name: 'Gem',         Component: Gem         },
  { name: 'Trophy',      Component: Trophy      },
  { name: 'Phone',       Component: Phone       },
  { name: 'Hash',        Component: Hash        },
  { name: 'DollarSign',  Component: DollarSign  },
  { name: 'Zap',         Component: Zap         },
  { name: 'Heart',       Component: Heart       },
  { name: 'Shield',      Component: Shield      },
  { name: 'Award',       Component: Award       },
  { name: 'Rocket',      Component: Rocket      },
  { name: 'Target',      Component: Target      },
  { name: 'TrendingUp',  Component: TrendingUp  },
  { name: 'Globe',       Component: Globe       },
  { name: 'Users',       Component: Users       },
  { name: 'Building2',   Component: Building2   },
  { name: 'BarChart2',   Component: BarChart2   },
  { name: 'Clock',       Component: Clock       },
  { name: 'ThumbsUp',    Component: ThumbsUp    },
  { name: 'Lightbulb',   Component: Lightbulb   },
  { name: 'Wrench',      Component: Wrench      },
] as const;

function renderIcon(name: string, size = 16) {
  const found = VIP_ICONS.find(i => i.name === name);
  if (!found) return null;
  const Comp = found.Component;
  return <Comp size={size} />;
}

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:border-[#D32F2F] focus:outline-none focus:border-[#D32F2F] bg-white transition-colors"
      >
        <span className="flex items-center justify-center w-5 h-5 text-[#D32F2F] flex-shrink-0">
          {value
            ? renderIcon(value, 16)
            : <span className="w-4 h-4 border border-dashed border-gray-300 rounded block" />}
        </span>
        <span className={value ? 'text-[#212121]' : 'text-[#9E9E9E]'}>{value || 'Select icon'}</span>
        <ChevronDown size={14} className="ml-auto text-[#616161]" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`w-full mb-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              !value
                ? 'bg-red-100 text-[#D32F2F] border-[#D32F2F]/30'
                : 'text-[#616161] border-gray-200 hover:bg-gray-50'
            }`}
          >
            None
          </button>
          <div className="grid grid-cols-5 gap-1.5">
            {VIP_ICONS.map(({ name, Component }) => (
              <div key={name} className="relative group flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => { onChange(name); setOpen(false); }}
                  className={`p-2 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors w-full ${
                    value === name ? 'bg-red-100 text-[#D32F2F]' : 'text-[#616161]'
                  }`}
                >
                  <Component size={18} />
                </button>
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const CATEGORIES = ['Premium', 'Gold', 'Silver', 'Platinum', 'Diamond', 'Bronze'];

interface FormState {
  icon: string;
  vipNumber: string;
  category: string;
  description: string;
  price: string;
  status: number;
}

const EMPTY: FormState = {
  icon: '',
  vipNumber: '',
  category: '',
  description: '',
  price: '',
  status: 1,
};

export default function VipNumberForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await getVipNumberById(id!);
        const d = res?.data;
        if (d) {
          setForm({
            icon: d.icon ?? '',
            vipNumber: d.vipNumber ?? '',
            category: d.category ?? '',
            description: d.description ?? '',
            price: d.price != null ? String(d.price) : '',
            status: d.status ?? 1,
          });
        }
      } catch {
        setApiError('Failed to load VIP number.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 3500);
      return () => clearTimeout(t);
    }
  }, [saved]);

  const set = (key: keyof FormState, val: string | number) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.vipNumber.trim()) errs.vipNumber = 'VIP Number is required';
    if (!form.category) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError(null);
    try {
      const payload = {
        icon: form.icon || null,
        vipNumber: form.vipNumber,
        category: form.category,
        description: form.description || null,
        price: form.price ? Number(form.price) : null,
        status: form.status,
      };
      if (isEdit) {
        await updateVipNumber(id!, payload);
      } else {
        await createVipNumber(payload);
      }
      setSaved(true);
      if (!isEdit) setTimeout(() => navigate('/admin/vip-numbers'), 1200);
    } catch {
      setApiError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/admin/vip-numbers')}
        className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium mb-3 transition-colors"
      >
        <ChevronLeft size={15} /> Back to VIP Numbers
      </button>

      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {isEdit ? 'Edit VIP Number' : 'Add VIP Number'}
          </h1>
          <p className="text-xs text-[#9E9E9E] mt-0.5">
            {isEdit ? 'Update the VIP number details' : 'Fill in the details to add a new VIP number'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">

          {/* Icon */}
          <div>
            <label className="block text-xs font-semibold text-[#212121] mb-1.5">Icon</label>
            <IconPicker value={form.icon} onChange={val => set('icon', val)} />
          </div>

          {/* VIP Number */}
          <div>
            <label className="block text-xs font-semibold text-[#212121] mb-1.5">
              VIP Number <span className="text-[#D32F2F]">*</span>
            </label>
            <input
              type="text"
              value={form.vipNumber}
              onChange={e => set('vipNumber', e.target.value)}
              placeholder="e.g. 9999999999"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors text-[#212121] placeholder:text-gray-400 ${
                errors.vipNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#D32F2F]'
              }`}
            />
            {errors.vipNumber && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.vipNumber}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#212121] mb-1.5">
              Category <span className="text-[#D32F2F]">*</span>
            </label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors text-[#212121] bg-white ${
                errors.category ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#D32F2F]'
              }`}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.category}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-[#212121] mb-1.5">Price (₹)</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] transition-colors text-[#212121] placeholder:text-gray-400"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-[#212121] mb-1.5">Status</label>
            <div className="flex items-center gap-4">
              {[{ val: 1, label: 'Active' }, { val: 0, label: 'Inactive' }].map(opt => (
                <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={form.status === opt.val}
                    onChange={() => set('status', opt.val)}
                    className="accent-[#D32F2F]"
                  />
                  <span className="text-sm text-[#212121]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#212121] mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Add a description…"
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] transition-colors text-[#212121] placeholder:text-gray-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-1">
          {saved && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium mr-auto">
              <CheckCircle size={14} /> Saved successfully
            </div>
          )}
          {apiError && (
            <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium mr-auto">
              <AlertCircle size={14} /> {apiError}
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate('/admin/vip-numbers')}
            className="px-5 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}
