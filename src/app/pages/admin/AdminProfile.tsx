import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft, Camera, Save, Lock, CheckCircle,
  AlertCircle, Eye, EyeOff, RefreshCw, Loader2,
} from 'lucide-react';
import { getUserByID, updateUser, changePassword, uploadProfilePicture } from '../../services/UserService';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileForm {
  name: string;
  phone: string;
  email: string;
  roleName: string;
  profilePicture: string;
}

interface PasswordForm {
  current: string;
  newPass: string;
  confirm: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?';
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storedUser = getStoredUser();
  const userId: number | null = storedUser?.id ?? null;

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name:           storedUser?.name           ?? '',
    phone:          storedUser?.phone          ?? '',
    email:          storedUser?.email          ?? '',
    roleName:       storedUser?.roleName       ?? storedUser?.role?.name ?? '',
    profilePicture: storedUser?.profilePicture ?? '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });

  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordMsg,   setPasswordMsg]   = useState<{ ok: boolean; text: string } | null>(null);

  // ── Load fresh profile ──────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const res = await getUserByID(userId);
      const u = res?.data ?? res;
      setProfileForm({
        name:           u.name           ?? '',
        phone:          u.phone          ?? '',
        email:          u.email          ?? '',
        roleName:       u.roleName       ?? (typeof u.role === 'string' ? u.role : u.role?.name ?? ''),
        profilePicture: u.profilePicture ?? '',
      });
    } catch {
      // keep localStorage values
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Upload photo ────────────────────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Reset so same file can be re-selected
    e.target.value = '';

    setUploadingPhoto(true);
    setProfileMsg(null);
    try {
      const url = await uploadProfilePicture(file);
      await updateUser({ profilePicture: url }, userId);
      setProfileForm(f => ({ ...f, profilePicture: url }));
      // Sync localStorage
      const updated = { ...getStoredUser(), profilePicture: url };
      localStorage.setItem('admin_user', JSON.stringify(updated));
      setProfileMsg({ ok: true, text: 'Profile photo updated.' });
    } catch {
      setProfileMsg({ ok: false, text: 'Failed to upload photo. Please try again.' });
    } finally {
      setUploadingPhoto(false);
      setTimeout(() => setProfileMsg(null), 3500);
    }
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) { setProfileMsg({ ok: false, text: 'Name is required.' }); return; }
    if (!userId) { setProfileMsg({ ok: false, text: 'User not found.' }); return; }
    setSaving(true);
    setProfileMsg(null);
    try {
      const res = await updateUser({ name: profileForm.name, phone: profileForm.phone }, userId);
      if (res?.success === false) throw new Error(res.message);
      const updated = { ...getStoredUser(), name: profileForm.name, phone: profileForm.phone };
      localStorage.setItem('admin_user', JSON.stringify(updated));
      setProfileMsg({ ok: true, text: 'Profile updated successfully.' });
    } catch (e: any) {
      setProfileMsg({ ok: false, text: e?.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setProfileMsg(null), 3500);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!passwordForm.current.trim()) { setPasswordMsg({ ok: false, text: 'Current password is required.' }); return; }
    if (passwordForm.newPass.length < 8) { setPasswordMsg({ ok: false, text: 'New password must be at least 8 characters.' }); return; }
    if (passwordForm.newPass !== passwordForm.confirm) { setPasswordMsg({ ok: false, text: 'Passwords do not match.' }); return; }
    if (!userId) { setPasswordMsg({ ok: false, text: 'User not found.' }); return; }
    setSavingPw(true);
    setPasswordMsg(null);
    try {
      const res = await changePassword(userId, passwordForm.current, passwordForm.newPass);
      if (res?.success === false) throw new Error(res.message);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setPasswordMsg({ ok: true, text: 'Password changed successfully.' });
    } catch (e: any) {
      setPasswordMsg({ ok: false, text: e?.response?.data?.message || e?.message || 'Failed to change password.' });
    } finally {
      setSavingPw(false);
      setTimeout(() => setPasswordMsg(null), 3500);
    }
  };

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-5">
        <div className="h-8 w-32 bg-gray-100 rounded-xl" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-2">
              <div className="w-40 h-5 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-100 rounded-full" />
            </div>
          </div>
          {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="max-w-2xl mx-auto">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <h1
            className="text-xl font-bold text-[#212121]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            My Profile
          </h1>
        </div>

        <div className="space-y-5">
          {/* ── Profile Card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {/* Avatar + meta */}
            <div className="flex items-start gap-5 mb-6">
              <div className="relative flex-shrink-0">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                  {profileForm.profilePicture ? (
                    <img
                      src={profileForm.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white text-2xl font-bold select-none">
                      {getInitials(profileForm.name)}
                    </div>
                  )}
                </div>

                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#D32F2F] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#B71C1C] disabled:opacity-70 transition-colors"
                  title="Change photo"
                >
                  {uploadingPhoto ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Camera size={12} />
                  )}
                </button>
              </div>

              <div>
                <h2
                  className="text-xl font-bold text-[#212121]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {profileForm.name || "Admin"}
                </h2>
                {profileForm.roleName && (
                  <span className="inline-block bg-red-50 text-[#D32F2F] text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">
                    {profileForm.roleName}
                  </span>
                )}
                <p className="text-xs text-[#9E9E9E] mt-2">
                  {profileForm.email}
                </p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                  Email Address
                  <span className="ml-1.5 text-[10px] normal-case font-normal text-gray-400">
                    (cannot change)
                  </span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              {profileForm.roleName && (
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    Role
                    <span className="ml-1.5 text-[10px] normal-case font-normal text-gray-400">
                      (cannot change)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.roleName}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            {profileMsg && (
              <div
                className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${profileMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}
              >
                {profileMsg.ok ? (
                  <CheckCircle size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {profileMsg.text}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] text-white rounded-xl font-semibold text-sm hover:bg-[#B71C1C] disabled:opacity-60 transition-colors"
              >
                {saving ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Change Password ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                <Lock size={15} className="text-[#D32F2F]" />
              </div>
              <h3
                className="font-bold text-[#212121]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Change Password
              </h3>
            </div>

            <div className="space-y-3">
              {(
                [
                  ["current", "Current Password"],
                  ["newPass", "New Password"],
                  ["confirm", "Confirm New Password"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw[key] ? "text" : "password"}
                      value={passwordForm[key]}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPw((v) => ({ ...v, [key]: !v[key] }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#616161]"
                    >
                      {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {passwordMsg && (
              <div
                className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${passwordMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}
              >
                {passwordMsg.ok ? (
                  <CheckCircle size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {passwordMsg.text}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={savingPw}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#212121] text-white rounded-xl font-semibold text-sm hover:bg-black disabled:opacity-60 transition-colors"
              >
                {savingPw ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Updating…
                  </>
                ) : (
                  <>
                    <Lock size={14} /> Update Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
