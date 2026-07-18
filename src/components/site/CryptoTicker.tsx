import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

type Coin = { id: string; symbol: string; name: string; image: string; current_price: number; price_change_percentage_24h: number };

export function CryptoTicker() {
  const [coins, setCoins] = useState<Coin[]>([]);
  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => Array.isArray(data) && setCoins(data))
      .catch(() => {});
  }, []);

  if (!coins.length) return null;
  const doubled = [...coins, ...coins];

  return (
    <div className="relative bg-navy text-white overflow-hidden border-y border-white/10 group">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-navy to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-navy to-transparent" />
      <div className="flex marquee whitespace-nowrap py-3 group-hover:[animation-play-state:paused]">
        {doubled.map((c, i) => {
          const up = c.price_change_percentage_24h >= 0;
          return (
            <div key={i} className="flex items-center gap-2 px-6 text-sm">
              <img src={c.image} alt="" className="w-5 h-5" loading="lazy" />
              <span className="font-semibold uppercase">{c.symbol}</span>
              <span className="text-white/90">${c.current_price?.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${up ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {up ? "+" : ""}{c.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
