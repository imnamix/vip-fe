import { useState } from 'react';
import { Plus, Edit, Trash2, Shield, Users, Check, X, ChevronLeft, ChevronRight, Search, Save, CheckCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Permission = 'create' | 'view' | 'update' | 'delete';
type SubTab = 'roles' | 'users';
type Mode = 'list' | 'form';

const MODULES = ['Customers', 'Inquiries', 'Numerologists', 'Events', 'Content', 'Delivery', 'Reports', 'Notifications'];
const PERMISSIONS: Permission[] = ['create', 'view', 'update', 'delete'];

// ─── Initial Roles Data ───────────────────────────────────────────────────────
const initRoles = [
  { id: 'ROLE-01', name: 'Super Admin', description: 'Full unrestricted access', color: '#D32F2F', usersCount: 1, permissions: Object.fromEntries(MODULES.map(m => [m, { create: true, view: true, update: true, delete: true }])) },
  { id: 'ROLE-02', name: 'Admin', description: 'All access except role management', color: '#FF9800', usersCount: 2, permissions: Object.fromEntries(MODULES.map(m => [m, { create: m !== 'Notifications', view: true, update: true, delete: m !== 'Notifications' }])) },
  { id: 'ROLE-03', name: 'Content Manager', description: 'Manage website content and events', color: '#2196F3', usersCount: 1, permissions: Object.fromEntries(MODULES.map(m => [m, { create: m === 'Content' || m === 'Events', view: true, update: m === 'Content' || m === 'Events', delete: false }])) },
  { id: 'ROLE-04', name: 'Sales Executive', description: 'Handle inquiries and customers', color: '#4CAF50', usersCount: 3, permissions: Object.fromEntries(MODULES.map(m => [m, { create: m === 'Customers' || m === 'Inquiries', view: ['Customers', 'Inquiries'].includes(m), update: m === 'Inquiries', delete: false }])) },
  { id: 'ROLE-05', name: 'Delivery Executive', description: 'Update delivery statuses', color: '#9C27B0', usersCount: 2, permissions: Object.fromEntries(MODULES.map(m => [m, { create: false, view: m === 'Delivery', update: m === 'Delivery', delete: false }])) },
];

// ─── Initial Users Data ───────────────────────────────────────────────────────
const initUsers = [
  { id: 'USR-001', name: 'Raj Superadmin', email: 'raj@vipnumerology.com', mobile: '+91 9800000001', role: 'Super Admin', status: 'Active', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop', joinedDate: 'Jan 1, 2022' },
  { id: 'USR-002', name: 'Anita Sharma', email: 'anita@vipnumerology.com', mobile: '+91 9800000002', role: 'Admin', status: 'Active', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop', joinedDate: 'Mar 15, 2022' },
  { id: 'USR-003', name: 'Kiran Mehta', email: 'kiran@vipnumerology.com', mobile: '+91 9800000003', role: 'Content Manager', status: 'Active', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop', joinedDate: 'Jun 10, 2022' },
  { id: 'USR-004', name: 'Rahul Nair', email: 'rahul@vipnumerology.com', mobile: '+91 9800000004', role: 'Sales Executive', status: 'Active', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop', joinedDate: 'Aug 22, 2022' },
  { id: 'USR-005', name: 'Priya Joshi', email: 'priya@vipnumerology.com', mobile: '+91 9800000005', role: 'Sales Executive', status: 'Inactive', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=32&h=32&fit=crop', joinedDate: 'Nov 3, 2022' },
  { id: 'USR-006', name: 'Deepak Patel', email: 'deepak@vipnumerology.com', mobile: '+91 9800000006', role: 'Delivery Executive', status: 'Active', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop', joinedDate: 'Jan 9, 2023' },
  { id: 'USR-007', name: 'Sunita Roy', email: 'sunita@vipnumerology.com', mobile: '+91 9800000007', role: 'Sales Executive', status: 'Active', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop', joinedDate: 'Apr 17, 2023' },
  { id: 'USR-008', name: 'Arun Kumar', email: 'arun@vipnumerology.com', mobile: '+91 9800000008', role: 'Delivery Executive', status: 'Active', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop', joinedDate: 'Jul 5, 2023' },
];

const roleColors: Record<string, string> = {
  'Super Admin': 'bg-red-100 text-[#D32F2F]',
  'Admin': 'bg-orange-100 text-orange-700',
  'Content Manager': 'bg-blue-100 text-blue-700',
  'Sales Executive': 'bg-green-100 text-green-700',
  'Delivery Executive': 'bg-purple-100 text-purple-700',
};

const PAGE_SIZE = 8;
const emptyRole = { id: '', name: '', description: '', color: '#D32F2F', usersCount: 0, permissions: Object.fromEntries(MODULES.map(m => [m, { create: false, view: false, update: false, delete: false }])) };
const emptyUser = { id: '', name: '', email: '', mobile: '', role: 'Sales Executive', status: 'Active', img: '', joinedDate: '' };

export default function UserRoles() {
  const [subTab, setSubTab] = useState<SubTab>('roles');
  const [mode, setMode] = useState<Mode>('list');
  const [roles, setRoles] = useState(initRoles);
  const [users, setUsers] = useState(initUsers);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Role Form State
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);

  // User Form State
  const [userForm, setUserForm] = useState(emptyUser);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  // ── Roles ───────────────────────────────────────────────────────────────────
  const openNewRole = () => { setRoleForm(emptyRole); setEditRoleId(null); setMode('form'); };
  const openEditRole = (r: typeof roles[0]) => { setRoleForm({ ...r }); setEditRoleId(r.id); setMode('form'); };
  const saveRole = () => {
    if (editRoleId) setRoles(rs => rs.map(r => r.id === editRoleId ? roleForm : r));
    else setRoles(rs => [...rs, { ...roleForm, id: `ROLE-${String(rs.length + 1).padStart(2, '0')}`, usersCount: 0 }]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setMode('list');
  };
  const deleteRole = (id: string) => { setRoles(rs => rs.filter(r => r.id !== id)); setDeleteId(null); };
  const togglePermission = (mod: string, perm: Permission) => {
    if (roleForm.id === 'ROLE-01') return;
    setRoleForm(f => ({ ...f, permissions: { ...f.permissions, [mod]: { ...f.permissions[mod], [perm]: !f.permissions[mod][perm] } } }));
  };

  // ── Users ───────────────────────────────────────────────────────────────────
  const openNewUser = () => { setUserForm(emptyUser); setEditUserId(null); setMode('form'); };
  const openEditUser = (u: typeof users[0]) => { setUserForm({ ...u }); setEditUserId(u.id); setMode('form'); };
  const saveUser = () => {
    if (editUserId) setUsers(us => us.map(u => u.id === editUserId ? userForm : u));
    else setUsers(us => [...us, { ...userForm, id: `USR-${String(us.length + 1).padStart(3, '0')}`, joinedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }]);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setMode('list');
  };
  const deleteUser = (id: string) => { setUsers(us => us.filter(u => u.id !== id)); setDeleteId(null); };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));
  const userPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {mode === 'list' ? (
          <>
            <div>
              <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>User & Role Management</h1>
              <p className="text-[#616161] text-xs">Manage access control for admin portal</p>
            </div>
            <button onClick={subTab === 'roles' ? openNewRole : openNewUser}
              className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors">
              <Plus size={13} /> {subTab === 'roles' ? 'Add Role' : 'Add User'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setMode('list')} className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium">
              <ChevronLeft size={15} /> Back
            </button>
            <h1 className="text-xl font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {subTab === 'roles' ? (editRoleId ? 'Edit Role' : 'Add Role') : (editUserId ? 'Edit User' : 'Add User')}
            </h1>
            {saved && (
              <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-xl font-medium">
                <CheckCircle size={13} /> Saved
              </div>
            )}
          </>
        )}
      </div>

      {/* Sub tabs (list mode only) */}
      {mode === 'list' && (
        <div className="flex gap-2 mb-5 border-b border-gray-200">
          {([['roles', Shield, 'Roles'], ['users', Users, 'Users']] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => { setSubTab(key); setSearch(''); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${subTab === key ? 'border-[#D32F2F] text-[#D32F2F]' : 'border-transparent text-[#616161] hover:text-[#212121]'}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════ ROLES LIST ═══════════════ */}
      {mode === 'list' && subTab === 'roles' && (
        <div className="space-y-3">
          {roles.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: r.color + '15' }}>
                <Shield size={18} style={{ color: r.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#212121]" style={{ fontFamily: 'Poppins, sans-serif' }}>{r.name}</div>
                <div className="text-xs text-[#616161]">{r.description} · {r.usersCount} user{r.usersCount !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <button onClick={() => openEditRole(r)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-[#616161] rounded-xl text-xs font-medium hover:border-[#FBC02D] hover:text-[#FBC02D] transition-colors">
                  <Edit size={12} /> Edit & Permissions
                </button>
                {r.id !== 'ROLE-01' && (
                  <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════ ROLE FORM ═══════════════ */}
      {mode === 'form' && subTab === 'roles' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-[#212121] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Role Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Role Name *</label>
                <input value={roleForm.name} onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Color</label>
                <div className="flex gap-2">
                  {['#D32F2F', '#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#009688'].map(c => (
                    <button key={c} type="button" onClick={() => setRoleForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${roleForm.color === c ? 'border-gray-700 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Description</label>
                <input value={roleForm.description} onChange={e => setRoleForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Shield size={15} className="text-[#D32F2F]" />
              <h3 className="font-bold text-[#212121] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Permissions</h3>
              {editRoleId === 'ROLE-01' && <span className="text-xs text-orange-500 ml-2">Super Admin permissions are locked</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider">Module</th>
                    {PERMISSIONS.map(p => <th key={p} className="text-center px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider capitalize">{p}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(mod => (
                    <tr key={mod} className="border-b border-gray-50">
                      <td className="px-5 py-3 text-sm font-medium text-[#212121]">{mod}</td>
                      {PERMISSIONS.map(perm => {
                        const has = roleForm.permissions[mod]?.[perm] ?? false;
                        return (
                          <td key={perm} className="px-4 py-3 text-center">
                            <button onClick={() => togglePermission(mod, perm)}
                              className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-colors ${has ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'} ${editRoleId === 'ROLE-01' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                              {has ? <Check size={13} /> : <X size={13} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setMode('list')} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold">Cancel</button>
            <button onClick={saveRole} className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C]">
              <Save size={13} /> {editRoleId ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ USERS LIST ═══════════════ */}
      {mode === 'list' && subTab === 'users' && (
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-40">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..."
                className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['User', 'Email', 'Mobile', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={u.img} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                          <span className="text-sm font-medium text-[#212121] whitespace-nowrap">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#616161]">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-[#616161] whitespace-nowrap">{u.mobile}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.status}</span></td>
                      <td className="px-4 py-3 text-xs text-[#616161] whitespace-nowrap">{u.joinedDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEditUser(u)} className="p-1.5 text-[#FBC02D] hover:bg-yellow-50 rounded-lg"><Edit size={13} /></button>
                          {u.id !== 'USR-001' && <button onClick={() => setDeleteId(u.id)} className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs text-[#616161]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}</span>
              <div className="flex gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F]"><ChevronLeft size={12} /></button>
                {Array.from({ length: Math.min(5, userPages) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs ${page === p ? 'bg-[#D32F2F] text-white' : 'border border-gray-200 hover:border-[#D32F2F]'}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(userPages, p + 1))} disabled={page === userPages} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:border-[#D32F2F]"><ChevronRight size={12} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ USER FORM ═══════════════ */}
      {mode === 'form' && subTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-xl">
          <div className="space-y-4">
            {[['Full Name', 'name', 'text'], ['Email', 'email', 'email'], ['Mobile', 'mobile', 'tel']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">{label} *</label>
                <input type={type} value={userForm[key as keyof typeof userForm]} onChange={e => setUserForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F]" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Role</label>
                <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                  {roles.map(r => <option key={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">Status</label>
                <select value={userForm.status} onChange={e => setUserForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D32F2F] bg-white">
                  {['Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setMode('list')} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold">Cancel</button>
            <button onClick={saveUser} className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#B71C1C]">
              <Save size={13} /> {editUserId ? 'Update' : 'Add User'}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={18} className="text-[#D32F2F]" /></div>
            <h3 className="font-bold text-[#212121] mb-2">Confirm Delete?</h3>
            <p className="text-sm text-[#616161] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-[#616161] rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={() => subTab === 'roles' ? deleteRole(deleteId) : deleteUser(deleteId)}
                className="flex-1 py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
