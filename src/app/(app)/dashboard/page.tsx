import Link from "next/link";
import { ProjectList } from "@/components/ProjectList";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/db/repo";

export default async function Dashboard() {
  const user = await requireUser();
  const projects = (await listProjects(user.id)).slice(0, 6);
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Halo, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sub">Mau bikin video apa hari ini?</p>
        </div>
        <Link href="/projects/new" className="btn-primary">+ Create Project</Link>
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent Projects</h2>
          <Link href="/projects" className="text-sm text-brand">Lihat semua</Link>
        </div>
        <ProjectList projects={projects} />
      </section>
    </div>
  );
}
