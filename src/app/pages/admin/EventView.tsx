import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ChevronLeft, Edit, Calendar, MapPin, IndianRupee, Users,
  Clock, Loader2, AlertCircle, ImageOff, Images,
} from 'lucide-react';
import { getEventsByID } from '../../services/EventsService';
import ImagePreviewPopup from '../../components/ImagePreviewPopup';

interface MediaItem { media_url: string; media_type: string }
interface ScheduleItem { time: string; title: string }

interface EventData {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  endTime: string;
  location: string;
  seats: number | null;
  fees: string;
  eventStatus: string;
  mainImage: MediaItem[] | null;
  galleryImages: MediaItem[] | null;
  schedules: ScheduleItem[] | null;
}

const statusBadge: Record<string, string> = {
  Upcoming: 'bg-blue-500',
  Completed: 'bg-green-500',
  Draft: 'bg-gray-500',
  Cancelled: 'bg-red-500',
};

function formatDate(d: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return d; }
}

function formatTime(t: string) {
  if (!t) return '';
  try {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  } catch { return t; }
}

export default function EventView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEventsByID(id);
        if (res?.success && res?.data) {
          setEvent(res.data);
        } else {
          setError('Event not found.');
        }
      } catch {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#616161] text-sm gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading event…
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-sm text-[#616161]">{error ?? 'Event not found.'}</p>
        <button
          onClick={() => navigate('/admin/events')}
          className="text-sm text-[#D32F2F] font-medium hover:underline"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const heroImg = event.mainImage?.[0]?.media_url ?? '';
  const galleryImgs = (event.galleryImages ?? []).map(g => g.media_url).filter(Boolean);
  const schedules = (event.schedules ?? []).filter(s => s.time || s.title);
  const statusLabel = event.eventStatus ?? 'Draft';

  const timeRange = (() => {
    const start = formatTime(event.eventTime);
    const end = formatTime(event.endTime);
    if (start && end) return `${start} – ${end}`;
    return start || end || '—';
  })();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Events
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-[#212121] font-semibold truncate max-w-48">{event.title}</span>
        <button
          onClick={() => navigate(`/admin/events/${id}/edit`)}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-[#616161] rounded-xl text-sm font-medium hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
        >
          <Edit size={13} /> Edit Event
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative h-52 rounded-2xl overflow-hidden mb-5 bg-gray-100">
        {heroImg ? (
          <img src={heroImg} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageOff size={36} className="text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-5">
          <span
            className={`inline-block text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-1.5 ${statusBadge[statusLabel] ?? 'bg-gray-500'}`}
          >
            {statusLabel}
          </span>
          <h1
            className="text-2xl font-bold text-white drop-shadow"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {event.title}
          </h1>
        </div>
      </div>

      {/* Event Info + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Event Info
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 text-sm text-[#616161]">
              <Calendar size={15} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
              <span>{formatDate(event.eventDate)}</span>
            </div>
            {timeRange !== '—' && (
              <div className="flex items-start gap-2.5 text-sm text-[#616161]">
                <Clock size={15} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
                <span>{timeRange}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-start gap-2.5 text-sm text-[#616161]">
                <MapPin size={15} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
                <span>{event.location}</span>
              </div>
            )}
            {event.fees && (
              <div className="flex items-start gap-2.5 text-sm text-[#616161]">
                <IndianRupee size={15} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
                <span>{event.fees}</span>
              </div>
            )}
            {event.seats != null && (
              <div className="flex items-start gap-2.5 text-sm text-[#616161]">
                <Users size={15} className="text-[#D32F2F] flex-shrink-0 mt-0.5" />
                <span>{event.seats.toLocaleString()} seats</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-[#616161] uppercase tracking-wider mb-2">Description</h4>
              <div
                className="text-sm text-[#616161] leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-4 content-start">
          {[
            { label: 'Event Date', value: formatDate(event.eventDate), color: '#D32F2F' },
            { label: 'Total Seats', value: event.seats != null ? event.seats.toLocaleString() : '—', color: '#2196F3' },
            { label: 'Entry Fee', value: event.fees || 'Free', color: '#4CAF50' },
            { label: 'Status', value: statusLabel, color: statusLabel === 'Upcoming' ? '#2196F3' : statusLabel === 'Completed' ? '#4CAF50' : '#9E9E9E' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div
                className="text-lg font-bold truncate"
                style={{ fontFamily: 'Poppins, sans-serif', color }}
              >
                {value}
              </div>
              <div className="text-xs text-[#616161] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule */}
      {schedules.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Schedule
          </h3>
          <div className="space-y-3">
            {schedules.map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 text-xs font-semibold text-[#D32F2F] pt-0.5">
                  {formatTime(s.time) || s.time || '—'}
                </div>
                <div className="flex-1 flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#D32F2F] mt-1.5" />
                  <span className="text-sm text-[#212121]">{s.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {galleryImgs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Images size={15} className="text-[#D32F2F]" />
            <h3 className="font-bold text-[#212121] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Event Gallery
            </h3>
            <span className="text-xs text-[#9E9E9E] ml-auto">{galleryImgs.length} photos</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {galleryImgs.map((url, i) => (
              <div
                key={i}
                className="relative group cursor-pointer"
                onClick={() => setImgPreview(url)}
              >
                <img
                  src={url}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-24 object-cover rounded-xl border border-gray-200 group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <span className="text-white text-[10px] font-medium bg-black/40 px-2 py-0.5 rounded-full">Preview</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ImagePreviewPopup
        open={!!imgPreview}
        onClose={() => setImgPreview(null)}
        imageUrl={imgPreview ?? ''}
        title="Gallery Preview"
      />
    </div>
  );
}
