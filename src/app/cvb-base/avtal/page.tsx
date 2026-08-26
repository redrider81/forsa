import Link from "next/link";
import { readCoachSession } from "@/lib/portal/session";
import { listCoachContracts } from "@/lib/portal/contracts";
import { formatDate } from "@/lib/portal/format";
import { contractStatusLabel, contractStatusTagTone } from "@/lib/portal/status-tones";
import { Divider, EmptyState, PageHeading, Panel, PanelHeading, RowLink, Tag, portalButtonClass, portalOutlineButtonClass, portalPageStackClass } from "@/components/portal/ui";

function formatAmount(amount: number | null, currency: string): string | null {
  if (amount === null) return null;
  return `${amount.toLocaleString("sv-SE")} ${currency}`;
}

export default async function AvtalOverviewPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const contracts = await listCoachContracts();

  return (
    <div className={portalPageStackClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading label="Avtal" title="Avtal" lead="Skapa, skicka och signera coachningsavtal med dina klienter." />
        <div className="flex flex-wrap gap-2.5">
          <Link href="/cvb-base/avtal/mallar" className={portalOutlineButtonClass}>
            Mallar
          </Link>
          <Link href="/cvb-base/avtal/ny" className={portalButtonClass}>
            + Nytt avtal
          </Link>
        </div>
      </div>

      <Panel>
        <PanelHeading label="Alla avtal" title="Dina avtal" />
        <div className="mt-4">
          {contracts.length === 0 ? (
            <EmptyState>Inga avtal ännu. Skapa ditt första avtal.</EmptyState>
          ) : (
            contracts.map((contract, index) => (
              <div key={contract.id}>
                {index > 0 ? <Divider /> : null}
                <RowLink
                  href={`/cvb-base/avtal/${contract.id}`}
                  title={contract.title}
                  subtitle={`${contract.clientName ?? "Okänd klient"} · ${formatDate(contract.createdAt)}${
                    formatAmount(contract.priceAmount, contract.currency)
                      ? ` · ${formatAmount(contract.priceAmount, contract.currency)}`
                      : ""
                  }`}
                  trailing={<Tag tone={contractStatusTagTone[contract.status]}>{contractStatusLabel[contract.status]}</Tag>}
                />
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
