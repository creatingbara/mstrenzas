"use client";

import Link from "next/link";
import { CalendarClock, Clock, Edit3, KeyRound, MoreHorizontal, Power, PowerOff, Sparkles, UserRound } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { displayContactEmail } from "@/lib/utils/username";
import type { StaffRole } from "@/types/staff";

export type TeamAccessMember = {
  id: string;
  profileId?: string | null;
  staffId?: string | null;
  fullName: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  role: StaffRole;
  isActive: boolean;
  avatarUrl?: string | null;
  specialty?: string | null;
  calendarColor?: string | null;
  serviceIds: string[];
  serviceNames: string[];
  upcomingAppointments?: number;
  appointmentCount?: number;
  createdAt?: string | null;
};

const roleLabels: Record<StaffRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  colaborador: "Colaborador"
};

export function TeamAccessCard({
  member,
  busy,
  onLifecycle
}: {
  member: TeamAccessMember;
  busy: boolean;
  onLifecycle: (member: TeamAccessMember, action: "activate" | "deactivate" | "delete") => void;
}) {
  const initials = member.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const memberPath = `/admin/equipo/${member.staffId || member.profileId || member.id}`;
  const isCollaborator = Boolean(member.staffId);

  return (
    <article className="overflow-hidden rounded-lg border border-cocoa/10 bg-white shadow-[0_18px_50px_rgba(101,0,77,0.08)]">
      <div className="relative h-24 bg-[radial-gradient(circle_at_top_left,rgba(193,132,168,0.62),transparent_34%),linear-gradient(135deg,#65004d,#2a001f)]">
        <span
          className={cn(
            "absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold",
            member.isActive ? "bg-white text-emerald-700" : "bg-white text-rose-700"
          )}
        >
          {member.isActive ? "Activo" : "Inactivo"}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-cocoa">
          {roleLabels[member.role]}
        </span>
      </div>

      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end justify-between gap-3">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="size-20 rounded-full border-4 border-white bg-cream object-cover shadow-soft"
            />
          ) : (
            <span
              className="grid size-20 place-items-center rounded-full border-4 border-white text-xl font-black text-white shadow-soft"
              style={{ backgroundColor: member.calendarColor || "#9b1178" }}
            >
              {initials}
            </span>
          )}
          <span className="mb-2 flex items-center gap-2 rounded-full bg-cream px-3 py-1 text-xs font-bold text-cocoa">
            <span className="size-3 rounded-full" style={{ backgroundColor: member.calendarColor || "#9b1178" }} />
            Calendario
          </span>
        </div>

        <div className="mt-4">
          <h3 className="line-clamp-1 text-xl font-black text-ink">{member.fullName}</h3>
          <p className="mt-1 text-sm font-semibold text-cocoa">@{member.username}</p>
          <p className="mt-2 min-h-10 text-sm leading-5 text-muted">{member.specialty || "Sin especialidad definida"}</p>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-muted">
          <span className="flex items-center gap-2">
            <UserRound size={16} />
            {member.phone || "Sin telefono"} · {displayContactEmail(member.email)}
          </span>
          <span className="flex items-center gap-2">
            <Sparkles size={16} />
            Servicios asignados: <strong className="text-ink">{member.serviceIds.length}</strong>
          </span>
          <span className="flex items-center gap-2">
            <CalendarClock size={16} />
            Proximas citas: <strong className="text-ink">{member.upcomingAppointments ?? 0}</strong>
          </span>
        </div>

        {member.serviceNames.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {member.serviceNames.slice(0, 3).map((name) => (
              <span key={name} className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-cocoa">
                {name}
              </span>
            ))}
            {member.serviceNames.length > 3 && (
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold text-cocoa">+{member.serviceNames.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link href={memberPath} className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
            <Edit3 size={16} />
            Editar
          </Link>
          <Link href={`${memberPath}?tab=acceso`} className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
            <KeyRound size={16} />
            Acceso
          </Link>
          {isCollaborator ? (
            <>
              <Link href={`/admin/equipo/${member.staffId}/horario`} className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
                <Clock size={16} />
                Horario
              </Link>
              <Link href={`/admin/equipo/${member.staffId}/servicios`} className={buttonStyles({ variant: "outline", className: "rounded-lg" })}>
                <Sparkles size={16} />
                Servicios
              </Link>
            </>
          ) : (
            <span className="col-span-2 rounded-lg border border-cocoa/10 bg-cream px-4 py-3 text-center text-sm font-semibold text-muted">
              Servicios y horario no aplican a este rol
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={member.isActive ? "ghost" : "primary"}
            className="rounded-lg"
            disabled={busy}
            onClick={() => onLifecycle(member, member.isActive ? "deactivate" : "activate")}
          >
            {member.isActive ? <PowerOff size={16} /> : <Power size={16} />}
            {member.isActive ? "Desactivar" : "Activar"}
          </Button>
          {(member.appointmentCount ?? 0) === 0 && (
            <Button type="button" variant="ghost" className="rounded-lg" disabled={busy} onClick={() => onLifecycle(member, "delete")}>
              <MoreHorizontal size={16} />
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
