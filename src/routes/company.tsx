import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageLayout, PageHero } from "@/components/site/PageLayout";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/Reveal";
import { CountUp } from "@/components/site/motion/CountUp";
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

const stats = [
  { end: 150, suffix: "K+", label: "Active investors" },
  { end: 40, suffix: "+", label: "Countries served" },
  { prefix: "$", end: 1.2, suffix: "B", decimals: 1, label: "Assets managed" },
];

function CompanyPage() {
  return (
    <PageLayout>
      <PageHero title="Our Company" subtitle="The revolution in management — inspired by innovation, driven by results." />
      <section className="py-20 md:py-28 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="overflow-hidden rounded-lg shadow-xl">
              <motion.img
                src={tradingFloor}
                alt="Trading floor"
                loading="lazy"
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
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
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary py-20 md:py-28 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl text-navy font-bold">By the Numbers</h2>
          </Reveal>
          <Stagger className="mt-10 grid sm:grid-cols-3 gap-8">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <p className="font-display text-5xl font-bold text-navy">
                  <CountUp end={s.end} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals ?? 0} />
                </p>
                <p className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </PageLayout>
  );
}
