"use client";

import { useState, type FormEvent } from "react";
import { validateIntake } from "@/domain/booking/intake";
import { Button } from "@/components/ui/button";

export function IntakeForm() {
  const [result, setResult] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = validateIntake({
      displayName: form.get("displayName"),
      timezone: form.get("timezone"),
      uiLocale: form.get("uiLocale"),
      feedbackLocale: form.get("feedbackLocale"),
      examDate: form.get("examDate"),
      ageConfirmed: form.get("ageConfirmed") === "on" ? true : false,
      acquisitionChannel: form.get("acquisitionChannel") || undefined,
    });

    if (!response.ok) {
      setFieldErrors(response.error.fieldErrors ?? {});
      setResult(response.error.message);
      return;
    }

    setFieldErrors({});
    setResult(
      `Intake validated for ${response.data.trackSlug}. Connect Supabase to persist.`,
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-lg flex-col gap-4">
      <Field
        label="Display name"
        name="displayName"
        required
        error={fieldErrors.displayName?.[0]}
      />
      <Field
        label="Timezone (IANA)"
        name="timezone"
        defaultValue="Europe/Berlin"
        required
        error={fieldErrors.timezone?.[0]}
      />
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">UI language</span>
        <select
          name="uiLocale"
          defaultValue="de"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Feedback language</span>
        <select
          name="feedbackLocale"
          defaultValue="de"
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
      </label>
      <Field
        label="Exam date"
        name="examDate"
        type="date"
        required
        error={fieldErrors.examDate?.[0]}
      />
      <Field
        label="How did you hear about Flownic? (optional)"
        name="acquisitionChannel"
      />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="ageConfirmed" required className="mt-1" />
        <span>I confirm I am 18 or older.</span>
      </label>
      <Button type="submit">Save practice profile</Button>
      {result ? (
        <p role="status" className="text-sm text-[var(--color-muted)]">
          {result}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 outline-none ring-[var(--color-accent)] focus:ring-2"
      />
      {error ? (
        <span className="text-[var(--color-danger)]">{error}</span>
      ) : null}
    </label>
  );
}
