import { LoginForm } from "@/features/intake/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="animate-fade-in space-y-6">
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Sign in
        </h1>
        <p className="max-w-lg text-[var(--color-muted)]">
          Passwordless email for booking and saved progress. You can also{" "}
          <Link href="/practice" className="text-[var(--color-brand-violet)]">
            start practicing without an account
          </Link>
          .
        </p>
      </div>
      <LoginForm />
    </section>
  );
}
