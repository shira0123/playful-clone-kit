import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/site/PageLayout";
import { CryptoTicker } from "@/components/site/CryptoTicker";
import heroBitcoin from "@/assets/hero-bitcoin.jpg";
import dodgeCoin from "@/assets/dodge-coin.jpg";
import copyPhone from "@/assets/copy-trading-phone.jpg";
import tradingFloor from "@/assets/trading-floor.jpg";
import {
  ShieldCheck, Zap, Cpu, Users, Target, Award, TrendingUp, Globe2, LineChart,
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
      <section className="relative min-h-[640px] flex items-center justify-center text-white">
        <img src={heroBitcoin} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto py-24">
          <p className="uppercase tracking-[0.3em] text-gold text-xs mb-6">Breakthrough Technology for Trading</p>
          <h1 className="font-display text-4xl md:text-7xl font-bold leading-tight">
            Evolve Digital Trade
            <span className="block text-2xl md:text-4xl mt-3 text-white/90">Artificial Intelligence Trading Company</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
            Join thousands who've discovered a profitable way to utilize cryptocurrency and
            earn passively through A.I. trading technology.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="https://app.e-directpro.com/register" className="rounded-md bg-gold px-8 py-3 font-semibold text-navy hover:brightness-110">Create an Account</a>
            <Link to="/company" className="rounded-md border border-white/40 px-8 py-3 font-semibold text-white hover:bg-white/10">Learn More</Link>
          </div>
        </div>
      </section>

      <CryptoTicker />

      {/* Dodge Coin */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <img src={dodgeCoin} alt="Dodge Coin Project" className="rounded-lg shadow-xl w-full" loading="lazy" />
          <div>
            <h2 className="font-display text-4xl text-navy font-bold">Dodge Coin Project</h2>
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
            <Link to="/contact" className="inline-block mt-6 rounded-md bg-navy px-6 py-3 text-white font-semibold hover:bg-navy/90">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Trusted / Awards */}
      <section className="bg-secondary py-20 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-4xl text-navy font-bold">Trusted by millions of investors around the world</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <ShieldCheck className="text-gold mb-3" />
              <h3 className="font-semibold text-lg">Fully Regulated</h3>
              <p className="mt-2 text-sm text-muted-foreground">We adhere to the strictest regulatory standards and are fully licensed across Europe, the Middle East and Asia.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <Award className="text-gold mb-3" />
              <h3 className="font-semibold text-lg">Multi-Award Winner</h3>
              <p className="mt-2 text-sm text-muted-foreground">Consistently recognised by our industry with the highest accolades for products, platform and investment services.</p>
            </div>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {awards.map((a) => (
              <div key={a.title} className="p-6 bg-white rounded-lg">
                <Award className="mx-auto text-gold" size={36} />
                <p className="mt-4 font-semibold text-navy">{a.title}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{a.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Copy Trading */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl text-navy font-bold">Copy the trades of other traders — all in one App</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              At Evolve Digital Trade, we believe everyone should have easy, fast, and free access
              to the global financial markets. That's why we've built the most powerful app for
              finance.
            </p>
            <a href="https://app.e-directpro.com/register" className="inline-block mt-6 rounded-md bg-gold px-6 py-3 font-semibold text-navy">Get Started</a>
          </div>
          <img src={copyPhone} alt="Copy trading app" className="rounded-lg shadow-xl" loading="lazy" />
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-4xl font-bold">An A.I. trading company devoted to your financial success</h2>
          <p className="mt-4 text-white/70 max-w-3xl mx-auto">
            Invest with confidence and benefit from the reliability of trusted technology in
            fiduciary management and long-term investments.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 border border-white/10 rounded-lg hover:border-gold transition-colors">
                <f.icon className="text-gold mb-4" size={32} />
                <h3 className="font-semibold text-lg">{f.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Invest CTA */}
      <section className="relative py-24 px-4 text-white">
        <img src={tradingFloor} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-navy/85" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            Invest with confidence on the world's leading A.I. trading platform
          </h2>
          <p className="mt-4 text-white/80">
            Complex, automated solutions using leading artificial intelligence trading technology —
            aimed at high profits within a short period across crypto, forex, and stock markets.
          </p>
          <a href="https://app.e-directpro.com/register" className="inline-block mt-8 rounded-md bg-gold px-8 py-3 font-semibold text-navy">Open an Account</a>
        </div>
      </section>

      {/* Investment quick card */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="uppercase text-xs tracking-widest text-gold font-semibold">Investment</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl text-navy font-bold">Diversify your investment portfolio</h2>
            <p className="mt-4 text-muted-foreground">
              Evolve Digital Trade is fully approved and officially registered, regulated by
              financial authorities under the jurisdiction of the United Kingdom. We trade and
              earn — you share the returns.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="https://app.e-directpro.com/register" className="rounded-md bg-navy px-6 py-3 text-white font-semibold">Open an Account</a>
              <Link to="/investment" className="rounded-md border border-navy px-6 py-3 font-semibold text-navy">View Plans</Link>
            </div>
          </div>
          <div className="bg-secondary rounded-2xl p-10 text-center">
            <LineChart className="mx-auto text-gold" size={40} />
            <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">Minimum Investment</p>
            <p className="mt-2 font-display text-6xl font-bold text-navy">$200</p>
            <p className="mt-2 text-sm text-muted-foreground">Other fees do not apply</p>
          </div>
        </div>
      </section>

      {/* Advantage */}
      <section className="bg-secondary py-20 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="uppercase text-xs tracking-widest text-gold font-semibold">The Evolve Advantage</p>
          <h2 className="mt-2 font-display text-4xl text-navy font-bold">The Revolution in Management</h2>
          <p className="mt-4 text-muted-foreground">
            We work to the highest ethical standards of trading strategies, offering some of the
            most dynamic and high-performing trading and investment services available.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white rounded-lg">
              <Globe2 className="text-gold mb-3" />
              <h3 className="font-semibold">Global Reach</h3>
              <p className="text-sm text-muted-foreground mt-2">A truly global platform through our scale and extensive reach.</p>
            </div>
            <div className="p-6 bg-white rounded-lg">
              <ShieldCheck className="text-gold mb-3" />
              <h3 className="font-semibold">Safe Avenue</h3>
              <p className="text-sm text-muted-foreground mt-2">Innovative, effective solutions across emerging finance markets.</p>
            </div>
            <div className="p-6 bg-white rounded-lg">
              <TrendingUp className="text-gold mb-3" />
              <h3 className="font-semibold">Financial Freedom</h3>
              <p className="text-sm text-muted-foreground mt-2">Improve investors' financial situation and ultimately provide freedom.</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
