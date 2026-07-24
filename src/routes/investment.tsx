import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { Stagger, StaggerItem } from "@/components/site/motion/Reveal";
import { Check } from "lucide-react";

export const Route = createFileRoute("/investment")({
  head: () => ({
    meta: [
      { title: "Investment Plans — Evolve Digital Trade" },
      { name: "description", content: "Explore Evolve Digital Trade investment plans starting at $200. Transparent, regulated, and A.I.-managed." },
      { property: "og:title", content: "Investment Plans — Evolve Digital Trade" },
      { property: "og:url", content: "/investment" },
    ],
    links: [{ rel: "canonical", href: "/investment" }],
  }),
  component: InvestmentPage,
});

const plans = [
  { name: "Starter", price: "$200", roi: "5% weekly", duration: "7 days", features: ["Instant activation", "24/7 support", "Withdrawal anytime"] },
  { name: "Silver", price: "$1,000", roi: "8% weekly", duration: "14 days", features: ["All Starter benefits", "Dedicated advisor", "Priority execution"], popular: true },
  { name: "Gold", price: "$5,000", roi: "12% weekly", duration: "30 days", features: ["All Silver benefits", "Custom strategies", "Quarterly reviews"] },
  { name: "Platinum", price: "$25,000+", roi: "Custom", duration: "Flexible", features: ["Bespoke portfolio", "Private banker", "Institutional access"] },
];

function InvestmentPage() {
  return (
    <PageLayout>
      <PageHero title="Investment Plans" subtitle="Choose a plan built for stable returns and high liquidity." />
      <section className="py-20 md:py-28 px-4">
        <Stagger className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <StaggerItem key={p.name}>
              <div className={`relative p-8 rounded-lg border card-lift h-full ${p.popular ? "border-gold shadow-xl bg-navy text-white" : "bg-white"}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block px-3 py-1 text-[10px] uppercase tracking-widest text-navy bg-gold rounded-full font-semibold">
                    Most Popular
                  </span>
                )}
                <h3 className={`font-display text-2xl font-bold ${p.popular ? "text-white" : "text-navy"}`}>{p.name}</h3>
                <p className={`mt-4 font-display text-4xl font-bold ${p.popular ? "text-gold" : "text-navy"}`}>{p.price}</p>
                <p className={`mt-1 text-sm ${p.popular ? "text-white/70" : "text-muted-foreground"}`}>{p.roi} · {p.duration}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 items-start">
                      <Check size={16} className="text-gold mt-0.5 shrink-0" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-8 block text-center rounded-md py-3 font-semibold transition-all hover:-translate-y-0.5 ${p.popular ? "bg-gold text-navy hover:brightness-110" : "bg-navy text-white hover:bg-navy/90"}`}>Invest Now</Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </PageLayout>
  );
}
