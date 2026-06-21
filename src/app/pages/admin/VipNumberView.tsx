import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronLeft, Edit, Hash, Tag, IndianRupee, Loader2, AlertCircle,
  TrendingUp, Users, Building2, Award, Star, Target, BarChart2, Clock, Globe,
  Shield, Zap, Heart, ThumbsUp, Lightbulb, Trophy, Gem, Rocket, Wrench,
  DollarSign, Phone, Crown,
} from 'lucide-react';

const VIP_ICONS: Record<string, React.ElementType> = {
  Star, Crown, Gem, Trophy, Phone, Hash, DollarSign, Zap, Heart, Shield,
  Award, Rocket, Target, TrendingUp, Globe, Users, Building2, BarChart2,
  Clock, ThumbsUp, Lightbulb, Wrench,
};

function renderIcon(name: string, size = 28) {
  const Comp = VIP_ICONS[name];
  return Comp ? <Comp size={size} /> : <Hash size={size} />;
}
import { getVipNumberById } from '../../services/VipNumbersService';

interface VipNumber {
  id: number;
  icon: string;
  vipNumber: string;
  category: string;
  description: string;
  price: number;
  status: number;
  created_at: string;
  updated_at: string;
}

function formatDate(d: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return d;
  }
}

export default function VipNumberView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<VipNumber | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getVipNumberById(id!);
        setItem(res?.data ?? null);
      } catch {
        setError('Failed to load VIP number.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-[#616161]">
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-sm">{error ?? 'VIP number not found.'}</p>
        <button
          onClick={() => navigate('/admin/vip-numbers')}
          className="text-sm text-[#D32F2F] font-medium hover:underline"
        >
          Back to listing
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/admin/vip-numbers')}
        className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium mb-3 transition-colors"
      >
        <ChevronLeft size={15} /> Back to VIP Numbers
      </button>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-[#D32F2F] flex-shrink-0">
                {renderIcon(item.icon, 28)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[#212121] tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {item.vipNumber || '—'}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                    item.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {item.category && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/admin/vip-numbers/${item.id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors flex-shrink-0"
            >
              <Edit size={13} /> Edit
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Hash size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-[#9E9E9E] font-medium mb-0.5">VIP Number</div>
              <div className="text-base font-bold text-[#212121] tracking-wide">{item.vipNumber || '—'}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Tag size={16} className="text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-[#9E9E9E] font-medium mb-0.5">Category</div>
              <div className="text-base font-bold text-[#212121]">{item.category || '—'}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-3 col-span-2">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <IndianRupee size={16} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs text-[#9E9E9E] font-medium mb-0.5">Price</div>
              <div className="text-2xl font-bold text-[#212121]">
                {item.price != null ? `₹${Number(item.price).toLocaleString('en-IN')}` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-[#212121] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Description
            </h2>
            <div
              className="prose prose-sm max-w-none text-[#616161]"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-[#212121] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-[#9E9E9E]">ID</span>
              <span className="text-[#212121] font-medium">#{item.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-[#9E9E9E]">Created</span>
              <span className="text-[#212121]">{formatDate(item.created_at)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#9E9E9E]">Last updated</span>
              <span className="text-[#212121]">{formatDate(item.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
