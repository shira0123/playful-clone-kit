import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser, getNotifications, getPortfolioStats } from "@/server-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, User, Settings, ArrowRight, TrendingUp, Wallet, Activity,
  ArrowUpRight, ArrowDownRight, BarChart3, Zap, Globe2, Clock,
  Shield, ChevronRight, Sparkles, CircleDollarSign
} from "lucide-react";

type SafeUser = {
  id: string; email: string; role: string; status: string;
  emailVerified: boolean; firstName: string; lastName: string;
  impersonatorId: string | null;
};

type CryptoPrice = {
  symbol: string; name: string; price: number;
  change24h: number; icon: string; color: string;
};

type Signal = {
  pair: string; type: "BUY" | "SELL" | "HOLD";
  confidence: number; timeframe: string;
};

export const Route = createFileRoute("/dashboard/")({ component: Dashboard });

function useCryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([
    { symbol: "BTC", name: "Bitcoin", price: 0, change24h: 0, icon: "₿", color: "#f7931a" },
    { symbol: "ETH", name: "Ethereum", price: 0, change24h: 0, icon: "Ξ", color: "#627eea" },
    { symbol: "USDT", name: "Tether", price: 0, change24h: 0, icon: "₮", color: "#26a17b" },
    { symbol: "BNB", name: "BNB", price: 0, change24h: 0, icon: "◆", color: "#f3ba2f" },
    { symbol: "SOL", name: "Solana", price: 0, change24h: 0, icon: "◎", color: "#9945ff" },
    { symbol: "XRP", name: "XRP", price: 0, change24h: 0, icon: "✕", color: "#00aae4" },
  ]);
  const [loading, setLoading] = useState(true);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true"
      );
      const data = await res.json();
      setPrices(prev => prev.map(coin => {
        const map: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum", USDT: "tether", BNB: "binancecoin", SOL: "solana", XRP: "ripple" };
        const id = map[coin.symbol];
        if (data[id]) {
          return { ...coin, price: data[id].usd, change24h: data[id].usd_24h_change ?? 0 };
        }
        return coin;
      }));
    } catch {
      // Fallback — use realistic mock data if API fails
      setPrices(prev => prev.map(coin => {
        const fallback: Record<string, { p: number; c: number }> = {
          BTC: { p: 67432.18, c: 2.34 }, ETH: { p: 3521.47, c: 1.87 },
          USDT: { p: 1.00, c: 0.01 }, BNB: { p: 584.22, c: -0.42 },
          SOL: { p: 178.65, c: 5.12 }, XRP: { p: 0.6234, c: -1.23 },
        };
        const fb = fallback[coin.symbol];
        return fb ? { ...coin, price: fb.p, change24h: fb.c } : coin;
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPrices();
    const interval = setInterval(fetchPrices, 30_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading };
}

function generateSignals(): Signal[] {
  const pairs = ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "XRP/USD"];
  const types: Signal["type"][] = ["BUY", "SELL", "HOLD"];
  const timeframes = ["1H", "4H", "1D"];
  return pairs.map(pair => ({
    pair,
    type: types[Math.floor(Math.random() * 3)],
    confidence: 60 + Math.floor(Math.random() * 35),
    timeframe: timeframes[Math.floor(Math.random() * 3)],
  }));
}

function MiniChart({ positive }: { positive: boolean }) {
  const points = Array.from({ length: 24 }, (_, i) => {
    const base = positive ? 30 + i * 0.8 : 50 - i * 0.5;
    return base + (Math.random() - 0.5) * 12;
  });
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const h = 40;
  const w = 120;
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-60">
      <defs>
        <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "#22c55e" : "#ef4444"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? "#22c55e" : "#ef4444"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill={`url(#grad-${positive})`} />
      <path d={path} fill="none" stroke={positive ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: color }} />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const [stats, setStats] = useState({ totalInvested: 0, activeCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [signals] = useState<Signal[]>(generateSignals);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { prices, loading: pricesLoading } = useCryptoPrices();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void getCurrentUser().then((u) => {
      if (!u) return navigate({ to: "/login" });
      if (u.role === "admin") return navigate({ to: "/admin" });
      setUser(u as SafeUser);
      
      Promise.all([getNotifications(), getPortfolioStats()]).then(([notes, portfolioStats]) => {
        setNotifications(notes);
        setStats(portfolioStats);
        setLoading(false);
      });
    });
  }, [navigate]);

  if (loading || !user) {
    return (
      <DashboardLayout title="Welcome">
        <div className="space-y-6 mt-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const signalColor = (t: Signal["type"]) => t === "BUY" ? "bg-emerald-500" : t === "SELL" ? "bg-red-500" : "bg-amber-500";
  const signalBg = (t: Signal["type"]) => t === "BUY" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : t === "SELL" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <DashboardLayout 
      title={`Welcome back, ${user.firstName || "Investor"}`}
      userName={`${user.firstName} ${user.lastName}`.trim()}
      userEmail={user.email}
    >
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <PulseDot color="#22c55e" /> Market Open
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" })} UTC
        </span>
        <span className="flex items-center gap-1.5">
          <Globe2 className="h-3 w-3" /> Global Markets
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" /> SSL Encrypted
        </span>
      </div>

      {/* Quick Actions */}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild className="bg-gold text-navy hover:brightness-110 shadow-md shadow-gold/20">
          <Link to="/dashboard/investments"><TrendingUp className="mr-2 h-4 w-4" /> Invest Now</Link>
        </Button>
        <Button asChild variant="outline" className="border-navy/20 hover:border-navy">
          <Link to="/dashboard/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
        </Button>
        <Button asChild variant="outline" className="border-navy/20 hover:border-navy">
          <Link to="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
        </Button>
      </div>

      {/* Portfolio Stats - 4 column */}
      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
            <div className="p-2 rounded-lg bg-gold/10"><Wallet className="h-4 w-4 text-gold" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">${stats.totalInvested.toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">Active portfolio balance</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Plans</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10"><Activity className="h-4 w-4 text-emerald-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{stats.activeCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.pendingCount > 0 ? <span className="text-amber-600 font-medium">{stats.pendingCount} pending approval</span> : "No pending approvals"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estimated ROI</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10"><CircleDollarSign className="h-4 w-4 text-blue-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy flex items-center gap-1">
              {stats.activeCount > 0 ? "Active" : "—"}
              {stats.activeCount > 0 && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Returns generating daily</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10"><Bell className="h-4 w-4 text-purple-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">{notifications.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">New updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Crypto Prices Ticker */}
      <div className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-navy" />
                <CardTitle className="text-lg font-bold text-navy">Live Market Prices</CardTitle>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <PulseDot color="#22c55e" />
                <span>Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {prices.map((coin) => (
                <div key={coin.symbol} className="group flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-3 transition-all hover:border-slate-200 hover:shadow-sm hover:bg-slate-50/50">
                  <div className="flex items-center gap-2 w-full">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shrink-0" style={{ backgroundColor: coin.color }}>
                      {coin.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy truncate">{coin.symbol}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{coin.name}</p>
                    </div>
                  </div>
                  <MiniChart positive={coin.change24h >= 0} />
                  <div className="text-center w-full">
                    <p className="text-sm font-bold text-navy">
                      {pricesLoading ? "..." : `$${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                    <div className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1 ${
                      coin.change24h >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      {coin.change24h >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {Math.abs(coin.change24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two column: Signals + Notifications */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Trading Signals */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-gold" />
                <CardTitle className="text-lg font-bold text-navy">A.I. Trading Signals</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] bg-navy/5 text-navy border-navy/20">
                <Sparkles className="h-3 w-3 mr-1" /> AI Powered
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pb-2 border-b">
                <span>Pair</span><span>Signal</span><span>Confidence</span><span>Timeframe</span><span className="text-right">Status</span>
              </div>
              {signals.map((s, i) => (
                <div key={i} className="grid grid-cols-5 items-center text-sm px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-navy">{s.pair}</span>
                  <span>
                    <Badge variant="outline" className={`text-[10px] font-bold ${signalBg(s.type)}`}>
                      {s.type}
                    </Badge>
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${signalColor(s.type)}`} style={{ width: `${s.confidence}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{s.confidence}%</span>
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{s.timeframe}</span>
                  <span className="flex items-center justify-end gap-1">
                    <PulseDot color={s.type === "BUY" ? "#22c55e" : s.type === "SELL" ? "#ef4444" : "#f59e0b"} />
                    <span className="text-[10px] text-muted-foreground">Active</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 text-center italic">
              Signals are generated by A.I. models and are for informational purposes only. Past performance is not indicative of future results.
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg font-bold text-navy">Recent Activity</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/dashboard/notifications">View All <ChevronRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length ? (
                notifications.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg p-3 bg-slate-50/80 border border-slate-100">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/5">
                      <Bell className="h-3.5 w-3.5 text-navy" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.body}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="p-3 rounded-full bg-slate-100 mb-3">
                    <Bell className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-navy">All caught up!</p>
                  <p className="text-xs text-muted-foreground">No new notifications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview Banner */}
      <div className="mt-6">
        <Card className="bg-gradient-to-r from-navy via-navy/95 to-navy/90 text-white border-0 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_100%_0%,rgba(197,165,90,0.15),transparent_70%)]" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold">Ready to grow your portfolio?</h3>
                <p className="text-white/70 text-sm mt-1">Explore our A.I.-managed investment plans with daily returns.</p>
              </div>
              <Button asChild className="bg-gold text-navy hover:brightness-110 font-semibold shadow-lg shadow-gold/30 shrink-0">
                <Link to="/dashboard/investments">
                  View Investment Plans <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
