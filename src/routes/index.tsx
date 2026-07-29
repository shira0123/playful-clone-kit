import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/site/PageLayout";
import { CryptoTicker } from "@/components/site/CryptoTicker";
import { Reveal, Stagger, StaggerItem } from "@/components/site/motion/Reveal";
import heroBitcoin from "@/assets/hero-bitcoin.jpg";
import dodgeCoin from "@/assets/dodge-coin.jpg";
import copyPhone from "@/assets/copy-trading-phone.jpg";
import tradingFloor from "@/assets/trading-floor.jpg";
import {
  ShieldCheck, Zap, Cpu, Users, Target, Award, TrendingUp, Globe2, LineChart, ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const features = [
  { icon: TrendingUp, title: "Lucrative Returns" },
  { icon: Zap, title: "Fast Executions" },
  { icon: Cpu, title: "World-class Crypto Trading Tech" },
  { icon: Users, title: "Investor Support & Guide" },
  { icon: Target, title: "Investor Oriented" },
  { icon: ShieldCheck, title: "Strongly Regulated" },
];

const awards = [
  { title: "Most Reliable International Crypto Trading Platform", event: "BTC TradeON Summit 2017" },
  { title: "Best Brokerage Platform", event: "BTC CIS Awards EXPO 2020" },
  { title: "Best Blockchain Accelerator and Execution Broker", event: "AZTOMARKETS EXPO Dubai 2019" },
];

function HomePage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative min-h-[92vh] sm:min-h-[640px] flex items-center justify-center text-white overflow-hidden">
        <img src={heroBitcoin} alt="" className="absolute inset-0 w-full h-full object-cover ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/60 to-navy/90" />
        <div className="absolute inset-0 [background:radial-gradient(50%_50%_at_50%_40%,color-mix(in_oklab,var(--gold)_18%,transparent),transparent_70%)]" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="h-px w-8 bg-gold/60" />
            <p className="uppercase tracking-[0.3em] text-gold text-xs">Breakthrough Technology for Trading</p>
            <span className="h-px w-8 bg-gold/60" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight"
          >
            EVOLVE TRADE HUB
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="block text-xl sm:text-2xl md:text-4xl mt-3 text-white/90"
            >
              Artificial Intelligence Trading Company
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 text-base sm:text-lg text-white/80 max-w-2xl mx-auto"
          >
            Join thousands who've discovered a profitable way to utilize cryptocurrency and
            earn passively through A.I. trading technology.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <a href="https://app.e-directpro.com/register" className="rounded-md bg-gold px-8 py-3 font-semibold text-navy hover:brightness-110 shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--gold)_70%,transparent)] transition-all hover:-translate-y-0.5">Create an Account</a>
            <Link to="/company" className="rounded-md border border-white/40 backdrop-blur px-8 py-3 font-semibold text-white hover:bg-white/10 hover:border-gold transition-all">Learn More</Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60"
        >
          <ChevronDown className="float-y" />
        </motion.div>
      </section>

      <CryptoTicker />

      {/* Dodge Coin */}
      <section className="py-20 md:py-28 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="overflow-hidden rounded-lg shadow-xl">
              <motion.img
                src={dodgeCoin}
                alt="Dodge Coin Project"
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
            <p className="uppercase text-xs tracking-widest text-gold font-semibold">Featured Project</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-navy font-bold">Dodge Coin Project</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The Dodge Coin Project is a bold step into the future of digital finance. Built on
              blockchain technology, Dodge Coin is a community-powered digital asset combining
              innovation and long-term value — with applications in payments, rewards, and
              tokenized ecosystems.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Investing in Dodge Coin means joining a global movement where financial opportunities
              are democratized and the community drives growth.
            </p>
            <Link to="/contact" className="inline-block mt-6 rounded-md bg-navy px-6 py-3 text-white font-semibold hover:bg-navy/90 transition-all hover:-translate-y-0.5">Contact Us</Link>
          </Reveal>
        </div>
      </section>

      {/* Trusted / Awards */}
      <section className="bg-secondary py-20 md:py-28 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl text-navy font-bold">Trusted by millions of investors around the world</h2>
          </Reveal>
          <Stagger className="mt-10 grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <StaggerItem>
              <div className="p-6 bg-white rounded-lg shadow-sm card-lift border border-transparent h-full">
                <ShieldCheck className="text-gold mb-3" />
                <h3 className="font-semibold text-lg">Fully Regulated</h3>
                <p className="mt-2 text-sm text-muted-foreground">We adhere to the strictest regulatory standards and are fully licensed across Europe, the Middle East and Asia.</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-6 bg-white rounded-lg shadow-sm card-lift border border-transparent h-full">
                <Award className="text-gold mb-3" />
                <h3 className="font-semibold text-lg">Multi-Award Winner</h3>
                <p className="mt-2 text-sm text-muted-foreground">Consistently recognised by our industry with the highest accolades for products, platform and investment services.</p>
              </div>
            </StaggerItem>
          </Stagger>

          <Stagger className="mt-14 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {awards.map((a) => (
              <StaggerItem key={a.title}>
                <div className="p-6 bg-white rounded-lg card-lift border border-transparent h-full">
                  <Award className="mx-auto text-gold" size={36} />
                  <p className="mt-4 font-semibold text-navy">{a.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{a.event}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Copy Trading */}
      <section className="py-20 md:py-28 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="uppercase text-xs tracking-widest text-gold font-semibold">Copy Trading</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-navy font-bold">Copy the trades of other traders — all in one App</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              At EVOLVE TRADE HUB, we believe everyone should have easy, fast, and free access
              to the global financial markets. That's why we've built the most powerful app for
              finance.
            </p>
            <a href="https://app.e-directpro.com/register" className="inline-block mt-6 rounded-md bg-gold px-6 py-3 font-semibold text-navy hover:brightness-110 transition-all hover:-translate-y-0.5">Get Started</a>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="overflow-hidden rounded-lg shadow-xl">
              <motion.img
                src={copyPhone}
                alt="Copy trading app"
                loading="lazy"
                className="w-full"
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features grid */}
      <section className="relative bg-navy text-white py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 [background:radial-gradient(40%_50%_at_100%_0%,color-mix(in_oklab,var(--gold)_20%,transparent),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">An A.I. trading company devoted to your financial success</h2>
            <p className="mt-4 text-white/70 max-w-3xl mx-auto">
              Invest with confidence and benefit from the reliability of trusted technology in
              fiduciary management and long-term investments.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="p-6 border border-white/10 rounded-lg card-lift bg-white/[0.02] h-full text-left">
                  <f.icon className="text-gold mb-4" size={32} />
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Invest CTA */}
      <section className="relative py-24 md:py-32 px-4 text-white overflow-hidden">
        <img src={tradingFloor} alt="" className="absolute inset-0 w-full h-full object-cover ken-burns" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-navy/90" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Invest with confidence on the world's leading A.I. trading platform
            </h2>
            <p className="mt-4 text-white/80">
              Complex, automated solutions using leading artificial intelligence trading technology —
              aimed at high profits within a short period across crypto, forex, and stock markets.
            </p>
            <a href="https://app.e-directpro.com/register" className="inline-block mt-8 rounded-md bg-gold px-8 py-3 font-semibold text-navy hover:brightness-110 shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--gold)_70%,transparent)] transition-all hover:-translate-y-0.5">Open an Account</a>
          </Reveal>
        </div>
      </section>

      {/* Investment quick card */}
      <section className="py-20 md:py-28 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <p className="uppercase text-xs tracking-widest text-gold font-semibold">Investment</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl text-navy font-bold">Diversify your investment portfolio</h2>
            <p className="mt-4 text-muted-foreground">
              EVOLVE TRADE HUB is fully approved and officially registered, regulated by
              financial authorities under the jurisdiction of the United Kingdom. We trade and
              earn — you share the returns.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a href="https://app.e-directpro.com/register" className="rounded-md bg-navy px-6 py-3 text-white font-semibold hover:bg-navy/90 transition-all hover:-translate-y-0.5">Open an Account</a>
              <Link to="/investment" className="rounded-md border border-navy px-6 py-3 font-semibold text-navy hover:bg-navy hover:text-white transition-all">View Plans</Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-gradient-to-br from-secondary to-white rounded-2xl p-10 text-center border border-border shadow-[0_20px_50px_-20px_color-mix(in_oklab,var(--navy)_30%,transparent)]"
            >
              <LineChart className="mx-auto text-gold" size={40} />
              <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">Minimum Investment</p>
              <p className="mt-2 font-display text-6xl font-bold text-navy">$200</p>
              <p className="mt-2 text-sm text-muted-foreground">Other fees do not apply</p>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* Advantage */}
      <section className="bg-secondary py-20 md:py-28 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <p className="uppercase text-xs tracking-widest text-gold font-semibold">The Evolve Trade Hub Advantage</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-navy font-bold">The Revolution in Management</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              We work to the highest ethical standards of trading strategies, offering some of the
              most dynamic and high-performing trading and investment services available.
            </p>
          </Reveal>
          <Stagger className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
            {[
              { Icon: Globe2, title: "Global Reach", desc: "A truly global platform through our scale and extensive reach." },
              { Icon: ShieldCheck, title: "Safe Avenue", desc: "Innovative, effective solutions across emerging finance markets." },
              { Icon: TrendingUp, title: "Financial Freedom", desc: "Improve investors' financial situation and ultimately provide freedom." },
            ].map(({ Icon, title, desc }) => (
              <StaggerItem key={title}>
                <div className="p-6 bg-white rounded-lg card-lift border border-transparent h-full">
                  <Icon className="text-gold mb-3" />
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </PageLayout>
  );
}
