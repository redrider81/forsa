import Link from "next/link";
import { readCoachSession } from "@/lib/portal/session";
import { listContractTemplates } from "@/lib/portal/contracts";
import TemplateManager from "@/components/portal/avtal/template-manager";
import { PageHeading, portalQuietLinkClass, portalPageStackClass } from "@/components/portal/ui";

export default async function AvtalTemplatesPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const templates = await listContractTemplates();

  return (
    <div className={portalPageStackClass}>
      <div>
        <Link href="/cvb-base/avtal" className={portalQuietLinkClass}>
          ← Avtal
        </Link>
      </div>

      <PageHeading label="Avtal" title="Mallar" lead="Återanvändbara mallar för sektioner och fält. Ändringar påverkar aldrig redan skapade avtal." />

      <TemplateManager initialTemplates={templates} />
    </div>
  );
}
