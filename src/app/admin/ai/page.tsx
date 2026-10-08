import { AiSettingsForm } from "@/components/admin/AiSettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getAiStatus } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminAi() {
  await requireAdmin();
  const status = await getAiStatus();
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">AI Settings</h1>
        <p className="text-sm text-sub">Pilih provider AI yang menghasilkan hook, script, dan scene. Key disimpan terenkripsi di server dan tidak pernah ditampilkan lagi.</p>
      </div>
      <AiSettingsForm initial={status} />
    </div>
  );
}
