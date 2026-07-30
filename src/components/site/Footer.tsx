import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white/80 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl text-white mb-3">EVOLVE TRADE HUB</h3>
          <p className="text-sm leading-relaxed">
            An A.I trading company devoted to your financial success. Regulated,
            transparent, and built for long-term investors.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/company" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/services" className="hover:text-gold">Services</Link></li>
            <li><Link to="/investment" className="hover:text-gold">Investment Plans</Link></li>
            <li><Link to="/insights" className="hover:text-gold">Insights</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register" className="hover:text-gold">Create Account</Link></li>
            <li><Link to="/login" className="hover:text-gold">Account Login</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Support</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Connect</h4>
          <div className="flex gap-3">
            <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-gold hover:text-navy"><Facebook size={16} /></a>
            <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-gold hover:text-navy"><Twitter size={16} /></a>
            <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-gold hover:text-navy"><Linkedin size={16} /></a>
            <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-gold hover:text-navy"><Mail size={16} /></a>
          </div>
          <p className="text-xs mt-6 text-white/50">Regulated in the United Kingdom.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-xs text-white/50 flex flex-col md:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} EVOLVE TRADE HUB. All rights reserved.</p>
          <p>Risk warning: Trading involves risk. Past performance is not indicative of future results.</p>
        </div>
      </div>
    </footer>
  );
}
