import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BottomNav, Nav } from "@/components/Nav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { requireUser } from "@/lib/auth";
import { getPlan } from "@/config/pricing";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="hidden border-r border-line bg-surface p-4 md:sticky md:top-0 md:block md:h-screen">
        <div className="mb-8"><Logo href="/dashboard" /></div>
        <Nav />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-bg/90 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-5 sm:py-3">
          <div className="md:hidden"><Logo href="/dashboard" /></div>
          <form action="/projects" className="hidden flex-1 sm:block">
            <input name="q" placeholder="Cari project…" className="input max-w-md" aria-label="Cari project" />
          </form>
          <div className="flex-1 sm:hidden" />
          <Link href="/settings" className="chip" title="Sisa kredit generate">⚡ {user.credits}<span className="hidden sm:inline">&nbsp;kredit</span></Link>
          {user.isAdmin && <Link href="/admin" className="btn-ghost btn-sm">Admin</Link>}
          <ThemeToggle />
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-right leading-tight sm:block"><b className="block">{user.name}</b><span className="text-xs text-sub">{getPlan(user.plan).name}</span></span>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4 pb-28 sm:p-5 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
