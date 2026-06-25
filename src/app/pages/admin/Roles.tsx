import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Shield, Check, X, ChevronLeft, Save, RefreshCw } from 'lucide-react';
import { getAllRoles, addRole, updateRole, deleteRole } from '../../services/RoleService';

// ─── Types ────────────────────────────────────────────────────────────────────
type Permission = 'create' | 'view' | 'update' | 'delete';
type Mode = 'list' | 'form';

interface ModulePermissions {
  create: boolean;
  view: boolean;
  update: boolean;
  delete: boolean;
}

interface Role {
  id: string | number;
  name: string;
  description: string;
  color: string;
  usersCount?: number;
  permissions: Record<string, ModulePermissions>;
}

const MODULES: string[] = [
  'Customers', 'Inquiries', 'Numerologists', 'Events',
  'Content', 'Delivery', 'Reports', 'Notifications',
];
const PERMISSIONS: Permission[] = ['create', 'view', 'update', 'delete'];
const COLOR_OPTIONS = ['#D32F2F', '#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#009688'];

const emptyPermissions = (): Record<string, ModulePermissions> =>
  Object.fromEntries(MODULES.map(m => [m, { create: false, view: false, update: false, delete: false }]));

const emptyRole = (): Omit<Role, 'id'> => ({
  name: '',
  description: '',
  color: '#D32F2F',
  permissions: emptyPermissions(),
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="w-32 h-3 bg-gray-100 rounded" />
        <div className="w-48 h-2.5 bg-gray-100 rounded" />
      </div>
      <div className="w-28 h-8 bg-gray-100 rounded-xl" />
    </div>
  );
}

export default function Roles() {
  const [mode, setMode]         = useState<Mode>('list');
  const [roles, setRoles]       = useState<Role[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError]   = useState('');

  const [roleForm, setRoleForm]     = useState(emptyRole());
  const [editRoleId, setEditRoleId] = useState<string | number | null>(null);
  const [deleteId, setDeleteId]     = useState<string | number | null>(null);
  const [deleting, setDeleting]     = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await getAllRoles();
      setRoles(res?.data ?? res ?? []);
    } catch {
      setFetchError('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const openNew = () => {
    setRoleForm(emptyRole());
    setEditRoleId(null);
    setSaveError('');
    setMode('form');
  };

  const openEdit = (r: Role) => {
    setRoleForm({
      name:        r.name,
      description: r.description,
      color:       r.color,
      permissions: r.permissions ?? emptyPermissions(),
    });
    setEditRoleId(r.id);
    setSaveError('');
    setMode('form');
  };

  const handleBack = () => { setMode('list'); setSaveError(''); };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!roleForm.name.trim()) { setSaveError('Role name is required.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      if (editRoleId !== null) {
        await updateRole(roleForm, editRoleId);
      } else {
        await addRole(roleForm);
      }
      await fetchRoles();
      setMode('list');
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
      await deleteRole({ ids: [deleteId] });
      setRoles(rs => rs.filter(r => r.id !== deleteId));
      setDeleteId(null);
    } catch {
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Permission toggles ─────────────────────────────────────────────────────
  const togglePermission = (mod: string, perm: Permission) => {
    setRoleForm(f => ({
      ...f,
      permissions: {
        ...f.permissions,
        [mod]: { ...f.permissions[mod], [perm]: !f.permissions[mod]?.[perm] },
      },
    }));
  };

  const toggleAllModule = (mod: string) => {
    const allOn = PERMISSIONS.every(p => roleForm.permissions[mod]?.[p]);
    setRoleForm(f => ({
      ...f,
      permissions: {
        ...f.permissions,
        [mod]: Object.fromEntries(PERMISSIONS.map(p => [p, !allOn])) as ModulePermissions,
      },
    }));
  };

  const toggleAllPermission = (perm: Permission) => {
    const allOn = MODULES.every(m => roleForm.permissions[m]?.[perm]);
    setRoleForm(f => ({
      ...f,
      permissions: Object.fromEntries(
        MODULES.map(m => [m, { ...f.permissions[m], [perm]: !allOn }])
      ) as Record<string, ModulePermissions>,
    }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {mode === 'list' ? (
          <>
            <div>
              <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Role Management
              </h1>
              <p className="text-[#616161] text-xs">
                {loading ? 'Loading…' : `${roles.length} role${roles.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchRoles}
                title="Refresh"
                className="p-2 border border-gray-200 rounded-xl text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={openNew}
                className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
              >
                <Plus size={13} /> Add Role
              </button>
            </div>
          </>
        ) : (
          <>
            <button onClick={handleBack} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium">
              <ChevronLeft size={15} /> Back
            </button>
            <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {editRoleId ? 'Edit Role' : 'Add Role'}
            </h1>
            <div />
          </>
        )}
      </div>

      {/* ═══════════════ LIST ═══════════════ */}
      {mode === 'list' && (
        <>
          {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
              {fetchError}
              <button onClick={fetchRoles} className="text-[#D32F2F] font-semibold text-xs hover:underline">Retry</button>
            </div>
          )}

          <div className="space-y-3">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : roles.length === 0
                ? (
                  <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                    <Shield size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-[#616161]">No roles yet.</p>
                    <button onClick={openNew} className="mt-3 text-sm text-[#D32F2F] font-semibold hover:underline">Create the first role</button>
                  </div>
                )
                : roles.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (r.color ?? '#D32F2F') + '20' }}
                    >
                      <Shield size={18} style={{ color: r.color ?? '#D32F2F' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{r.name}</div>
                      <div className="text-xs text-[#616161]">
                        {r.description || '—'}
                        {r.usersCount !== undefined && <> · {r.usersCount} user{r.usersCount !== 1 ? 's' : ''}</>}
                      </div>
                      {/* Permission summary chips */}
                      {r.permissions && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {MODULES.map(mod => {
                            const perms = r.permissions[mod];
                            if (!perms) return null;
                            const count = PERMISSIONS.filter(p => perms[p]).length;
                            if (count === 0) return null;
                            return (
                              <span key={mod} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#616161]">
                                {mod} <span className="font-semibold text-[#D32F2F]">{count}/4</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                      <button
                        onClick={() => openEdit(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-[#616161] rounded-xl text-xs font-medium hover:border-[#FBC02D] hover:text-[#FBC02D] transition-colors"
                      >
                        <Edit size={12} /> Edit & Permissions
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
            }
          </div>
        </>
      )}

      {/* ═══════════════ FORM ═══════════════ */}
      {mode === 'form' && (
        <div className="space-y-5">
          {/* Role details card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Role Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Role Name *</label>
                <input
                  value={roleForm.name}
                  onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sales Manager"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Badge Color</label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setRoleForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${roleForm.color === c ? 'border-gray-700 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Description</label>
                <input
                  value={roleForm.description}
                  onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this role"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]"
                />
              </div>
            </div>
          </div>

          {/* Permission matrix */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Shield size={15} className="text-[#D32F2F]" />
              <h3 className="font-bold text-[#212121] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Module Permissions</h3>
              <span className="ml-auto text-xs text-[#9E9E9E]">Click column header to toggle all rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider">Module</th>
                    {PERMISSIONS.map(p => (
                      <th key={p} className="text-center px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider">
                        <button
                          onClick={() => toggleAllPermission(p)}
                          className="capitalize hover:text-[#D32F2F] transition-colors"
                          title={`Toggle all ${p}`}
                        >
                          {p}
                        </button>
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider">All</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(mod => {
                    const allOn = PERMISSIONS.every(p => roleForm.permissions[mod]?.[p]);
                    return (
                      <tr key={mod} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-sm font-medium text-[#212121]">{mod}</td>
                        {PERMISSIONS.map(perm => {
                          const has = roleForm.permissions[mod]?.[perm] ?? false;
                          return (
                            <td key={perm} className="px-4 py-3 text-center">
                              <button
                                onClick={() => togglePermission(mod, perm)}
                                className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-colors ${
                                  has
                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                }`}
                              >
                                {has ? <Check size={13} /> : <X size={13} />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleAllModule(mod)}
                            className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-colors ${
                              allOn
                                ? 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                            title={allOn ? 'Revoke all' : 'Grant all'}
                          >
                            {allOn ? <Check size={13} /> : <Plus size={13} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">{saveError}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              disabled={saving}
              className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C] disabled:opacity-60"
            >
              {saving
                ? <><RefreshCw size={13} className="animate-spin" /> Saving…</>
                : <><Save size={13} /> {editRoleId ? 'Update Role' : 'Create Role'}</>
              }
            </button>
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
            <h3 className="font-bold text-[#212121] mb-2">Delete Role?</h3>
            <p className="text-sm text-[#616161] mb-5">This action cannot be undone. Users assigned to this role will lose access.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? <><RefreshCw size={13} className="animate-spin" /> Deleting…</> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
