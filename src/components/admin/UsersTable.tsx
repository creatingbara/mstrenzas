"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Edit3, KeyRound, Power, PowerOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { displayContactEmail, normalizeUsername } from "@/lib/utils/username";
import type { StaffRole, UserProfile } from "@/types/staff";

type UserDraft = {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  temporaryPassword: string;
};

export function UsersTable({
  profiles,
  actorRole,
  actorProfileId
}: {
  profiles: UserProfile[];
  actorRole: StaffRole;
  actorProfileId: string;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>(() => makeDrafts(profiles));
  const editingProfile = profiles.find((profile) => profile.id === editingId) || null;
  const editingDraft = editingId ? drafts[editingId] : null;

  const sortedProfiles = useMemo(
    () => [...profiles].sort((a, b) => roleWeight(a.role) - roleWeight(b.role) || a.fullName.localeCompare(b.fullName)),
    [profiles]
  );

  function updateDraft(profileId: string, patch: Partial<UserDraft>) {
    setDrafts((current) => ({
      ...current,
      [profileId]: {
        ...current[profileId],
        ...patch
      }
    }));
  }

  function openEditor(profile: UserProfile, resetPasswordOnly = false) {
    setNotice(null);
    setEditingId(profile.id);
    if (!drafts[profile.id]) {
      setDrafts((current) => ({
        ...current,
        [profile.id]: createDraft(profile)
      }));
    }
    if (resetPasswordOnly) {
      updateDraft(profile.id, { temporaryPassword: "" });
    }
  }

  async function save(profile: UserProfile, patch?: Partial<UserDraft>) {
    const draft = {
      ...drafts[profile.id],
      ...patch
    };
    setSavingId(profile.id);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          fullName: draft.fullName,
          username: normalizeUsername(draft.username),
          phone: draft.phone || null,
          email: draft.email || null,
          role: draft.role,
          isActive: draft.isActive,
          temporaryPassword: draft.temporaryPassword || null
        })
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo guardar.");

      setNotice(result.message || "Usuario actualizado correctamente.");
      setEditingId(null);
      setDrafts((current) => ({
        ...current,
        [profile.id]: {
          ...draft,
          temporaryPassword: ""
        }
      }));
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSavingId(null);
    }
  }

  async function updateUserLifecycle(profile: UserProfile, action: "activate" | "deactivate" | "delete") {
    const confirmation =
      action === "delete"
        ? `¿Eliminar el acceso de ${profile.fullName}? Si está enlazado a un colaborador con citas, será desactivado para conservar el historial.`
        : action === "deactivate"
          ? `¿Desactivar el acceso de ${profile.fullName}? Si es colaborador, también saldrá de la agenda pública.`
          : `¿Activar el acceso de ${profile.fullName}?`;

    if (!window.confirm(confirmation)) return;

    setSavingId(profile.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/users?profileId=${profile.id}&action=${action}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar.");

      setNotice(result.message || "Usuario actualizado correctamente.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo actualizar.");
    } finally {
      setSavingId(null);
    }
  }

  function canEdit(profile: UserProfile) {
    if (actorRole === "super_admin") return true;
    return profile.role === "colaborador";
  }

  function canDeactivate(profile: UserProfile) {
    return canEdit(profile) && profile.id !== actorProfileId;
  }

  return (
    <div className="grid gap-3">
      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}
      <div className="overflow-x-auto rounded-lg border border-cocoa/10 bg-white">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-cocoa">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Email opcional</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Creación</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProfiles.map((profile) => (
              <tr key={profile.id} className="border-t border-cocoa/10 align-middle">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                      {profile.fullName.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold">{profile.fullName}</p>
                      <p className="text-xs text-muted">{profile.phone || "Sin teléfono"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-semibold">{profile.username}</td>
                <td className="p-4">{displayContactEmail(profile.email)}</td>
                <td className="p-4">{roleLabel(profile.role)}</td>
                <td className="p-4">
                  <span className={profile.isActive ? "font-semibold text-cocoa" : "font-semibold text-muted"}>
                    {profile.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-4">{formatDate(profile.createdAt)}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" disabled={!canEdit(profile)} onClick={() => openEditor(profile)}>
                      <Edit3 size={16} />
                      Editar
                    </Button>
                    <Button type="button" variant="ghost" disabled={!canEdit(profile)} onClick={() => openEditor(profile, true)}>
                      <KeyRound size={16} />
                      Restablecer
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!canDeactivate(profile) || savingId === profile.id}
                      onClick={() => updateUserLifecycle(profile, profile.isActive ? "deactivate" : "activate")}
                    >
                      {profile.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                      {profile.isActive ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!canDeactivate(profile) || savingId === profile.id}
                      onClick={() => updateUserLifecycle(profile, "delete")}
                    >
                      <Trash2 size={16} />
                      Eliminar acceso
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!profiles.length && <p className="p-4 text-sm text-muted">No hay usuarios registrados.</p>}
      </div>

      {editingProfile && editingDraft && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Editar acceso</p>
                <h3 className="font-display text-3xl font-bold">{editingProfile.fullName}</h3>
              </div>
              <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                Cerrar
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Nombre completo
                <Input value={editingDraft.fullName} onChange={(event) => updateDraft(editingProfile.id, { fullName: event.target.value })} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Usuario
                <Input
                  value={editingDraft.username}
                  onChange={(event) => updateDraft(editingProfile.id, { username: normalizeUsername(event.target.value) })}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Teléfono
                <Input value={editingDraft.phone} onChange={(event) => updateDraft(editingProfile.id, { phone: event.target.value })} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Email opcional
                <Input value={editingDraft.email} onChange={(event) => updateDraft(editingProfile.id, { email: event.target.value })} />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Rol
                <select
                  className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3 text-sm outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/10"
                  value={editingDraft.role}
                  disabled={actorRole !== "super_admin"}
                  onChange={(event) => updateDraft(editingProfile.id, { role: event.target.value as StaffRole })}
                >
                  <option value="colaborador">Colaborador</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Estado
                <select
                  className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3 text-sm outline-none transition focus:border-cocoa focus:ring-2 focus:ring-cocoa/10"
                  value={editingDraft.isActive ? "active" : "inactive"}
                  disabled={editingProfile.id === actorProfileId}
                  onChange={(event) => updateDraft(editingProfile.id, { isActive: event.target.value === "active" })}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold md:col-span-2">
                Nueva contraseña temporal
                <Input
                  type="password"
                  value={editingDraft.temporaryPassword}
                  onChange={(event) => updateDraft(editingProfile.id, { temporaryPassword: event.target.value })}
                  placeholder="Escribe solo si deseas cambiarla"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                Cancelar
              </Button>
              <Button type="button" disabled={savingId === editingProfile.id} onClick={() => save(editingProfile)}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function makeDrafts(profiles: UserProfile[]) {
  return Object.fromEntries(profiles.map((profile) => [profile.id, createDraft(profile)]));
}

function createDraft(profile: UserProfile): UserDraft {
  return {
    fullName: profile.fullName,
    username: profile.username,
    phone: profile.phone || "",
    email: displayContactEmail(profile.email) === "No indicado" ? "" : profile.email,
    role: profile.role,
    isActive: profile.isActive,
    temporaryPassword: ""
  };
}

function roleLabel(role: StaffRole) {
  if (role === "super_admin") return "Super admin";
  if (role === "admin") return "Admin";
  return "Colaborador";
}

function roleWeight(role: StaffRole) {
  if (role === "super_admin") return 0;
  if (role === "admin") return 1;
  return 2;
}

function formatDate(date?: string | null) {
  if (!date) return "No indicado";
  return new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" }).format(new Date(date));
}
