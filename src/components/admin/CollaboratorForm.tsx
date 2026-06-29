"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CollaboratorPhotoUploader } from "@/components/admin/CollaboratorPhotoUploader";
import { isInternalUsernameEmail, normalizeUsername } from "@/lib/utils/username";
import type { StaffMember, StaffRole } from "@/types/staff";

export function CollaboratorForm({
  staff,
  actorRole,
  redirectBasePath = "/admin/colaboradores"
}: {
  staff?: StaffMember | null;
  actorRole: StaffRole;
  redirectBasePath?: string;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lifecycleBusy, setLifecycleBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: staff?.fullName ?? "",
    username: staff?.username ?? "",
    email: isInternalUsernameEmail(staff?.email) ? "" : staff?.email ?? "",
    phone: staff?.phone ?? "",
    photoUrl: staff?.photoUrl ?? "",
    bio: staff?.bio ?? "",
    role: staff?.role ?? "colaborador",
    isActive: staff?.isActive ?? true,
    specialty: staff?.specialty ?? "",
    calendarColor: staff?.calendarColor ?? "#8B5E3C",
    temporaryPassword: ""
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: staff?.id,
          ...form,
          username: normalizeUsername(form.username),
          email: form.email || null,
          temporaryPassword: form.temporaryPassword || null
        })
      });
      const result = (await response.json()) as { item?: StaffMember; error?: string; message?: string };

      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo guardar.");
      router.push(`${redirectBasePath}/${result.item.id}`);
      router.refresh();
      setNotice(result.message || "Colaborador guardado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStaffLifecycle(action: "activate" | "deactivate" | "delete") {
    if (!staff) return;

    const appointmentCount = staff.appointmentCount ?? 0;
    const confirmation =
      action === "delete"
        ? appointmentCount > 0
          ? "Este colaborador tiene citas registradas. Por seguridad será desactivado y se conservará el historial. ¿Deseas continuar?"
          : "Este colaborador no tiene citas. Puedes eliminarlo definitivamente. ¿Deseas continuar?"
        : action === "deactivate"
          ? "¿Desactivar colaborador? No aparecerá en la agenda pública ni podrá iniciar sesión."
          : "¿Activar colaborador?";

    if (!window.confirm(confirmation)) return;

    setLifecycleBusy(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/staff?id=${staff.id}&action=${action}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string; message?: string; action?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar el colaborador.");

      setNotice(result.message || "Colaborador actualizado.");
      if (result.action === "deleted") {
        router.push(redirectBasePath);
        router.refresh();
        return;
      }

      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo actualizar el colaborador.");
    } finally {
      setLifecycleBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre completo">
          <Input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
        </Field>
        <Field label="Usuario">
          <Input
            value={form.username}
            onChange={(event) => setForm({ ...form, username: normalizeUsername(event.target.value) })}
            placeholder="medjina"
            required
          />
        </Field>
        <Field label="Email opcional">
          <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="correo de contacto" />
        </Field>
        <Field label="Teléfono">
          <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        </Field>
        <Field label="Rol">
          <select
            className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole })}
          >
            <option value="colaborador">Colaborador</option>
            {actorRole === "super_admin" && <option value="admin">Admin</option>}
            {actorRole === "super_admin" && <option value="super_admin">Super admin</option>}
          </select>
        </Field>
        <Field label="Estado">
          <select
            className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3"
            value={form.isActive ? "active" : "inactive"}
            onChange={(event) => setForm({ ...form, isActive: event.target.value === "active" })}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </Field>
        <Field label="Especialidad">
          <Input value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} />
        </Field>
        <Field label="Color de calendario">
          <Input type="color" value={form.calendarColor} onChange={(event) => setForm({ ...form, calendarColor: event.target.value })} />
        </Field>
      </div>
      <CollaboratorPhotoUploader
        staffId={staff?.id}
        fullName={form.fullName}
        currentUrl={form.photoUrl}
        onChange={(avatarUrl) => setForm((current) => ({ ...current, photoUrl: avatarUrl || "" }))}
      />
      <Field label="Bio corta">
        <Textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
      </Field>
      <div className="grid gap-4 rounded-lg border border-cocoa/10 bg-cream/50 p-4">
        <div>
          <h3 className="font-display text-2xl font-bold">Acceso del colaborador</h3>
          <p className="mt-1 text-sm text-muted">El colaborador entrará con su usuario y contraseña temporal.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Usuario">
            <Input value={form.username} onChange={(event) => setForm({ ...form, username: normalizeUsername(event.target.value) })} required />
          </Field>
          <Field label="Nueva contraseña temporal">
            <Input
              type="password"
              value={form.temporaryPassword}
              onChange={(event) => setForm({ ...form, temporaryPassword: event.target.value })}
              placeholder={staff ? "Dejar vacío para no cambiar" : "Contraseña temporal"}
            />
          </Field>
        </div>
      </div>
      <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar colaborador"}</Button>
      {staff && (
        <div className="grid gap-3 rounded-lg border border-cocoa/10 bg-cream/50 p-4">
          <div>
            <h3 className="font-display text-2xl font-bold">Estado del colaborador</h3>
            <p className="mt-1 text-sm text-muted">
              {(staff.appointmentCount ?? 0) > 0
                ? "Este colaborador tiene citas registradas. Por seguridad será desactivado y se conservará el historial."
                : "Este colaborador no tiene citas. Puedes eliminarlo definitivamente."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={lifecycleBusy}
              onClick={() => updateStaffLifecycle(staff.isActive ? "deactivate" : "activate")}
            >
              {staff.isActive ? "Desactivar colaborador" : "Activar colaborador"}
            </Button>
            {(staff.appointmentCount ?? 0) === 0 && (
              <Button type="button" variant="outline" disabled={lifecycleBusy} onClick={() => updateStaffLifecycle("delete")}>
                Eliminar definitivamente
              </Button>
            )}
          </div>
        </div>
      )}
      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}
