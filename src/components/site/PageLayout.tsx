import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white py-24 md:py-32">
      <div className="absolute inset-0 opacity-40 [background:radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--gold)_35%,transparent),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-lg text-white/70 max-w-3xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
