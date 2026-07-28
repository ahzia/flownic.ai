import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";

export function BrandLogo({
  href = "/",
  className,
  priority,
}: {
  href?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center gap-2.5 text-[var(--color-fg)] no-underline",
        className,
      )}
    >
      <Image
        src="/flownic-logo.svg"
        alt=""
        width={32}
        height={32}
        priority={priority}
        className="h-8 w-8 shrink-0"
        aria-hidden
      />
      <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
        Flownic
      </span>
    </Link>
  );
}
