import { ProjectList } from "@/components/ProjectList";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/lib/db/repo";

export default async function Projects({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const q = (await searchParams).q ?? "";
  const projects = await listProjects(user.id, q);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Projects</h1>
      {q && <p className="text-sm text-sub">Hasil pencarian untuk “{q}” — {projects.length} project</p>}
      <ProjectList projects={projects} />
    </div>
  );
}
