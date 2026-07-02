"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CollaboratorPhotoUploader } from "@/components/admin/CollaboratorPhotoUploader";
import { PasskeySecurityPanel } from "@/components/admin/PasskeySecurityPanel";
import { ProfilePhotoUploader } from "@/components/admin/ProfilePhotoUploader";
import { PushNotificationsPanel } from "@/components/admin/PushNotificationsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import type { StaffMember, UserProfile } from "@/types/staff";

export function SelfProfileForm({
  profile,
  staff
}: {
  profile: UserProfile;
  staff?: StaffMember | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: profile.email,
    phone: staff?.phone || profile.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatarUrl: staff?.photoUrl || profile.avatarUrl || ""
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    if ((form.currentPassword || form.newPassword || form.confirmPassword) && form.newPassword !== form.confirmPassword) {
      setNotice("La nueva contrasena y la confirmacion no coinciden.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone,
          currentPassword: form.currentPassword || null,
          newPassword: form.newPassword || null,
          confirmPassword: form.confirmPassword || null
        })
      });
      const result = (await response.json()) as { item?: UserProfile; error?: string; message?: string };
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo guardar el perfil.");

      setForm((current) => ({
        ...current,
        email: result.item?.email || current.email,
        phone: result.item?.phone || current.phone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      setNotice(result.message || "Perfil actualizado correctamente.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-lg border border-cocoa/10 bg-white p-5 shadow-soft">
      {profile.forcePasswordChange && (
        <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">
          Debes cambiar tu contrasena para continuar usando el panel.
        </p>
      )}

      <section className="grid gap-4">
        {staff ? (
          <CollaboratorPhotoUploader
            staffId={staff.id}
            fullName={profile.fullName}
            currentUrl={form.avatarUrl}
            onChange={(avatarUrl) => setForm((current) => ({ ...current, avatarUrl: avatarUrl || "" }))}
          />
        ) : (
          <ProfilePhotoUploader
            profileId={profile.id}
            fullName={profile.fullName}
            currentUrl={form.avatarUrl}
            onChange={(avatarUrl) => setForm((current) => ({ ...current, avatarUrl: avatarUrl || "" }))}
          />
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Field label="Correo">
          <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </Field>
        <Field label="Numero de telefono">
          <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </Field>
      </section>

      <section className="grid gap-4 rounded-lg border border-cocoa/10 bg-cream/50 p-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-ink">Cambiar contrasena</h3>
          <p className="mt-1 text-sm text-muted">Usa mayusculas, minusculas, numeros y un caracter especial.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Contrasena anterior">
            <PasswordInput
              value={form.currentPassword}
              onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
              placeholder="Contrasena actual"
            />
          </Field>
          <Field label="Nueva contrasena">
            <PasswordInput
              value={form.newPassword}
              onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
              placeholder="Minimo 8 caracteres"
            />
          </Field>
          <Field label="Confirmar contrasena">
            <PasswordInput
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              placeholder="Repite la nueva"
            />
          </Field>
        </div>
      </section>

      <PasskeySecurityPanel />
      <PushNotificationsPanel />

      <Button type="submit" className="rounded-lg" disabled={saving}>
        {saving ? "Guardando..." : "Guardar perfil"}
      </Button>
      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}
    </form>
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
