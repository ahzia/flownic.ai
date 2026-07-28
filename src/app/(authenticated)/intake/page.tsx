import { IntakeForm } from "@/features/intake/intake-form";

export default function IntakePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Practice profile
        </h1>
        <p className="max-w-lg text-[var(--muted)]">
          One track only: telc Deutsch B1 speaking. Adults 18+. Your exam date
          drives urgency and matching.
        </p>
      </div>
      <IntakeForm />
    </section>
  );
}
