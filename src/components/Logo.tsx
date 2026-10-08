import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-sm text-white dark:text-stone-950">▶</span>
      crutha.ai
    </Link>
  );
}
