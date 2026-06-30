"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonStyles } from "@/components/ui/button";
import { displayContactEmail } from "@/lib/utils/username";
import type { StaffMember } from "@/types/staff";

export function CollaboratorsTable({ staffMembers }: { staffMembers: StaffMember[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function updateStaff(staff: StaffMember, action: "activate" | "deactivate" | "delete") {
    const appointmentCount = staff.appointmentCount ?? 0;
    const confirmation =
      action === "delete"
        ? appointmentCount > 0
          ? "Este colaborador tiene citas registradas. Por seguridad será desactivado y se conservará el historial. ¿Deseas continuar?"
          : `Este colaborador no tiene citas. Se eliminará definitivamente el colaborador y su acceso de usuario. ¿Eliminar a ${staff.fullName}?`
        : action === "deactivate"
          ? `¿Desactivar a ${staff.fullName}? No aparecerá en la agenda pública ni podrá iniciar sesión.`
          : `¿Activar a ${staff.fullName}?`;

    if (!window.confirm(confirmation)) return;

    setBusyId(staff.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/staff?id=${staff.id}&action=${action}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string; message?: string; action?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar.");
      router.refresh();
      setNotice(result.message || (action === "delete" ? "Colaborador eliminado." : "Colaborador actualizado."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo actualizar.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:hidden">
        {staffMembers.map((staff) => (
          <article key={staff.id} className="rounded-lg border border-cocoa/10 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              {staff.photoUrl ? (
                <img src={staff.photoUrl} alt={staff.fullName} className="size-12 shrink-0 rounded-full object-cover" />
              ) : (
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: staff.calendarColor || "#65004d" }}
                >
                  {staff.fullName.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black text-ink">{staff.fullName}</p>
                <p className="text-sm font-semibold text-cocoa">@{staff.username}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{staff.specialty || "Sin especialidad"}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Info label="Estado" value={staff.isActive ? "Activo" : "Inactivo"} />
              <Info label="Servicios" value={String(staff.services.length)} />
              <Info label="Citas" value={String(staff.appointmentCount ?? 0)} />
              <Info label="Proximas" value={String(staff.upcomingAppointments ?? 0)} />
            </div>
            <div className="mt-3 grid gap-1 text-sm text-muted">
              <p>{staff.phone}</p>
              <p className="truncate">{displayContactEmail(staff.email)}</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link href={`/admin/colaboradores/${staff.id}`} className={buttonStyles({ variant: "outline" })}>
                Editar
              </Link>
              <Link href={`/admin/colaboradores/${staff.id}/horario`} className={buttonStyles({ variant: "ghost" })}>
                Horario
              </Link>
              <Link href={`/admin/colaboradores/${staff.id}/servicios`} className={buttonStyles({ variant: "ghost" })}>
                Servicios
              </Link>
              <Button type="button" variant="ghost" disabled={busyId === staff.id} onClick={() => updateStaff(staff, staff.isActive ? "deactivate" : "activate")}>
                {staff.isActive ? "Desactivar" : "Activar"}
              </Button>
              {(staff.appointmentCount ?? 0) === 0 && (
                <Button type="button" variant="outline" disabled={busyId === staff.id} onClick={() => updateStaff(staff, "delete")}>
                  Eliminar definitivamente
                </Button>
              )}
            </div>
          </article>
        ))}
        {!staffMembers.length && <p className="rounded-lg bg-white p-4 text-sm text-muted shadow-sm">No hay colaboradores registrados.</p>}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-cocoa/10 bg-white md:block">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-[0.14em] text-cocoa">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Email contacto</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Servicios</th>
              <th className="p-4">Citas registradas</th>
              <th className="p-4">Próximas citas</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff) => (
              <tr key={staff.id} className="border-t border-cocoa/10 align-top">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {staff.photoUrl ? (
                      <img src={staff.photoUrl} alt={staff.fullName} className="size-10 rounded-full object-cover" />
                    ) : (
                      <span
                        className="grid size-10 place-items-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: staff.calendarColor || "#65004d" }}
                      >
                        {staff.fullName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="font-semibold">{staff.fullName}</p>
                      <p className="text-xs text-muted">{staff.specialty || "Sin especialidad"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-semibold">{staff.username}</td>
                <td className="p-4">{staff.phone}</td>
                <td className="p-4">{displayContactEmail(staff.email)}</td>
                <td className="p-4">{staff.role}</td>
                <td className="p-4">{staff.isActive ? "Activo" : "Inactivo"}</td>
                <td className="p-4">{staff.services.length}</td>
                <td className="p-4">
                  <div className="grid gap-1">
                    <span className="font-semibold">{staff.appointmentCount ?? 0}</span>
                    <span className="max-w-[220px] text-xs text-muted">
                      {(staff.appointmentCount ?? 0) > 0
                        ? "Este colaborador tiene citas registradas. Por seguridad será desactivado y se conservará el historial."
                        : "Este colaborador no tiene citas. Puedes eliminarlo definitivamente junto con su acceso."}
                    </span>
                  </div>
                </td>
                <td className="p-4">{staff.upcomingAppointments ?? 0}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/colaboradores/${staff.id}`}
                      className={buttonStyles({ variant: "outline" })}
                      aria-label={`Editar ${staff.fullName}`}
                    >
                      Editar
                    </Link>
                    <Link
                      href={`/admin/colaboradores/${staff.id}/horario`}
                      className={buttonStyles({ variant: "ghost" })}
                      aria-label={`Editar horario de ${staff.fullName}`}
                    >
                      Horario
                    </Link>
                    <Link
                      href={`/admin/colaboradores/${staff.id}/servicios`}
                      className={buttonStyles({ variant: "ghost" })}
                      aria-label={`Editar servicios de ${staff.fullName}`}
                    >
                      Servicios
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={busyId === staff.id}
                      aria-label={`${staff.isActive ? "Desactivar" : "Activar"} ${staff.fullName}`}
                      onClick={() => updateStaff(staff, staff.isActive ? "deactivate" : "activate")}
                    >
                      {staff.isActive ? "Desactivar colaborador" : "Activar"}
                    </Button>
                    {(staff.appointmentCount ?? 0) === 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busyId === staff.id}
                        aria-label={`Eliminar definitivamente a ${staff.fullName}`}
                        onClick={() => updateStaff(staff, "delete")}
                      >
                        Eliminar definitivamente
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!staffMembers.length && <p className="p-4 text-sm text-muted">No hay colaboradores registrados.</p>}
      </div>
      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-cream/60 px-3 py-2">
      <span className="block text-xs font-bold uppercase tracking-[0.12em] text-cocoa">{label}</span>
      <span className="mt-1 block truncate font-semibold text-ink">{value}</span>
    </span>
  );
}
