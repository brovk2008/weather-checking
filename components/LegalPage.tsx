import Link from "next/link";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="app-shell">
      <section className="glass-card mx-auto max-w-4xl rounded-[2rem] p-8">
        <Link href="/" className="text-muted">Back to Weather Checking</Link>
        <h1 className="mt-6 text-4xl font-bold">{title}</h1>
        <p className="text-muted mt-4">Effective date: June 1, 2026</p>
        <div className="mt-8 space-y-5 leading-7 text-[color:var(--foreground)]">{children}</div>
      </section>
    </main>
  );
}
