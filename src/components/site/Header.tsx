import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/investment", label: "Investment" },
  { to: "/company", label: "Our Company" },
  { to: "/insights", label: "Insights" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Evolve Digital Trade" className="h-9 w-auto bg-white rounded px-2 py-1" />
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/90">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label.toUpperCase()}
            </Link>
          ))}
          <a href="https://app.e-directpro.com/register" className="text-white/90 hover:text-gold">CREATE ACCOUNT</a>
          <a href="https://app.e-directpro.com/login" className="rounded-md bg-gold px-4 py-2 text-navy font-semibold hover:brightness-110">ACCOUNT LOGIN</a>
        </nav>
        <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-navy px-4 py-4 flex flex-col gap-3 text-white text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="hover:text-gold">
              {n.label}
            </Link>
          ))}
          <a href="https://app.e-directpro.com/register" className="hover:text-gold">Create Account</a>
          <a href="https://app.e-directpro.com/login" className="rounded-md bg-gold px-4 py-2 text-navy font-semibold text-center">Account Login</a>
        </div>
      )}
    </header>
  );
}
