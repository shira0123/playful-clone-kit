import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getInvestmentPlans, getUserInvestments, getCryptoWallets, submitInvestment } from "@/server-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard/investments")({ component: Investments });

type Plan = {
  id: string;
  name: string;
  priceAmount: number;
  roiDisplay: string;
  durationDisplay: string;
  features: string[];
  isPopular: boolean;
};

type Wallet = {
  id: string;
  network: string;
  address: string;
};

type Investment = {
  id: string;
  amount: number;
  status: string;
  startedAt: string | null;
  createdAt: string;
  plan: {
    name: string;
    roiDisplay: string;
    durationDisplay: string;
  };
};

function Investments() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [p, w, inv] = await Promise.all([
        getInvestmentPlans(),
        getCryptoWallets(),
        getUserInvestments()
      ]);
      setPlans(p as any);
      setWallets(w as any);
      setMyInvestments(inv as any);
    } catch (err) {
      toast.error("Failed to load investment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWallet(id);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  const handlePaymentDone = async () => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    try {
      await submitInvestment({ data: { planId: selectedPlan.id, amount: selectedPlan.priceAmount } });
      toast.success("Investment submitted! Pending admin verification.");
      setSelectedPlan(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Investments">
      <div className="space-y-10">
        
        {/* Available Plans Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy">Available Plans</h2>
            <p className="text-sm text-muted-foreground">Select a plan to start growing your portfolio.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p) => (
              <div key={p.id} className={`relative p-6 rounded-lg border card-lift flex flex-col h-full ${p.isPopular ? "border-gold shadow-md bg-navy text-white" : "bg-white"}`}>
                {p.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block px-3 py-1 text-[10px] uppercase tracking-widest text-navy bg-gold rounded-full font-semibold">
                    Popular
                  </span>
                )}
                <h3 className={`font-display text-xl font-bold ${p.isPopular ? "text-white" : "text-navy"}`}>{p.name}</h3>
                <p className={`mt-3 font-display text-3xl font-bold ${p.isPopular ? "text-gold" : "text-navy"}`}>${p.priceAmount.toLocaleString()}</p>
                <p className={`mt-1 text-xs ${p.isPopular ? "text-white/70" : "text-muted-foreground"}`}>{p.roiDisplay} · {p.durationDisplay}</p>
                <ul className="mt-6 space-y-3 text-sm flex-1">
                  {p.features.map((f: string) => (
                    <li key={f} className="flex gap-2 items-start">
                      <Check size={16} className="text-gold mt-0.5 shrink-0" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`mt-8 w-full font-semibold ${p.isPopular ? "bg-gold text-navy hover:brightness-110" : "bg-navy text-white hover:bg-navy/90"}`}
                  onClick={() => setSelectedPlan(p)}
                >
                  Invest Now
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* My Investments Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-navy">My Investments</h2>
            <p className="text-sm text-muted-foreground">Track your active and pending investments.</p>
          </div>

          <Card>
            <CardContent className="p-0">
              {myInvestments.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p>You haven't made any investments yet.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {myInvestments.map(inv => (
                    <div key={inv.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-navy">{inv.plan.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={
                              inv.status === "active" ? "bg-green-50 text-green-700 border-green-200" : 
                              inv.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              inv.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-slate-50 text-slate-700 border-slate-200"
                            }
                          >
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Amount: <span className="font-semibold text-navy">${inv.amount.toLocaleString()}</span> • 
                          ROI: {inv.plan.roiDisplay}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 sm:text-right">
                        <p>Requested: {format(new Date(inv.createdAt), "MMM d, yyyy")}</p>
                        {inv.startedAt && <p>Started: {format(new Date(inv.startedAt), "MMM d, yyyy")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </div>

      {/* Payment Modal */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && !isSubmitting && setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Investment</DialogTitle>
            <DialogDescription>
              You are investing <strong>${selectedPlan?.priceAmount.toLocaleString()}</strong> in the <strong>{selectedPlan?.name}</strong> plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-4 rounded-md">
              <strong>Instructions:</strong> Please send exactly <strong>${selectedPlan?.priceAmount.toLocaleString()}</strong> worth of crypto to one of the addresses below. After sending, click "Payment Done".
            </div>

            <div className="space-y-3">
              {wallets.map(wallet => (
                <div key={wallet.id} className="border rounded-md p-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{wallet.network}</p>
                  <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded border">
                    <code className="text-xs break-all text-navy">{wallet.address}</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 shrink-0 text-slate-500 hover:text-navy"
                      onClick={() => handleCopy(wallet.address, wallet.id)}
                    >
                      {copiedWallet === wallet.id ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSelectedPlan(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" className="bg-gold text-navy hover:brightness-110" onClick={handlePaymentDone} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Payment Done"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
