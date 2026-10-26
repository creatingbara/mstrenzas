import { redirect } from "next/navigation";

export default async function LegacyCollaboratorServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/equipo/${id}/servicios`);
}
