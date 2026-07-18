import { useEffect, useState } from "react";

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
    <div className="bg-navy text-white overflow-hidden border-y border-white/10">
      <div className="flex marquee whitespace-nowrap py-3">
        {doubled.map((c, i) => (
          <div key={i} className="flex items-center gap-2 px-6 text-sm">
            <img src={c.image} alt={c.name} className="w-5 h-5" loading="lazy" />
            <span className="font-semibold uppercase">{c.symbol}</span>
            <span>${c.current_price?.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
            <span className={c.price_change_percentage_24h >= 0 ? "text-emerald-400" : "text-red-400"}>
              {c.price_change_percentage_24h >= 0 ? "+" : ""}{c.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
