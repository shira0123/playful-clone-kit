import { createFileRoute } from "@tanstack/react-router";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import tradingFloor from "@/assets/trading-floor.jpg";

export const Route = createFileRoute("/company")({
  head: () => ({
    meta: [
      { title: "Our Company — Evolve Digital Trade" },
      { name: "description", content: "Learn about Evolve Digital Trade — our mission, values, and regulated A.I. trading platform." },
      { property: "og:title", content: "Our Company — Evolve Digital Trade" },
      { property: "og:url", content: "/company" },
    ],
    links: [{ rel: "canonical", href: "/company" }],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  return (
    <PageLayout>
      <PageHero title="Our Company" subtitle="The revolution in management — inspired by innovation, driven by results." />
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <img src={tradingFloor} alt="Trading floor" className="rounded-lg shadow-xl" loading="lazy" />
          <div>
            <h2 className="font-display text-3xl text-navy font-bold">Our Mission</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              To enhance lives by providing a safe avenue, inspired by effective and innovative
              solutions for investing in the different, emerging finance markets — improving our
              investors' financial situation and ultimately providing them financial freedom.
            </p>
            <h2 className="mt-8 font-display text-3xl text-navy font-bold">Who We Are</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Evolve Digital Trade is a fully approved and officially registered company whose
              activities are regulated by financial control authorities under the jurisdiction of
              the United Kingdom. Our team combines quantitative research, engineering, and
              investment expertise to deliver a truly global platform.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-4xl text-navy font-bold">By the Numbers</h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            {[
              { n: "150K+", l: "Active investors" },
              { n: "40+", l: "Countries served" },
              { n: "$1.2B", l: "Assets managed" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-5xl font-bold text-navy">{s.n}</p>
                <p className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
