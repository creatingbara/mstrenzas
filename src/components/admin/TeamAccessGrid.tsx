"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { TeamAccessCard, type TeamAccessMember } from "@/components/admin/TeamAccessCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TeamAccessGrid({
  members,
  services
}: {
  members: TeamAccessMember[];
  services: { id: string; name: string; category: string }[];
}) {
  const [items, setItems] = useState(members);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [specialty, setSpecialty] = useState("all");
  const [serviceId, setServiceId] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const specialties = useMemo(
    () => Array.from(new Set(items.map((item) => item.specialty).filter((item): item is string => Boolean(item)))).sort(),
    [items]
  );

  const filtered = items.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (
      normalizedQuery &&
      !`${item.fullName} ${item.username} ${item.email || ""} ${item.phone || ""}`.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }
    if (role !== "all" && item.role !== role) return false;
    if (status === "active" && !item.isActive) return false;
    if (status === "inactive" && item.isActive) return false;
    if (specialty !== "all" && item.specialty !== specialty) return false;
    if (serviceId !== "all" && !item.serviceIds.includes(serviceId)) return false;
    return true;
  });

  async function updateLifecycle(member: TeamAccessMember, action: "activate" | "deactivate" | "delete") {
    const hasHistory = (member.appointmentCount ?? 0) > 0;
    const confirmation =
      action === "delete"
        ? hasHistory
          ? "Este miembro tiene citas registradas. Por seguridad sera desactivado y se conservara el historial. Deseas continuar?"
          : `Este miembro no tiene citas. Deseas eliminar definitivamente a ${member.fullName}?`
        : action === "deactivate"
          ? `Deseas desactivar a ${member.fullName}? No podra entrar al panel.`
          : `Deseas activar a ${member.fullName}?`;

    if (!window.confirm(confirmation)) return;

    setBusyId(member.id);
    setNotice(null);

    try {
      const url = member.staffId
        ? `/api/admin/staff?id=${member.staffId}&action=${action}`
        : `/api/admin/users?profileId=${member.profileId}&action=${action}`;
      const response = await fetch(url, { method: "DELETE" });
      const result = (await response.json()) as { error?: string; message?: string; action?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar el miembro.");

      if (action === "delete" && result.action === "deleted") {
        setItems((current) => current.filter((item) => item.id !== member.id));
      } else {
        setItems((current) =>
          current.map((item) => (item.id === member.id ? { ...item, isActive: action === "activate" ? true : false } : item))
        );
      }
      setNotice(result.message || "Miembro actualizado correctamente.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo actualizar el miembro.");
    } finally {
      setBusyId(null);
    }
  }

  function clearFilters() {
    setQuery("");
    setRole("all");
    setStatus("all");
    setSpecialty("all");
    setServiceId("all");
  }

  return (
    <div className="grid min-w-0 gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-cream text-cocoa shadow-sm">
            <UserPlus size={28} />
          </span>
          <div>
            <h2 className="text-3xl font-black text-ink md:text-4xl">Equipo y Accesos</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              Administra colaboradores, administradores, accesos, roles, servicios asignados y horarios del equipo.
            </p>
          </div>
        </div>
        <Link href="/admin/equipo/nuevo">
          <Button className="rounded-lg px-6">
            <UserPlus size={18} />
            Nuevo miembro
          </Button>
        </Link>
      </div>

      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}

      <div className="grid min-w-0 gap-3 rounded-lg border border-cocoa/10 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(220px,1.3fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(180px,0.9fr)_minmax(180px,1fr)_auto]">
        <label className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, usuario o email"
            className="rounded-lg pl-10"
          />
        </label>
        <select className="min-h-11 min-w-0 rounded-lg border border-cocoa/20 bg-white px-3 text-sm" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="all">Todos los roles</option>
          <option value="colaborador">Colaborador</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super admin</option>
        </select>
        <select className="min-h-11 min-w-0 rounded-lg border border-cocoa/20 bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
        <select className="min-h-11 min-w-0 rounded-lg border border-cocoa/20 bg-white px-3 text-sm" value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
          <option value="all">Todas las especialidades</option>
          {specialties.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select className="min-h-11 min-w-0 rounded-lg border border-cocoa/20 bg-white px-3 text-sm" value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
          <option value="all">Todos los servicios</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" className="rounded-lg" onClick={clearFilters}>
          <SlidersHorizontal size={17} />
          Limpiar
        </Button>
      </div>

      <div className="grid min-w-0 gap-5 md:grid-cols-2 2xl:grid-cols-[repeat(3,minmax(0,1fr))]">
        {filtered.map((member) => (
          <TeamAccessCard key={member.id} member={member} busy={busyId === member.id} onLifecycle={updateLifecycle} />
        ))}
      </div>

      {!filtered.length && <p className="rounded-lg bg-white p-6 text-sm font-semibold text-muted shadow-sm">No hay miembros con esos filtros.</p>}
    </div>
  );
}
