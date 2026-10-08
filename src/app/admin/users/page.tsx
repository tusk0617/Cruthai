import { UsersTable } from "@/components/admin/UsersTable";
import { requireAdmin } from "@/lib/auth";
import { adminListUsers } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const me = await requireAdmin();
  const { q = "" } = await searchParams;
  const users = await adminListUsers(q);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Users <span className="text-base font-normal text-sub">({users.length})</span></h1>
        <form className="w-full sm:w-72"><input name="q" defaultValue={q} placeholder="Cari nama / email…" className="input" aria-label="Cari user" /></form>
      </div>
      <UsersTable users={users} meId={me.id} />
    </div>
  );
}
