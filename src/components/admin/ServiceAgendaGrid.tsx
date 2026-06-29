"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Plus, Search, SlidersHorizontal } from "lucide-react";
import { ServiceAgendaCard } from "@/components/admin/ServiceAgendaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Service } from "@/types/service";
import type { StaffMember } from "@/types/staff";

export function ServiceAgendaGrid({
  services: initialServices,
  staffMembers,
  staffByService
}: {
  services: Service[];
  staffMembers: StaffMember[];
  staffByService: Record<string, string[]>;
}) {
  const [services, setServices] = useState(initialServices);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [booking, setBooking] = useState("all");
  const [staffId, setStaffId] = useState("all");
  const [notice, setNotice] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(services.map((service) => service.category))).sort(), [services]);

  const filtered = services.filter((service) => {
    const normalizedQuery = query.trim().toLowerCase();
    const assignedStaff = staffByService[service.id] ?? [];
    if (normalizedQuery && !`${service.name} ${service.category} ${service.description}`.toLowerCase().includes(normalizedQuery)) return false;
    if (category !== "all" && service.category !== category) return false;
    if (status === "active" && service.active === false) return false;
    if (status === "inactive" && service.active !== false) return false;
    if (booking === "enabled" && service.bookingEnabled === false) return false;
    if (booking === "disabled" && service.bookingEnabled !== false) return false;
    if (staffId !== "all" && !assignedStaff.includes(staffId)) return false;
    return true;
  });

  async function toggleStatus(service: Service) {
    setNotice(null);
    try {
      const response = await fetch("/api/admin/servicios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, active: service.active === false })
      });
      const result = (await response.json()) as { item?: Service; error?: string; message?: string };
      if (!response.ok || !result.item) throw new Error(result.error || "No se pudo actualizar el servicio.");
      setServices((current) => current.map((item) => (item.id === result.item?.id ? result.item : item)));
      setNotice(result.message || "Servicio actualizado.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo actualizar el servicio.");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-cream text-cocoa shadow-sm">
            <CalendarDays size={28} />
          </span>
          <div>
          <h2 className="text-3xl font-black text-ink md:text-4xl">Servicios y Agenda</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Administra los servicios, sus imagenes, precios, duracion, colaboradores y disponibilidad de agenda.
          </p>
          </div>
        </div>
        <Link href="/admin/servicios-agenda/nuevo">
          <Button className="rounded-lg px-6">
            <Plus size={18} />
            Nuevo servicio
          </Button>
        </Link>
      </div>

      {notice && <p className="rounded-lg bg-cream p-3 text-sm font-semibold text-cocoa">{notice}</p>}

      <div className="grid gap-3 rounded-lg border border-cocoa/10 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar servicio..." className="rounded-lg pl-10" />
        </label>
        <select className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">Todas las categorias</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
        <select className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3 text-sm" value={booking} onChange={(event) => setBooking(event.target.value)}>
          <option value="all">Agenda: todas</option>
          <option value="enabled">Agenda activa</option>
          <option value="disabled">Agenda inactiva</option>
        </select>
        <select className="min-h-11 rounded-lg border border-cocoa/20 bg-white px-3 text-sm" value={staffId} onChange={(event) => setStaffId(event.target.value)}>
          <option value="all">Todos los colaboradores</option>
          {staffMembers.map((staff) => (
            <option key={staff.id} value={staff.id}>{staff.fullName}</option>
          ))}
        </select>
      </div>

      {(query || category !== "all" || status !== "all" || booking !== "all" || staffId !== "all") && (
        <Button
          type="button"
          variant="outline"
          className="w-fit rounded-lg"
          onClick={() => {
            setQuery("");
            setCategory("all");
            setStatus("all");
            setBooking("all");
            setStaffId("all");
          }}
        >
          <SlidersHorizontal size={17} />
          Limpiar filtros
        </Button>
      )}

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((service) => (
          <ServiceAgendaCard
            key={service.id}
            service={service}
            assignedStaffCount={(staffByService[service.id] ?? []).length}
            onToggleStatus={toggleStatus}
          />
        ))}
      </div>

      {!filtered.length && <p className="rounded-lg bg-white p-5 text-sm text-muted shadow-soft">No hay servicios con esos filtros.</p>}
    </div>
  );
}
