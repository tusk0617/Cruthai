import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/ProjectEditor";
import { requireUser } from "@/lib/auth";
import { getProject } from "@/lib/db/repo";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const project = await getProject(user.id, (await params).id);
  if (!project) notFound();
  return <ProjectEditor project={project} />;
}
