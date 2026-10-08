"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/dashboard", "Dashboard", "Home", "🏠"],
  ["/projects/new", "Create Project", "Buat", "＋"],
  ["/projects", "My Projects", "Project", "📁"],
  ["/templates", "Templates", "Template", "✨"],
  ["/settings", "Settings", "Akun", "⚙️"],
] as const;

function useActive() {
  const path = usePathname();
  return (href: string) => (href === "/projects" ? path === "/projects" || (path.startsWith("/projects/") && path !== "/projects/new") : path === href);
}

/** Desktop sidebar links. */
export function Nav() {
  const active = useActive();
  return (
    <nav className="flex flex-col gap-1">
      {items.map(([href, label]) => (
        <Link key={href} href={href}
          className={"rounded-xl px-3 py-2 text-sm font-medium transition " + (active(href) ? "bg-brand/10 text-brand" : "text-sub hover:bg-muted hover:text-ink")}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** Mobile bottom tab bar (thumb-reachable). */
export function BottomNav() {
  const active = useActive();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Navigasi utama">
      {items.map(([href, , short, icon]) => (
        <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}
          className={"flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium " + (active(href) ? "text-brand" : "text-sub")}>
          <span className="text-lg leading-none">{icon}</span>{short}
        </Link>
      ))}
    </nav>
  );
}
