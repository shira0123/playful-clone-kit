import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled
          ? "bg-navy/95 border-white/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]"
          : "bg-navy/80 border-transparent"
      }`}
    >
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Evolve Digital Trade" className={`w-auto bg-white rounded px-2 py-1 transition-all ${scrolled ? "h-8" : "h-9"}`} />
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/90">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="story-link hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label.toUpperCase()}
            </Link>
          ))}
          <a href="https://app.e-directpro.com/register" className="text-white/90 hover:text-gold transition-colors">CREATE ACCOUNT</a>
          <a
            href="https://app.e-directpro.com/login"
            className="relative overflow-hidden rounded-md bg-gold px-4 py-2 text-navy font-semibold shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--gold)_60%,transparent)] hover:shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--gold)_75%,transparent)] transition-shadow before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent"
          >
            <span className="relative">ACCOUNT LOGIN</span>
          </a>
        </nav>
        <button
          className="lg:hidden text-white p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden border-t border-white/10 bg-navy overflow-hidden"
          >
            <motion.div
              className="px-4 py-4 flex flex-col gap-1 text-white text-base"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
            >
              {nav.map((n) => (
                <motion.div
                  key={n.to}
                  variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                >
                  <Link to={n.to} className="block py-2 hover:text-gold">{n.label}</Link>
                </motion.div>
              ))}
              <motion.a
                variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                href="https://app.e-directpro.com/register"
                className="block py-2 hover:text-gold"
              >
                Create Account
              </motion.a>
              <motion.a
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                href="https://app.e-directpro.com/login"
                className="mt-3 rounded-md bg-gold px-4 py-3 text-navy font-semibold text-center"
              >
                Account Login
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
