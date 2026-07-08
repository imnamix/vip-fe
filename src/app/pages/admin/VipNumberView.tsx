import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronLeft, Edit, Hash, Tag, IndianRupee, Loader2, AlertCircle, Star,
  TrendingUp, Users, Building2, Award, Target, BarChart2, Clock, Globe,
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
  rating: number | null;
  numerologyScore: string | null;
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

const cardCls = 'bg-white dark:bg-[#1a1d26] rounded-2xl border border-gray-100 dark:border-white/6';

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
      <div className="flex items-center justify-center py-24 text-[#616161] dark:text-gray-400 text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-[#616161] dark:text-gray-400">
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
        className="flex items-center gap-1.5 text-[#616161] dark:text-gray-400 hover:text-[#D32F2F] text-sm font-medium mb-3 transition-colors"
      >
        <ChevronLeft size={15} /> Back to VIP Numbers
      </button>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Hero card */}
        <div className={`${cardCls} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-[#D32F2F] flex-shrink-0">
                {renderIcon(item.icon, 28)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[#212121] dark:text-white tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {item.vipNumber || '—'}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                    item.status === 1 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {item.category && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/admin/vip-numbers/${item.id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-white/10 text-[#616161] dark:text-gray-400 rounded-xl text-sm font-semibold hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors flex-shrink-0"
            >
              <Edit size={13} /> Edit
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`${cardCls} p-5 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <Hash size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-[#9E9E9E] dark:text-gray-500 font-medium mb-0.5">VIP Number</div>
              <div className="text-base font-bold text-[#212121] dark:text-white tracking-wide">{item.vipNumber || '—'}</div>
            </div>
          </div>

          <div className={`${cardCls} p-5 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
              <Tag size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-[#9E9E9E] dark:text-gray-500 font-medium mb-0.5">Category</div>
              <div className="text-base font-bold text-[#212121] dark:text-white">{item.category || '—'}</div>
            </div>
          </div>

          <div className={`${cardCls} p-5 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <IndianRupee size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs text-[#9E9E9E] dark:text-gray-500 font-medium mb-0.5">Price</div>
              <div className="text-2xl font-bold text-[#212121] dark:text-white">
                {item.price != null ? `₹${Number(item.price).toLocaleString('en-IN')}` : '—'}
              </div>
            </div>
          </div>

          <div className={`${cardCls} p-5 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-[#FFF8E1] dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
              <Star size={16} className="text-[#D32F2F]" />
            </div>
            <div>
              <div className="text-xs text-[#9E9E9E] dark:text-gray-500 font-medium mb-0.5">Rating Score</div>
              <div className="text-2xl font-bold text-[#D32F2F]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {item.rating != null ? (
                  <>{parseFloat(Number(item.rating).toFixed(1))}<span className="text-base text-[#9E9E9E] dark:text-gray-500 font-normal">/10</span></>
                ) : '—'}
              </div>
            </div>
          </div>

          <div className={`${cardCls} p-5 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <Hash size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-[#9E9E9E] dark:text-gray-500 font-medium mb-0.5">Numerology Score</div>
              <div className="text-base font-bold text-[#212121] dark:text-white">{item.numerologyScore || '—'}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className={`${cardCls} p-5`}>
            <h2 className="text-sm font-bold text-[#212121] dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Description
            </h2>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-[#616161] dark:text-gray-400"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </div>
        )}

        {/* Metadata */}
        <div className={`${cardCls} p-5`}>
          <h2 className="text-sm font-bold text-[#212121] dark:text-white mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/5">
              <span className="text-[#9E9E9E] dark:text-gray-500">ID</span>
              <span className="text-[#212121] dark:text-white font-medium">#{item.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/5">
              <span className="text-[#9E9E9E] dark:text-gray-500">Created</span>
              <span className="text-[#212121] dark:text-white">{formatDate(item.created_at)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#9E9E9E] dark:text-gray-500">Last updated</span>
              <span className="text-[#212121] dark:text-white">{formatDate(item.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
