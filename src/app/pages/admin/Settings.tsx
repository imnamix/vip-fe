import { useState, useEffect } from 'react';
import { MessageCircle, Save, CheckCircle, Eye, EyeOff, Wifi } from 'lucide-react';
import { useContext } from 'react';
import { AdminThemeContext } from '../../context/AdminThemeContext';
import { getWhatsappSettings, saveWhatsappSettings } from '../../services/WhatsappSettingsService';

interface WhatsappForm {
  appId: string;
  appSecret: string;
  accessToken: string;
  verifyToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookUrl: string;
  isActive: boolean;
}

const EMPTY: WhatsappForm = {
  appId: '',
  appSecret: '',
  accessToken: '',
  verifyToken: '',
  phoneNumberId: '',
  businessAccountId: '',
  webhookUrl: '',
  isActive: false,
};

const FIELDS: { key: keyof WhatsappForm; label: string; placeholder: string; secret?: boolean }[] = [
  { key: 'appId',             label: 'App ID',               placeholder: 'Enter WhatsApp App ID'                },
  { key: 'appSecret',         label: 'App Secret',           placeholder: 'Enter App Secret',        secret: true },
  { key: 'accessToken',       label: 'Access Token',         placeholder: 'Enter Access Token',      secret: true },
  { key: 'verifyToken',       label: 'Verify Token',         placeholder: 'Enter Verify Token',      secret: true },
  { key: 'phoneNumberId',     label: 'Phone Number ID',      placeholder: 'Enter Phone Number ID'               },
  { key: 'businessAccountId', label: 'Business Account ID',  placeholder: 'Enter Business Account ID'           },
  { key: 'webhookUrl',        label: 'Webhook URL',          placeholder: 'https://yourdomain.com/webhook'      },
];

export default function Settings() {
  const isDark = useContext(AdminThemeContext);
  const [activeModule, setActiveModule] = useState<'whatsapp'>('whatsapp');
  const [form, setForm] = useState<WhatsappForm>(EMPTY);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getWhatsappSettings()
      .then(res => {
        if (res?.data && Object.keys(res.data).length > 0) {
          setForm({ ...EMPTY, ...res.data });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof WhatsappForm, value: string | boolean) => {
    setSaved(false);
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveWhatsappSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // keep form intact for retry
    } finally {
      setSaving(false);
    }
  };

  const card = isDark ? 'bg-[#1a1d26] border border-white/5' : 'bg-white border border-gray-100';
  const input = isDark
    ? 'bg-[#0f1115] border-white/10 text-white placeholder:text-gray-600 focus:border-[#D32F2F]'
    : 'bg-gray-50 border-gray-200 text-[#212121] placeholder:text-gray-400 focus:border-[#D32F2F] focus:bg-white';
  const label = isDark ? 'text-gray-300' : 'text-[#424242]';
  const sideItem = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all ${
      active
        ? 'bg-red-50 dark:bg-red-900/20 text-[#D32F2F] border-l-4 border-[#D32F2F]'
        : isDark
        ? 'text-gray-400 hover:bg-white/5 hover:text-white'
        : 'text-[#616161] hover:bg-gray-50 hover:text-[#212121]'
    }`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#212121]'}`}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Settings
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-[#9E9E9E]'}`}>
          Manage integrations and platform configuration
        </p>
      </div>

      <div className="flex gap-6">
        {/* Left module nav */}
        <aside className={`w-52 flex-shrink-0 rounded-2xl shadow-sm p-3 h-fit ${card}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-widest px-4 pt-1 pb-2 ${isDark ? 'text-gray-500' : 'text-[#9E9E9E]'}`}>
            Integrations
          </p>
          <div
            className={sideItem(activeModule === 'whatsapp')}
            onClick={() => setActiveModule('whatsapp')}
          >
            <MessageCircle size={16} />
            WhatsApp
          </div>
        </aside>

        {/* Right content */}
        <div className="flex-1 min-w-0">
          {activeModule === 'whatsapp' && (
            <div className={`rounded-2xl shadow-sm ${card}`}>
              {/* Section header */}
              <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <MessageCircle size={20} className="text-green-500" />
                  </div>
                  <div>
                    <h2
                      className={`font-bold text-base ${isDark ? 'text-white' : 'text-[#212121]'}`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      WhatsApp Business API
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-[#9E9E9E]'}`}>
                      Meta / Facebook Cloud API credentials
                    </p>
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-[#616161]'}`}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div
                    onClick={() => handleChange('isActive', !form.isActive)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : isDark ? 'bg-gray-700' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`}
                    />
                  </div>
                </label>
              </div>

              {loading ? (
                <div className="px-6 py-16 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#D32F2F] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {FIELDS.map(({ key, label: lbl, placeholder, secret }) => (
                      <div key={key} className={key === 'webhookUrl' || key === 'accessToken' ? 'md:col-span-2' : ''}>
                        <label className={`block text-xs font-semibold mb-1.5 ${label}`}>
                          {lbl}
                        </label>
                        <div className="relative">
                          <input
                            type={secret && !revealed[key] ? 'password' : 'text'}
                            value={form[key] as string}
                            onChange={e => handleChange(key, e.target.value)}
                            placeholder={placeholder}
                            className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors ${input} ${secret ? 'pr-10' : ''}`}
                          />
                          {secret && (
                            <button
                              type="button"
                              onClick={() => setRevealed(r => ({ ...r, [key]: !r[key] }))}
                              className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              {revealed[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connection status hint */}
                  <div className={`mt-5 flex items-start gap-2.5 p-3.5 rounded-xl text-xs ${isDark ? 'bg-white/5 text-gray-400' : 'bg-blue-50 text-blue-700'}`}>
                    <Wifi size={14} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Credentials are stored securely. Make sure your <strong>Webhook URL</strong> is publicly accessible and matches the URL configured in your Meta App Dashboard.
                    </span>
                  </div>

                  {/* Save */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm hover:bg-[#B71C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <Save size={15} />
                      {saving ? 'Saving…' : 'Save Settings'}
                    </button>

                    {saved && (
                      <span className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
                        <CheckCircle size={15} />
                        Saved successfully
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
