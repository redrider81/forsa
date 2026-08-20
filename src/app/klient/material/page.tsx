import { notFound } from "next/navigation";
import MaterialWorkspace from "@/components/klient/material-workspace";
import { readClientSession } from "@/lib/portal/session";
import { getClientPerspective, getCoach } from "@/lib/portal/repository";

export default async function ClientMaterialPage() {
  const session = await readClientSession();
  if (!session) return null;

  const view = await getClientPerspective(getCoach().id, session.clientId);
  if (!view) notFound();

  const linkContext = {
    sessions: view.sessions.map((item) => ({
      id: item.id,
      label: `Session ${item.number}${item.status === "kommande" ? " (nästa)" : ""}`,
    })),
    commitments: view.commitments.map((item) => ({
      id: item.id,
      label: item.text.length > 60 ? `${item.text.slice(0, 60)}…` : item.text,
    })),
  };

  return (
    <MaterialWorkspace
      clientId={session.clientId}
      materials={view.materials}
      linkContext={linkContext}
    />
  );
}
