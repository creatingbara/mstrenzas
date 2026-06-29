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
      <div className="overflow-x-auto rounded-lg border border-cocoa/10 bg-white">
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
