import { AppointmentDetails } from "@/components/admin/AppointmentDetails";
import { requireAdminPageAccess } from "@/lib/admin-auth";
import { getAdminAppointmentById } from "@/lib/admin-appointments";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAdminPageAccess(`/admin/citas/${id}`);
  const appointment = await getAdminAppointmentById(id);

  if (session?.role === "colaborador" && appointment?.staffMemberId !== session.staffMemberId) {
    return <AppointmentDetails appointment={null} />;
  }

  return <AppointmentDetails appointment={appointment} />;
}
