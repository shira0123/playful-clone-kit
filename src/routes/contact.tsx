import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { Reveal } from "@/components/site/motion/Reveal";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Evolve Digital Trade" },
      { name: "description", content: "Get in touch with the Evolve Digital Trade support and investment team." },
      { property: "og:title", content: "Contact Us — Evolve Digital Trade" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <PageLayout>
      <PageHero title="Contact Us" subtitle="We're here to help you get started and grow." />
      <section className="py-20 md:py-28 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12">
          <Reveal>
            <h2 className="font-display text-3xl text-navy font-bold">Get in touch</h2>
            <p className="mt-3 text-muted-foreground">Our team typically replies within one business day.</p>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-start gap-3"><Mail className="text-gold mt-0.5 shrink-0" size={18} /><span className="min-w-0 break-words">support@evolvedigitaltrade.com</span></div>
              <div className="flex items-start gap-3"><Phone className="text-gold mt-0.5 shrink-0" size={18} /><span>+44 20 8080 0000</span></div>
              <div className="flex items-start gap-3"><MapPin className="text-gold mt-0.5 shrink-0" size={18} /><span>Registered office · United Kingdom</span></div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="p-8 rounded-lg border bg-white shadow-sm space-y-4"
            >
              {sent ? (
                <p className="text-navy font-semibold">Thanks — we've received your message.</p>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <input required className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input type="email" required className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <textarea required rows={5} className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors" />
                  </div>
                  <button className="w-full rounded-md bg-navy text-white py-3 font-semibold hover:bg-navy/90 transition-all hover:-translate-y-0.5">Send Message</button>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </PageLayout>
  );
}
