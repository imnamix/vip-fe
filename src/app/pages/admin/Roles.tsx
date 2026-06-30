import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Check,
  X,
  ChevronLeft,
  Save,
  RefreshCw,
} from "lucide-react";
import {
  getAllRoles,
  getRoleById,
  addRole,
  updateRole,
  deleteRole,
} from "../../services/RoleService";
import { usePermission } from "../../hooks/usePermission";

// ─── Types ────────────────────────────────────────────────────────────────────
type Permission = "create" | "view" | "update" | "delete";

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
  "Dashboard",
  "Inquiry",
  "General Inquiry",
  "Events",
  "Top VIP Numbers",
  "Content",
  "Roles",
  "Users",
  "Delivery",
  "Settings",
];
const PERMISSIONS: Permission[] = ["create", "view", "update", "delete"];
const COLOR_OPTIONS = [
  "#D32F2F",
  "#FF9800",
  "#2196F3",
  "#4CAF50",
  "#9C27B0",
  "#009688",
];

const emptyPermissions = (): Record<string, ModulePermissions> =>
  Object.fromEntries(
    MODULES.map((m) => [
      m,
      { create: false, view: false, update: false, delete: false },
    ]),
  );

// API uses read/write; UI uses view/create — convert on fetch
const apiToUiPermissions = (
  apiPerms: Record<string, any>,
): Record<string, ModulePermissions> => {
  const result = emptyPermissions();
  for (const mod of MODULES) {
    const p = apiPerms[mod] ?? {};
    result[mod] = {
      create: p.write ?? p.create ?? false,
      view: p.read ?? p.view ?? false,
      update: p.update ?? false,
      delete: p.delete ?? false,
    };
  }
  return result;
};

// Convert UI format back to API format on save
const uiToApiPermissions = (
  uiPerms: Record<string, ModulePermissions>,
): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const mod of MODULES) {
    const p = uiPerms[mod] ?? {
      create: false,
      view: false,
      update: false,
      delete: false,
    };
    result[mod] = {
      write: p.create,
      read: p.view,
      update: p.update,
      delete: p.delete,
    };
  }
  return result;
};

const emptyRole = (): Omit<Role, "id"> => ({
  name: "",
  description: "",
  color: "#D32F2F",
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
  const [searchParams, setSearchParams] = useSearchParams();

  // mode and editRoleId are derived from URL — survives page refresh
  const mode = searchParams.get("mode") === "form" ? "form" : "list";
  const editRoleId = searchParams.get("id") ?? null;

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [nameError, setNameError] = useState("");
  const formTopRef = useRef<HTMLDivElement>(null);
  const [roleForm, setRoleForm] = useState(emptyRole());
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const { can: canDo } = usePermission();
  const canCreateRole    = canDo("Roles", "write");
  const canEditRole      = canDo("Roles", "update");
  const canDeleteRole     = canDo("Roles", "delete");
  const showRoleActions     = canEditRole || canDeleteRole;
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await getAllRoles();
      const rawRoles: any[] = res?.data ?? res ?? [];
      setRoles(
        rawRoles
          .filter((r) => r.name?.trim().toLowerCase() !== "super admin")
          .map((r) => ({
            ...r,
            permissions: apiToUiPermissions(r.permissions ?? {}),
          })),
      );
    } catch {
      setFetchError("Failed to load roles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ── Restore form on refresh ────────────────────────────────────────────────
  // If the page loads with mode=form&id=X in the URL, re-fetch that role
  useEffect(() => {
    if (mode !== "form") return;

    if (editRoleId) {
      setFormLoading(true);
      getRoleById(editRoleId)
        .then((res) => {
          const r = res?.data ?? res;
          if (r?.name?.trim().toLowerCase() === "super admin") {
            setSearchParams({});
            return;
          }
          if (r) {
            setRoleForm({
              name: r.name ?? "",
              description: r.description ?? "",
              color: r.color ?? "#D32F2F",
              permissions: apiToUiPermissions(r.permissions ?? {}),
            });
          } else {
            setSearchParams({});
          }
        })
        .catch(() => setSearchParams({}))
        .finally(() => setFormLoading(false));
    } else {
      setRoleForm(emptyRole());
    }
    // intentionally runs only on mount — URL drives this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const openNew = () => {
    setRoleForm(emptyRole());
    setSaveError("");
    setNameError("");
    setSearchParams({ mode: "form" });
  };

  const openEdit = (r: Role) => {
    if (r.name?.trim().toLowerCase() === "super admin") return;
    setRoleForm({
      name: r.name,
      description: r.description,
      color: r.color,
      permissions: r.permissions ?? emptyPermissions(),
    });
    setSaveError("");
    setNameError("");
    setSearchParams({ mode: "form", id: String(r.id) });
  };

  const handleBack = () => {
    setSaveError("");
    setNameError("");
    setSearchParams({});
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const scrollToFormTop = () => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSave = async () => {
    if (!roleForm.name.trim()) {
      setNameError("Role name is required.");
      scrollToFormTop();
      return;
    }
    setSaving(true);
    setSaveError("");
    setNameError("");
    try {
      const payload = {
        ...roleForm,
        permissions: uiToApiPermissions(roleForm.permissions),
      };
      const res = editRoleId !== null
        ? await updateRole(payload, editRoleId)
        : await addRole(payload);

      // Backend responds 200 with success:false for conflicts (e.g. duplicate name)
      // instead of throwing, so this must be checked separately from the catch block.
      if (res?.success === false) {
        const msg = res.message ?? "Failed to save. Please try again.";
        if (/name/i.test(msg)) {
          setNameError(msg);
        } else {
          setSaveError(msg);
        }
        scrollToFormTop();
        return;
      }

      await fetchRoles();
      setSearchParams({});
    } catch (error: any) {
      setSaveError(error?.response?.data?.message ?? "Failed to save. Please try again.");
      scrollToFormTop();
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await deleteRole({ ids: [deleteId] });
      if (res?.success === false) {
        setDeleteError(res.message ?? "Cannot delete this role.");
        return;
      }
      setRoles((rs) => rs.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    } catch {
      setDeleteError("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Permission toggles ─────────────────────────────────────────────────────
  const togglePermission = (mod: string, perm: Permission) => {
    setRoleForm((f) => ({
      ...f,
      permissions: {
        ...f.permissions,
        [mod]: { ...f.permissions[mod], [perm]: !f.permissions[mod]?.[perm] },
      },
    }));
  };

  const toggleAllModule = (mod: string) => {
    const allOn = PERMISSIONS.every((p) => roleForm.permissions[mod]?.[p]);

    const permissions: ModulePermissions = {
      create: !allOn,
      view: !allOn,
      update: !allOn,
      delete: !allOn,
    };

    setRoleForm((f) => ({
      ...f,
      permissions: {
        ...f.permissions,
        [mod]: permissions,
      },
    }));
  };

  const toggleAllPermission = (perm: Permission) => {
    const allOn = MODULES.every((m) => roleForm.permissions[m]?.[perm]);
    setRoleForm((f) => ({
      ...f,
      permissions: Object.fromEntries(
        MODULES.map((m) => [m, { ...f.permissions[m], [perm]: !allOn }]),
      ) as Record<string, ModulePermissions>,
    }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {mode === "list" ? (
          <>
            <div>
              <h1
                className="text-xl font-bold text-[#212121]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Role Management
              </h1>
              <p className="text-[#616161] text-xs">
                {loading
                  ? "Loading…"
                  : `${roles.length} role${roles.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchRoles}
                title="Refresh"
                className="p-2 border border-gray-200 rounded-xl text-[#616161] hover:border-[#D32F2F] hover:text-[#D32F2F] transition-colors"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              {canCreateRole && (
                <button
                  onClick={openNew}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C] transition-colors"
                >
                  <Plus size={13} /> Add Role
                </button>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#616161] hover:text-[#D32F2F] text-sm font-medium"
          >
            <ChevronLeft size={15} /> Back to Roles
          </button>
        )}
      </div>

      {/* ═══════════════ LIST ═══════════════ */}
      {mode === "list" && (
        <>
          {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
              {fetchError}
              <button
                onClick={fetchRoles}
                className="text-[#D32F2F] font-semibold text-xs hover:underline"
              >
                Retry
              </button>
            </div>
          )}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : roles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                <Shield size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-[#616161]">No roles yet.</p>
                {canCreateRole && (
                  <button
                    onClick={openNew}
                    className="mt-3 text-sm text-[#D32F2F] font-semibold hover:underline"
                  >
                    Create the first role
                  </button>
                )}
              </div>
            ) : (
              roles.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (r.color ?? "#D32F2F") + "20" }}
                  >
                    <Shield size={18} style={{ color: r.color ?? "#D32F2F" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-bold text-[#212121]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {r.name}
                    </div>
                    <div className="text-xs text-[#616161]">
                      {r.description || "—"}
                      {r.usersCount !== undefined && (
                        <>
                          {" "}
                          · {r.usersCount} user{r.usersCount !== 1 ? "s" : ""}
                        </>
                      )}
                    </div>
                    {r.permissions && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {MODULES.map((mod) => {
                          const perms = r.permissions[mod];
                          if (!perms) return null;
                          const count = PERMISSIONS.filter(
                            (p) => perms[p],
                          ).length;
                          if (count === 0) return null;
                          return (
                            <span
                              key={mod}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#616161]"
                            >
                              {mod}{" "}
                              <span className="font-semibold text-[#D32F2F]">
                                {count}/4
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {showRoleActions && (
                  <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                    {canEditRole && (
                    <button
                      onClick={() => openEdit(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-[#616161] rounded-xl text-xs font-medium hover:border-[#FBC02D] hover:text-[#FBC02D] transition-colors"
                    >
                      <Edit size={12} /> Edit & Permissions
                    </button>
                    )}
                    {canDeleteRole && (
                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="p-1.5 text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                    )}
                  </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ═══════════════ FORM ═══════════════ */}
      {mode === "form" && (
        <div ref={formTopRef} className="max-w-3xl mx-auto space-y-5">
          {formLoading ? (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-40" />
              <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-64" />
            </div>
          ) : (
            <>
              {/* Page title */}
              <div>
                <h1
                  className="text-xl font-bold text-[#212121]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {editRoleId ? "Edit Role" : "Create Role"}
                </h1>
                <p className="text-xs text-[#616161] mt-0.5">
                  {editRoleId
                    ? "Update role details and module permissions"
                    : "Define a new role and assign module permissions"}
                </p>
              </div>

              {/* Role details card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3
                  className="font-bold text-[#212121] mb-4 text-sm"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Role Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                      Role Name *
                    </label>
                    <input
                      value={roleForm.name}
                      onChange={(e) => {
                        setRoleForm((f) => ({ ...f, name: e.target.value }));
                        if (nameError) setNameError("");
                      }}
                      placeholder="e.g. Sales Manager"
                      className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none ${
                        nameError
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-[#D32F2F]"
                      }`}
                    />
                    {nameError && (
                      <p className="mt-1.5 text-xs text-red-600">{nameError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                      Badge Color
                    </label>
                    <div className="flex gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setRoleForm((f) => ({ ...f, color: c }))
                          }
                          className={`w-8 h-8 rounded-full border-2 transition-all ${roleForm.color === c ? "border-gray-700 scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#616161] uppercase tracking-wider mb-1.5">
                      Description
                    </label>
                    <input
                      value={roleForm.description}
                      onChange={(e) =>
                        setRoleForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
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
                  <h3
                    className="font-bold text-[#212121] text-sm"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Module Permissions
                  </h3>
                  <span className="ml-auto text-xs text-[#9E9E9E]">
                    Click column header to toggle all rows
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider">
                          Module
                        </th>
                        {PERMISSIONS.map((p) => (
                          <th
                            key={p}
                            className="text-center px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider"
                          >
                            <button
                              onClick={() => toggleAllPermission(p)}
                              className="capitalize hover:text-[#D32F2F] transition-colors"
                              title={`Toggle all ${p}`}
                            >
                              {p}
                            </button>
                          </th>
                        ))}
                        <th className="text-center px-4 py-3 text-xs font-semibold text-[#616161] uppercase tracking-wider">
                          All
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map((mod) => {
                        const allOn = PERMISSIONS.every(
                          (p) => roleForm.permissions[mod]?.[p],
                        );
                        return (
                          <tr
                            key={mod}
                            className="border-b border-gray-50 hover:bg-gray-50/50"
                          >
                            <td className="px-5 py-3 text-sm font-medium text-[#212121]">
                              {mod}
                            </td>
                            {PERMISSIONS.map((perm) => {
                              const has =
                                roleForm.permissions[mod]?.[perm] ?? false;
                              return (
                                <td
                                  key={perm}
                                  className="px-4 py-3 text-center"
                                >
                                  <button
                                    onClick={() => togglePermission(mod, perm)}
                                    className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-colors ${
                                      has
                                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                    }`}
                                  >
                                    {has ? (
                                      <Check size={13} />
                                    ) : (
                                      <X size={13} />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleAllModule(mod)}
                                className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-colors ${
                                  allOn
                                    ? "bg-[#D32F2F] text-white hover:bg-[#B71C1C]"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                                title={allOn ? "Revoke all" : "Grant all"}
                              >
                                {allOn ? (
                                  <Check size={13} />
                                ) : (
                                  <Plus size={13} />
                                )}
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
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
                  {saveError}
                </div>
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
                  {saving ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save size={13} />{" "}
                      {editRoleId ? "Update Role" : "Create Role"}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (!deleting) {
              setDeleteId(null);
              setDeleteError("");
            }
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {deleteError ? (
              <>
                <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield size={18} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-[#212121] mb-2">
                  Cannot Delete Role
                </h3>
                <p className="text-sm text-[#616161] mb-5">{deleteError}</p>
                <button
                  onClick={() => {
                    setDeleteId(null);
                    setDeleteError("");
                  }}
                  className="w-full py-2.5 bg-[#D32F2F] text-white rounded-xl text-sm font-semibold hover:bg-[#B71C1C]"
                >
                  OK
                </button>
              </>
            ) : (
              <>
                <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={18} className="text-[#D32F2F]" />
                </div>
                <h3 className="font-bold text-[#212121] mb-2">Delete Role?</h3>
                <p className="text-sm text-[#616161] mb-5">
                  This action cannot be undone. Users assigned to this role will
                  lose access.
                </p>
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
                    {deleting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />{" "}
                        Deleting…
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
