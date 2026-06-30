import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, Edit, Trash2, Users, ChevronLeft, ChevronRight, Search, Save, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import { getAllUsers, getUserByID, addUser, updateUser, deleteUsers } from '../../services/UserService';
import { getAllRoles } from '../../services/RoleService';
import { usePermission } from '../../hooks/usePermission';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  mobile: string;
  roleName: string;
  status: string;
  profilePicture?: string;
  created_at?: string;
}

function normalizeUser(raw: any): AdminUser {
  const roleRaw = raw.role;
  const roleName: string =
    raw.roleName ??
    (typeof roleRaw === 'string' ? roleRaw : roleRaw?.name ?? roleRaw?.role ?? '');

  const statusRaw = raw.status ?? '';
  const status =
    statusRaw === 'ACTIVE'   ? 'Active'
    : statusRaw === 'INACTIVE' ? 'Inactive'
    : statusRaw || 'Active';

  return {
    id:             raw.id,
    name:           raw.name ?? '',
    email:          raw.email ?? '',
    mobile:         raw.phone ?? raw.mobile ?? '',
    roleName,
    status,
    profilePicture: raw.profilePicture ?? undefined,
    created_at:     raw.created_at,
  };
}

function roleBadgeClass(roleName: string): string {
  const key = roleName.toLowerCase();
  if (key.includes('super'))    return 'bg-red-100 text-[#D32F2F]';
  if (key.includes('admin'))    return 'bg-orange-100 text-orange-700';
  if (key.includes('content'))  return 'bg-blue-100 text-blue-700';
  if (key.includes('sales'))    return 'bg-green-100 text-green-700';
  if (key.includes('delivery')) return 'bg-purple-100 text-purple-700';
  return 'bg-gray-100 text-gray-600';
}

const LIMIT = 10;
const emptyForm = { name: '', email: '', mobile: '', roleName: '', status: 'Active', password: '' };

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-gray-50 animate-pulse">
          <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gray-100" /><div className="w-24 h-3 bg-gray-100 rounded" /></div></td>
          <td className="px-4 py-3"><div className="w-36 h-3 bg-gray-100 rounded" /></td>
          <td className="px-4 py-3"><div className="w-28 h-3 bg-gray-100 rounded" /></td>
          <td className="px-4 py-3"><div className="w-20 h-5 bg-gray-100 rounded-full" /></td>
          <td className="px-4 py-3"><div className="w-14 h-5 bg-gray-100 rounded-full" /></td>
          <td className="px-4 py-3"><div className="w-20 h-3 bg-gray-100 rounded" /></td>
          <td className="px-4 py-3"><div className="w-12 h-6 bg-gray-100 rounded-lg" /></td>
        </tr>
      ))}
    </>
  );
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();

  // mode and editUserId are URL-driven — survives refresh
  const mode       = searchParams.get('mode') === 'form' ? 'form' : 'list';
  const editUserId = searchParams.get('id') ?? null;

  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError]   = useState('');

  const [roleOptions, setRoleOptions]   = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const [userForm, setUserForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { can }      = usePermission();
  const canCreate      = can('Users', 'write');
  const canEdit          = can('Users', 'update');
  const canDelete          = can('Users', 'delete');
  const showActions          = canEdit || canDelete;

  const [previewPic, setPreviewPic] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getAllUsers(p, LIMIT, q || undefined);
      const raw: any[] = res?.data ?? res ?? [];
      setUsers(raw.map(normalizeUser));
      setTotal(res?.count ?? res?.total ?? raw.length);
    } catch {
      setFetchError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await getAllRoles();
      const list: any[] = res?.data ?? res ?? [];
      setRoleOptions(
        list
          .map((r: any) => r.name)
          .filter((name: string) => Boolean(name) && name.trim().toLowerCase() !== 'super admin'),
      );
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, '');
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // ── Restore form on refresh ────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'form') return;

    if (editUserId) {
      setFormLoading(true);
      getUserByID(editUserId)
        .then(res => {
          const raw = res?.data ?? res;
          if (raw) {
            const u = normalizeUser(raw);
            setUserForm({ name: u.name, email: u.email, mobile: u.mobile, roleName: u.roleName, status: u.status, password: '' });
          } else {
            setSearchParams({});
          }
        })
        .catch(() => setSearchParams({}))
        .finally(() => setFormLoading(false));
    } else {
      setUserForm({ ...emptyForm });
    }
    // only on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchUsers(1, q); }, 350);
  };

  const handlePageChange = (p: number) => { setPage(p); fetchUsers(p, search); };

  // ── Form helpers ───────────────────────────────────────────────────────────
  const openNew = () => {
    setUserForm({ ...emptyForm, roleName: roleOptions[0] ?? '' });
    setSaveError('');
    setShowPassword(false);
    setSearchParams({ mode: 'form' });
  };

  const openEdit = async (u: AdminUser) => {
    setSaveError('');
    setShowPassword(false);
    setUserForm({ name: u.name, email: u.email, mobile: u.mobile, roleName: u.roleName, status: u.status, password: '' });
    setSearchParams({ mode: 'form', id: String(u.id) });
    try {
      const res = await getUserByID(u.id);
      const fresh = normalizeUser(res?.data ?? res ?? u);
      setUserForm({ name: fresh.name, email: fresh.email, mobile: fresh.mobile, roleName: fresh.roleName, status: fresh.status, password: '' });
    } catch {
      // keep data already set
    }
  };

  const handleBack = () => { setSaveError(''); setSearchParams({}); };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (sendWelcome = false) => {
    if (!userForm.name.trim())  { setSaveError('Full name is required.'); return; }
    if (!userForm.email.trim()) { setSaveError('Email is required.'); return; }
    if (!editUserId && !userForm.password.trim()) { setSaveError('Password is required.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const payload: any = {
        name:        userForm.name,
        email:       userForm.email,
        phone:       userForm.mobile,
        roleName:    userForm.roleName,
        status:      userForm.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
        sendWelcome,
      };
      if (userForm.password.trim()) payload.password = userForm.password;
      if (editUserId !== null) {
        await updateUser(payload, editUserId);
      } else {
        await addUser(payload);
      }
      await fetchUsers(page, search);
      setSearchParams({});
    } catch {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteUsers({ ids: [deleteId] } as any);
      await fetchUsers(page, search);
      setDeleteId(null);
    } catch {
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const isSuperAdminUser = (roleName: string) => roleName?.trim().toLowerCase() === 'super admin';
  const isSuperAdminEdit = Boolean(editUserId) && isSuperAdminUser(userForm.roleName);
  const displayRoleOptions = !userForm.roleName || roleOptions.includes(userForm.roleName)
    ? roleOptions
    : [...roleOptions, userForm.roleName];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        {mode === 'list' ? (
          <>
            <div>
              <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>User Management</h1>
              <p className="text-[#616161] text-xs">
                {loading ? 'Loading…' : `${total} user${total !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(page, search)}
                title="Refresh"
                className="p-2 border border-gray-200 rounded-xl text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              {canCreate && (
                <button
                  onClick={openNew}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
                >
                  <Plus size={13} /> Add User
                </button>
              )}
            </div>
          </>
        ) : (
          <button onClick={handleBack} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium">
            <ChevronLeft size={15} /> Back to Users
          </button>
        )}
      </div>

      {/* ═══════════════ LIST ═══════════════ */}
      {mode === 'list' && (
        <div>
          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex gap-3 items-center">
            <div className="relative flex-1 min-w-40">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
              />
              {search && (
                <button onClick={() => handleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#616161] whitespace-nowrap">
              <Users size={13} />
              <span>{total} user{total !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
              {fetchError}
              <button onClick={() => fetchUsers(page, search)} className="text-[#D32F2F] font-semibold text-xs hover:underline">Retry</button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['User', 'Email', 'Mobile', 'Role', 'Status', 'Joined', ...(showActions ? ['Actions'] : [])].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <SkeletonRows count={LIMIT} />
                    : users.length === 0
                      ? (
                        <tr>
                          <td colSpan={showActions ? 7 : 6} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center gap-2 text-[#9E9E9E]">
                              <Users size={28} className="opacity-30" />
                              <span className="text-sm">{search ? 'No users found' : 'No users yet'}</span>
                              {!search && canCreate && <button onClick={openNew} className="text-sm text-[#D32F2F] font-semibold hover:underline mt-1">Add the first user</button>}
                            </div>
                          </td>
                        </tr>
                      )
                      : users.map(u => {
                        const joined = u.created_at
                          ? new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—';
                        const initials = (u.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                        return (
                          <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {/* Avatar — shows profile pic if available, initials otherwise */}
                                <button
                                  type="button"
                                  onClick={() => u.profilePicture && setPreviewPic(u.profilePicture)}
                                  className={`w-7 h-7 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center transition-opacity ${u.profilePicture ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                                  title={u.profilePicture ? 'View photo' : undefined}
                                >
                                  {u.profilePicture ? (
                                    <img src={u.profilePicture} alt={u.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#D32F2F] to-[#FBC02D] flex items-center justify-center text-white text-[10px] font-bold">
                                      {initials}
                                    </div>
                                  )}
                                </button>
                                <span className="text-sm font-medium text-[#212121] whitespace-nowrap">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#616161]">{u.email}</td>
                            <td className="px-4 py-3 text-sm text-[#616161] whitespace-nowrap">{u.mobile || '—'}</td>
                            <td className="px-4 py-3">
                              {u.roleName
                                ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass(u.roleName)}`}>{u.roleName}</span>
                                : <span className="text-xs text-[#9E9E9E]">—</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">{joined}</td>
                            {showActions && (
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  {canEdit && (
                                    <button onClick={() => openEdit(u)} className="p-1.5 text-[#FBC02D] hover:bg-yellow-50 rounded-lg transition-colors"><Edit size={13} /></button>
                                  )}
                                  {canDelete && !isSuperAdminUser(u.roleName) && (
                                    <button onClick={() => setDeleteId(u.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
                <span className="text-xs text-[#616161]">
                  {total === 0 ? '0 results' : `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`}
                </span>
                <div className="flex gap-1.5">
                  <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors">
                    <ChevronLeft size={12} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-[#D32F2F] text-white' : 'border border-gray-200 hover:border-[#D32F2F] text-[#616161]'}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F] transition-colors">
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ FORM ═══════════════ */}
      {mode === 'form' && (
        <div className="flex justify-center">
          {formLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-4 px-8 w-full max-w-lg animate-pulse h-96" />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 py-4 px-8 w-full max-w-lg">
              <div className="text-start mb-4">
                <h2 className="text-lg font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {editUserId ? 'Edit User' : 'Create New User'}
                </h2>
                <p className="text-xs text-[#616161] mt-1">
                  {editUserId ? 'Update user details and role assignment' : 'Fill in the details to add a new admin user'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Anita Sharma"
                    disabled={isSuperAdminEdit}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="user@vipnumerology.com"
                    disabled={isSuperAdminEdit}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Mobile</label>
                  <input
                    type="tel"
                    value={userForm.mobile}
                    onChange={e => setUserForm(f => ({ ...f, mobile: e.target.value }))}
                    placeholder="+91 98000 00000"
                    disabled={isSuperAdminEdit}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                    Password {!editUserId && '*'}{editUserId && <span className="text-[10px] normal-case font-normal ml-1">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userForm.password}
                      onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                      placeholder={editUserId ? '••••••••' : 'Min. 8 characters'}
                      disabled={isSuperAdminEdit}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      disabled={isSuperAdminEdit}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#616161] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Role + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Role</label>
                    {displayRoleOptions.length > 0 ? (
                      <select
                        value={userForm.roleName}
                        onChange={e => setUserForm(f => ({ ...f, roleName: e.target.value }))}
                        disabled={isSuperAdminEdit}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <option value="">Select a role</option>
                        {displayRoleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={userForm.roleName}
                        onChange={e => setUserForm(f => ({ ...f, roleName: e.target.value }))}
                        placeholder="Role name"
                        disabled={isSuperAdminEdit}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Status</label>
                    <select
                      value={userForm.status}
                      onChange={e => setUserForm(f => ({ ...f, status: e.target.value }))}
                      disabled={isSuperAdminEdit}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {['Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {isSuperAdminEdit && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700">
                  The Super Admin account cannot be modified from here.
                </div>
              )}

              {saveError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">{saveError}</div>
              )}

              <div className="flex gap-3 mt-7">
                <button
                  onClick={handleBack}
                  disabled={saving}
                  className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold hover:border-[#D32F2F] hover:text-[#D32F2F] disabled:opacity-60 transition-colors"
                >
                  Cancel
                </button>
                {!isSuperAdminEdit && (
                  <button
                    onClick={() => handleSave(!editUserId)}
                    disabled={saving}
                    className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] disabled:opacity-60 transition-colors"
                  >
                    {saving
                      ? <><RefreshCw size={13} className="animate-spin" /> Saving…</>
                      : <><Save size={13} /> {editUserId ? 'Update' : 'Create'}</>
                    }
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile picture preview popup */}
      {previewPic && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewPic(null)}
        >
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewPic(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 z-10"
            >
              <X size={14} className="text-[#616161]" />
            </button>
            <img
              src={previewPic}
              alt="Profile"
              className="w-full rounded-2xl shadow-2xl object-cover max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => !deleting && setDeleteId(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={18} className="text-[#D32F2F]" />
            </div>
            <h3 className="font-bold text-[#212121] mb-2">Delete User?</h3>
            <p className="text-sm text-[#616161] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <><RefreshCw size={13} className="animate-spin" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
