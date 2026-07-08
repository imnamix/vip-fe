import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
};

export default function ImagePreviewPopup({ open, onClose, imageUrl, title }: Props) {
  if (!open || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#1e2133] rounded-2xl shadow-2xl dark:shadow-black/50 overflow-hidden max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
          <span className="font-semibold text-sm text-[#212121] dark:text-white">{title || 'Image Preview'}</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-[#616161] dark:text-gray-300" />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center min-h-[200px] bg-gray-50 dark:bg-[#13151e]">
          <img
            src={imageUrl}
            alt={title || 'Preview'}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
