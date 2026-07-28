export default function BookPage() {
  return (
    <section className="animate-fade-in space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Practice slots
        </h1>
        <p className="max-w-lg text-[var(--color-muted)]">
          Fixed practice slots will appear here once published. You can{" "}
          <a href="/practice" className="text-[var(--color-brand-violet)]">
            start a session now
          </a>{" "}
          without booking.
        </p>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-sm text-[var(--color-muted)]">
        No published slots yet. Apply the database migration, then create
        published practice slots for telc-de-b1-speaking.
      </div>
    </section>
  );
}
