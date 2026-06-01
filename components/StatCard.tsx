import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  detail
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="glass-card rounded-[1.6rem] p-5">
      <div className="flex items-center gap-3">
        <span className="accent-gradient rounded-2xl p-3 text-slate-950">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-muted text-sm">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
      <p className="text-muted mt-4 text-sm">{detail}</p>
    </article>
  );
}
