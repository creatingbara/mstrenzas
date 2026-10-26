import { redirect } from "next/navigation";

export default async function LegacyCollaboratorSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/equipo/${id}/horario`);
}
