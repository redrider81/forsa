import Link from "next/link";
import { portalSegmentActiveClass, portalSegmentClass, portalSegmentInactiveClass } from "@/components/portal/ui";

export default function CalendarSubnav({ active }: { active: "kalender" | "tillganglighet" }) {
  const items = [
    { key: "kalender", label: "Kalender", href: "/portal/kalender" },
    { key: "tillganglighet", label: "Tillgänglighet", href: "/portal/kalender/tillganglighet" },
  ] as const;

  return (
    <nav aria-label="Kalendervy" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.key === active ? "page" : undefined}
          className={`${portalSegmentClass} ${item.key === active ? portalSegmentActiveClass : portalSegmentInactiveClass}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
