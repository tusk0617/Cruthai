import { requireAdmin } from "@/lib/auth";
import { AdminProjectsTable } from "@/components/admin/AdminProjectsTable";
import { adminListProjects } from "@/lib/db/admin";

export const dynamic = "force-dynamic";

export default async function AdminProjects({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  await requireAdmin();
  const projects = await adminListProjects(q);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Projects <span className="text-base font-normal text-sub">({projects.length})</span></h1>
        <form className="w-full sm:w-72"><input name="q" defaultValue={q} placeholder="Cari project / owner…" className="input" aria-label="Cari project" /></form>
      </div>
      <AdminProjectsTable projects={projects} />
    </div>
  );
}
