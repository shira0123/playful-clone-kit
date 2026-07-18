import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Evolve Digital Trade" },
      { name: "description", content: "Market insights, analysis and updates from the Evolve Digital Trade research team." },
      { property: "og:title", content: "Insights — Evolve Digital Trade" },
      { property: "og:url", content: "/insights" },
    ],
    links: [{ rel: "canonical", href: "/insights" }],
  }),
  component: InsightsPage,
});

const posts = [
  { title: "The Rise of A.I. Trading in 2026", date: "July 12, 2026", excerpt: "How machine learning models are reshaping global crypto markets." },
  { title: "Understanding Copy Trading", date: "June 28, 2026", excerpt: "A beginner's guide to mirroring professional traders on autopilot." },
  { title: "Dodge Coin — Community-Powered Finance", date: "June 03, 2026", excerpt: "What makes the Dodge Coin Project different from other memecoins." },
  { title: "Portfolio Diversification 101", date: "May 21, 2026", excerpt: "Why spreading risk across assets is the cornerstone of long-term returns." },
  { title: "Regulation & Trust in Crypto", date: "April 15, 2026", excerpt: "How UK-based regulation protects investors in digital asset markets." },
  { title: "Passive Income with A.I.", date: "March 30, 2026", excerpt: "Realistic expectations for automated trading strategies." },
];

function InsightsPage() {
  return (
    <PageLayout>
      <PageHero title="Insights" subtitle="Analysis, updates, and thinking from our research team." />
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <article key={p.title} className="p-6 rounded-lg border hover:border-gold transition-colors">
              <p className="text-xs uppercase tracking-widest text-gold font-semibold">{p.date}</p>
              <h3 className="mt-3 font-display text-xl text-navy font-semibold">{p.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{p.excerpt}</p>
              <p className="mt-4 text-sm font-semibold text-navy">Read more →</p>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
