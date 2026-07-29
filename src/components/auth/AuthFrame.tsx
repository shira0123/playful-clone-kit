import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <main className="min-h-screen bg-navy px-4 py-10 sm:py-16"><div className="mx-auto w-full max-w-md"><Link to="/" className="mb-10 flex justify-center"><img src={logo} alt="EVOLVE TRADE HUB" className="h-12 rounded bg-white px-3 py-1" /></Link><section className="rounded-xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8"><h1 className="text-center text-3xl font-bold text-navy">{title}</h1><p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>{children}</section></div></main>;
}
export function FormMessage({ message }: { message?: string }) { return message ? <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p> : null; }
