import type { ActivityScore } from "@/types/weather";

export function GaugeGrid({ scores }: { scores: ActivityScore[] }) {
  return (
    <section className="glass-card rounded-[2rem] p-6" aria-label="Activity score gauges">
      <div className="mb-5">
        <p className="text-muted text-sm">Unique planning scores</p>
        <h2 className="text-2xl font-semibold">Outdoor decision engine</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {scores.map((item) => (
          <article key={item.name} className="solid-card rounded-[1.5rem] p-4">
            <div
              className="mx-auto grid h-28 w-28 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--accent) ${item.score * 3.6}deg, rgba(148,163,184,.22) 0deg)`
              }}
              aria-label={`${item.name} ${item.score} out of 100`}
            >
              <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--panel-strong)]">
                <span className="text-2xl font-bold">{item.score}</span>
              </div>
            </div>
            <h3 className="mt-4 font-semibold">{item.name}</h3>
            <p className="text-muted mt-2 text-sm">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
