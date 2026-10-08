import { NewProjectForm } from "@/components/NewProjectForm";
import { TEMPLATES } from "@/config/templates";

export default async function NewProject({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams;
  const t = TEMPLATES.find((x) => x.id === template);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Project</h1>
        <p className="text-sub">Pilih mode, isi brief singkat, dan dapatkan video plan siap shooting.</p>
      </div>
      <NewProjectForm initial={t?.brief} templateName={t?.name} />
    </div>
  );
}
