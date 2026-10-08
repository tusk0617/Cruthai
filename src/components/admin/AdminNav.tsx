"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [["/admin", "Overview"], ["/admin/users", "Users"], ["/admin/projects", "Projects"], ["/admin/generations", "Generations"], ["/admin/audit", "Audit Log"], ["/admin/ai", "AI Settings"], ["/admin/plans", "Plans"]];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map(([href, label]) => (
        <Link key={href} href={href}
          className={"whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition " + (path === href ? "bg-brand/10 text-brand" : "text-sub hover:bg-muted hover:text-ink")}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
