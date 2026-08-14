import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { Reveal } from "@/components/site/motion/Reveal";
import { Mail, Phone, MapPin, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — EVOLVE TRADE HUB" },
      { name: "description", content: "Get in touch with the EVOLVE TRADE HUB support and investment team." },
      { property: "og:title", content: "Contact Us — EVOLVE TRADE HUB" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PageLayout>
      <PageHero title="Contact Us" subtitle="We're here to help you get started and grow." />
      <section className="py-20 md:py-28 px-4">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl text-navy font-bold">Get in touch</h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Reach out to our global support team directly via email or phone. We typically reply within one business day.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-6">
            <Reveal delay={0.1}>
              <div className="p-8 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center h-full">
                <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-4">
                  <Mail size={22} />
                </div>
                <h3 className="font-bold text-navy text-lg mb-1">Email Support</h3>
                <p className="text-xs text-muted-foreground mb-4">For general inquiries & account help</p>
                <a
                  href="mailto:support@evolvetradehub.com"
                  className="text-sm font-medium text-navy hover:text-gold transition-colors break-all mt-auto"
                >
                  support@evolvetradehub.com
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="p-8 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center h-full">
                <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-4">
                  <Phone size={22} />
                </div>
                <h3 className="font-bold text-navy text-lg mb-1">Phone</h3>
                <p className="text-xs text-muted-foreground mb-4">Mon–Fri from 9am to 6pm GMT</p>
                <span className="text-sm font-medium text-slate-700 mt-auto">
                  +44 20 8080 0000
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="p-8 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center h-full">
                <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-4">
                  <MapPin size={22} />
                </div>
                <h3 className="font-bold text-navy text-lg mb-1">Office Location</h3>
                <p className="text-xs text-muted-foreground mb-4">Registered headquarters</p>
                <span className="text-sm font-medium text-slate-700 mt-auto">
                  United Kingdom
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.4}>
            <div className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy/5 text-navy flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm">24/7 Security & System Monitoring</h4>
                  <p className="text-xs text-muted-foreground">All investment activities and accounts are monitored around the clock.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                <Clock size={14} className="text-gold" />
                <span>Avg response time: &lt; 24 hrs</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageLayout>
  );
}
