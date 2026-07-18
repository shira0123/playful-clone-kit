import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-navy text-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-white/70 max-w-3xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
