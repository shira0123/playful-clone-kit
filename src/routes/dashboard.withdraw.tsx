import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser, getPortfolioStats, requestWithdrawal, getUserWithdrawals } from "@/server-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Wallet, ArrowUpRight, History, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/withdraw")({
  component: WithdrawPage,
});

function WithdrawPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Form State
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getCurrentUser().then((u) => {
      if (!u) return navigate({ to: "/login" });
      setUser(u);
      Promise.all([
        getPortfolioStats().catch(() => ({ balance: 0, totalInvested: 0, totalWithdrawal: 0, profits: 0, bonus: 0, referralCommission: 0, activeCount: 0, pendingCount: 0 })),
        getUserWithdrawals().catch(() => []),
      ]).then(([s, w]) => {
        setStats(s);
        setWithdrawals(w as any[]);
        setLoading(false);
      });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (numAmount > stats.balance) {
      toast.error("Insufficient balance");
      return;
    }

    setSubmitting(true);
    try {
      await requestWithdrawal({ data: { amount: numAmount, cryptoNetwork: network, walletAddress: address } });
      toast.success("Withdrawal request submitted successfully");
      setAmount("");
      setNetwork("");
      setAddress("");
      // Refresh data
      const [s, w] = await Promise.all([getPortfolioStats(), getUserWithdrawals()]);
      setStats(s);
      setWithdrawals(w);
    } catch (err: any) {
      toast.error(err.message || "Failed to request withdrawal");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <DashboardLayout title="Withdraw Funds">
        <Skeleton className="h-[400px] w-full mt-6" />
      </DashboardLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>;
      case "rejected": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default: return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Withdraw Funds"
      userName={`${user.firstName} ${user.lastName}`.trim()}
      userEmail={user.email}
      impersonatorId={user.impersonatorId}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card className="md:col-span-1 border-navy/10 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-navy">
              <Wallet className="h-5 w-5 text-gold" /> Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-navy mb-2">${stats.balance.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Your funds ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-2 border-navy/10 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-navy">Request Withdrawal</CardTitle>
            <CardDescription>Withdraw funds to your crypto wallet.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="network">Crypto Network</Label>
                  <Input
                    id="network"
                    placeholder="e.g. Bitcoin, ERC20, TRC20"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your crypto wallet address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto bg-navy hover:bg-navy/90 text-white">
                {submitting ? "Processing..." : (
                  <>
                    <ArrowUpRight className="mr-2 h-4 w-4" /> Request Withdrawal
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-navy/10 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-navy">
            <History className="h-5 w-5 text-gold" /> Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {withdrawals.length > 0 ? (
            <div className="divide-y">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-navy text-lg">${w.amount.toLocaleString()}</span>
                      {getStatusBadge(w.status)}
                    </div>
                    <p className="text-sm text-muted-foreground break-all">
                      <span className="font-medium text-slate-700">{w.cryptoNetwork}</span> • {w.walletAddress}
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs text-muted-foreground flex flex-col justify-center">
                    <div>Requested: {new Date(w.createdAt).toLocaleDateString()}</div>
                    {w.reviewedAt && (
                      <div className="mt-1">Reviewed: {new Date(w.reviewedAt).toLocaleDateString()}</div>
                    )}
                    {w.adminNotes && (
                      <div className="mt-2 p-2 bg-slate-50 rounded border text-slate-600 inline-block text-left max-w-xs">
                        <span className="font-semibold">Note:</span> {w.adminNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <History className="h-12 w-12 mx-auto text-slate-200 mb-3" />
              <p>No withdrawal requests yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
