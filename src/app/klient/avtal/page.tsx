import Link from "next/link";
import { readClientSession } from "@/lib/portal/session";
import { listOwnClientContracts } from "@/lib/portal/contracts";
import { contractStatusLabel } from "@/lib/portal/status-tones";
import { formatDate } from "@/lib/portal/format";
import { Card, CardTitle, Empty, Label } from "@/components/klient/klient-ui";

function formatAmount(amount: number | null, currency: string): string | null {
  if (amount === null) return null;
  return `${amount.toLocaleString("sv-SE")} ${currency}`;
}

export default async function ClientAvtalPage() {
  const session = await readClientSession();
  if (!session) return null;

  const contracts = await listOwnClientContracts();

  return (
    <div className="space-y-6">
      <header className="pb-1">
        <h1 className="text-[1.75rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2rem]">Avtal</h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">Dina coachningsavtal med CVB Coaching.</p>
      </header>

      {contracts.length === 0 ? (
        <Empty>Inga avtal ännu.</Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {contracts.map((contract) => (
            <Link key={contract.id} href={`/klient/avtal/${contract.id}`}>
              <Card>
                <Label>{contractStatusLabel[contract.status]}</Label>
                <CardTitle>{contract.title}</CardTitle>
                <p className="mt-2 text-[0.875rem] text-zinc-500">
                  CVB Coaching · {formatDate(contract.createdAt)}
                  {formatAmount(contract.priceAmount, contract.currency)
                    ? ` · ${formatAmount(contract.priceAmount, contract.currency)}`
                    : ""}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
