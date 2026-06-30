import { Link, useNavigate } from 'react-router';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
        <ShieldX size={40} className="text-[#D32F2F]" />
      </div>

      <h1 className="text-4xl font-bold text-[#212121] dark:text-white mb-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}>
        403
      </h1>
      <h2 className="text-xl font-semibold text-[#424242] dark:text-gray-300 mb-3">
        Access Denied
      </h2>
      <p className="text-[#616161] dark:text-gray-400 max-w-md mb-8">
        You don't have permission to view this page. Contact your administrator
        if you believe this is a mistake.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-[#424242] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
        <Link
          to="/admin"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-medium hover:bg-[#B71C1C] transition-colors"
        >
          <Home size={16} /> Dashboard
        </Link>
      </div>
    </div>
  );
}
