import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { Stagger, StaggerItem } from "@/components/site/motion/Reveal";
import { Bot, LineChart, Coins, Users, Wallet, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — EVOLVE TRADE HUB" },
      { name: "description", content: "A.I. trading, portfolio management, copy trading, crypto investments and more." },
      { property: "og:title", content: "Services — EVOLVE TRADE HUB" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Bot, title: "A.I. Automated Trading", desc: "Automated strategies powered by artificial intelligence, executing trades 24/7 across global markets." },
  { icon: LineChart, title: "Portfolio Management", desc: "Diversified portfolios tailored to your risk profile and long-term financial goals." },
  { icon: Users, title: "Copy Trading", desc: "Follow and mirror the trades of proven professional traders directly from your account." },
  { icon: Coins, title: "Crypto Investments", desc: "Access to major cryptocurrencies, memecoins, and emerging blockchain projects." },
  { icon: Wallet, title: "Fiduciary Management", desc: "Long-term, professionally managed investments with transparent reporting." },
  { icon: ShieldCheck, title: "Regulated Custody", desc: "Assets held under regulated custody in the UK with strict compliance standards." },
];

function ServicesPage() {
  return (
    <PageLayout>
      <PageHero title="Our Services" subtitle="A complete suite of A.I.-driven trading and investment solutions." />
      <section className="py-20 md:py-28 px-4">
        <Stagger className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <StaggerItem key={s.title}>
              <div className="p-8 rounded-lg border card-lift bg-white h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gold/10 text-gold mb-4">
                  <s.icon size={24} />
                </div>
                <h3 className="font-display text-xl text-navy font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </PageLayout>
  );
}
