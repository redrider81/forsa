import Link from "next/link";
import { readClientSession } from "@/lib/portal/session";
import { listOwnClientContracts } from "@/lib/portal/contracts";
import { contractStatusLabel } from "@/lib/portal/status-tones";
import { formatDate } from "@/lib/portal/format";
import {
  canShowWithdrawalFunction,
  formatStockholmDateTime,
  formatWithdrawalLastDay,
} from "@/lib/portal/contract-withdrawal-rules";
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
    <div className="mx-auto w-full max-w-3xl space-y-6">
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
                  CVB Coaching · {formatDate(contract.createdAt.slice(0, 10))}
                  {formatAmount(contract.priceAmount, contract.currency)
                    ? ` · ${formatAmount(contract.priceAmount, contract.currency)}`
                    : ""}
                </p>
                {contract.withdrawal ? (
                  <p className="mt-1.5 text-[0.8125rem] text-zinc-500">
                    Ångrat {formatStockholmDateTime(contract.withdrawal.requestedAt)}
                  </p>
                ) : canShowWithdrawalFunction(contract) ? (
                  <p className="mt-1.5 text-[0.8125rem] text-zinc-600">
                    Ångra avtal:{" "}
                    {contract.withdrawalDeadline
                      ? `möjligt till och med ${formatWithdrawalLastDay(contract.withdrawalDeadline)}`
                      : "möjligt nu"}{" "}
                    — öppna avtalet
                  </p>
                ) : null}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
