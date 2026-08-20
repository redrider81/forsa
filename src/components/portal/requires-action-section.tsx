"use client";

import { useState } from "react";
import type { OperationsItem } from "@/lib/portal/repository";
import { sortActionItems } from "@/lib/portal/operations-priority";
import { ActionRow } from "@/components/portal/operations";
import {
  Divider,
  Panel,
  portalQuietLinkClass,
  PortalSectionHeader,
} from "@/components/portal/ui";

const ACTION_PREVIEW = 5;

export function RequiresActionSection({
  items,
  today,
}: {
  items: OperationsItem[];
  today: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = sortActionItems(items, today);
  const visible = expanded ? sorted : sorted.slice(0, ACTION_PREVIEW);
  const hiddenCount = Math.max(sorted.length - ACTION_PREVIEW, 0);

  return (
    <Panel>
      <PortalSectionHeader
        label="Prioriterat"
        title="Kräver åtgärd"
        context={
          items.length === 1 ? "1 öppen punkt" : `${items.length} öppna punkter`
        }
      />
      <div className="mt-5">
        {sorted.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--klient-border-muted)] bg-[var(--klient-text-block-bg)] px-4 py-4 text-[0.9375rem] text-zinc-600">
            Inga öppna åtgärdspunkter just nu.
          </p>
        ) : (
          <>
            {visible.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <Divider /> : null}
                <ActionRow item={item} variant="priority" today={today} />
              </div>
            ))}
            {hiddenCount > 0 ? (
              <div className="mt-4 border-t border-[var(--klient-border-muted)] pt-4">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className={portalQuietLinkClass}
                >
                  {expanded ? "Visa färre" : `Visa alla ${sorted.length}`}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Panel>
  );
}
