import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import "./globals.css";

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const sans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flownic",
  description:
    "Practice the conversation before it counts — AI-guided peer speaking practice for telc Deutsch B1.",
  icons: {
    icon: "/flownic-logo.svg",
  },
};

const themeInitScript = `
(() => {
  try {
    const stored = localStorage.getItem('flownic-theme');
    const theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider>
          <header className="border-b border-[var(--color-border)]/80 bg-[var(--color-surface)]/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
              <BrandLogo priority />
              <nav className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
                <Link href="/practice" className="hover:text-[var(--color-fg)]">
                  Practice
                </Link>
                <Link href="/login" className="hover:text-[var(--color-fg)]">
                  Sign in
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
          <footer className="border-t border-[var(--color-border)]/80 px-4 py-6 text-center text-xs text-[var(--color-muted)]">
            Not affiliated with telc. Feedback is practice guidance, not an
            official score.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
