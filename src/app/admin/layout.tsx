import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/LogoutButton";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-line bg-surface p-4 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="mb-3 flex items-center gap-2 md:mb-8"><Logo href="/admin" /><span className="chip bg-brand/10 text-brand">Admin</span></div>
        <AdminNav />
        <Link href="/dashboard" className="mt-4 hidden text-sm text-sub hover:text-ink md:block">← Kembali ke aplikasi</Link>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-end gap-2 border-b border-line px-4 py-2.5 sm:px-5">
          <Link href="/dashboard" className="btn-ghost btn-sm md:hidden">← Aplikasi</Link>
          <span className="mr-auto hidden text-sm text-sub sm:block">Masuk sebagai {admin.email}</span>
          <ThemeToggle /><LogoutButton />
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-5">{children}</main>
      </div>
    </div>
  );
}
