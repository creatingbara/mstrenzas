"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { displayContactEmail, normalizeUsername } from "@/lib/utils/username";
import type { StaffRole, UserProfile } from "@/types/staff";

export function TeamAccessForm({
  profile,
  actorRole,
  actorProfileId
}: {
  profile: UserProfile;
  actorRole: StaffRole;
  actorProfileId: string;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: profile.fullName,
    username: profile.username,
    phone: profile.phone || "",
    email: displayContactEmail(profile.email) === "No indicado" ? "" : profile.email,
    role: profile.role,
    isActive: profile.isActive,
    temporaryPassword: "",
    confirmPassword: ""
  });

  const canChangeRole = actorRole === "super_admin";
  const canDeactivate = profile.id !== actorProfileId;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (form.temporaryPassword && form.temporaryPassword !== form.confirmPassword) {
      setNotice("Las contrasenas no coinciden.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          fullName: form.fullName,
          username: normalizeUsername(form.username),
          phone: form.phone || null,
          email: form.email || null,
          role: form.role,
          isActive: form.isActive,
          temporaryPassword: form.temporaryPassword || null
        })
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo guardar el acceso.");
      setNotice(result.message || "Acceso actualizado correctamente.");
      setForm((current) => ({ ...current, temporaryPassword: "", confirmPassword: "" }));
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar el acceso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <section className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Informacion personal</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nombre completo">
            <Input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
          </Field>
          <Field label="Usuario">
            <Input value={form.username} onChange={(event) => setForm({ ...form, username: normalizeUsername(event.target.value) })} required />
          </Field>
          <Field label="Telefono">
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          </Field>
          <Field label="Email opcional">
            <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Acceso</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Rol">
            <select
              className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3 text-sm"
              value={form.role}
              disabled={!canChangeRole}
              onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole })}
            >
              <option value="colaborador">Colaborador</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </Field>
          <Field label="Estado">
            <select
              className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3 text-sm"
              value={form.isActive ? "active" : "inactive"}
              disabled={!canDeactivate}
              onChange={(event) => setForm({ ...form, isActive: event.target.value === "active" })}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </Field>
          <Field label="Nueva contrasena temporal">
            <Input
              type="password"
              value={form.temporaryPassword}
              onChange={(event) => setForm({ ...form, temporaryPassword: event.target.value })}
              placeholder="Dejar vacio para no cambiar"
            />
          </Field>
          <Field label="Confirmar contrasena temporal">
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              placeholder="Repite la contrasena"
            />
          </Field>
        </div>
      </section>

      <RoleSummary role={form.role} />

      <Button type="submit" className="rounded-lg" disabled={saving}>
        {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}
    </form>
  );
}

export function RoleSummary({ role }: { role: StaffRole }) {
  const permissions =
    role === "super_admin"
      ? ["Acceso completo", "Gestionar configuracion", "Gestionar admins", "Cambiar accesos", "Gestionar seguridad"]
      : role === "admin"
        ? ["Gestionar servicios", "Gestionar citas", "Gestionar equipo", "Gestionar galeria", "Gestionar productos"]
        : ["Ver mi calendario", "Ver mis citas"];

  return (
    <section className="rounded-lg border border-cocoa/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cocoa">Permisos segun rol</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {permissions.map((permission) => (
          <span key={permission} className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-cocoa">
            {permission}
          </span>
        ))}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      {children}
    </label>
  );
}
