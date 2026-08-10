import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getInvestmentPlans, adminCreateInvestmentPlan, adminUpdateInvestmentPlan, adminDeleteInvestmentPlan } from "@/server-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/investment-plans")({ component: AdminInvestmentPlans });

type InvestmentPlan = {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  roiPercentage: number;
  durationDays: number;
  roiDisplay: string;
  durationDisplay: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
};

function AdminInvestmentPlans() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    minAmount: 0,
    maxAmount: 0,
    roiPercentage: 0,
    durationDays: 0,
    roiDisplay: "",
    durationDisplay: "",
    features: "",
    isPopular: false,
    isActive: true,
  });

  const loadData = async () => {
    try {
      const data = await getInvestmentPlans();
      setPlans(data as InvestmentPlan[]);
    } catch (err) {
      toast.error("Failed to load investment plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      minAmount: 0,
      maxAmount: 0,
      roiPercentage: 0,
      durationDays: 0,
      roiDisplay: "",
      durationDisplay: "",
      features: "",
      isPopular: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      minAmount: plan.minAmount,
      maxAmount: plan.maxAmount,
      roiPercentage: plan.roiPercentage,
      durationDays: plan.durationDays,
      roiDisplay: plan.roiDisplay,
      durationDisplay: plan.durationDisplay,
      features: plan.features.join("\n"),
      isPopular: plan.isPopular,
      isActive: plan.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        features: formData.features.split("\n").filter(f => f.trim() !== ""),
      };

      if (editingPlan) {
        await adminUpdateInvestmentPlan({ data: { id: editingPlan.id, ...payload } });
        toast.success("Investment plan updated");
      } else {
        await adminCreateInvestmentPlan({ data: payload });
        toast.success("Investment plan created");
      }
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save investment plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan? It cannot have active investments.")) return;
    try {
      await adminDeleteInvestmentPlan({ data: { id } });
      toast.success("Investment plan deleted");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete investment plan");
    }
  };

  return (
    <DashboardLayout admin title="Investment Plans">
      <div className="flex justify-between items-center mb-6 mt-2">
        <p className="text-muted-foreground">Manage the investment plans available to users.</p>
        <Button onClick={handleOpenCreate} className="bg-navy text-white hover:bg-navy/90">
          <Plus className="h-4 w-4 mr-2" /> Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground bg-white rounded-xl border">No investment plans found.</div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className={`relative overflow-hidden ${!plan.isActive ? 'opacity-60' : ''}`}>
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Popular
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-navy">{plan.name}</h3>
                    <Badge variant="outline" className={plan.isActive ? "bg-green-50 text-green-700 border-green-200 mt-1" : "bg-slate-50 text-slate-700 border-slate-200 mt-1"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-navy" onClick={() => handleOpenEdit(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-slate-500">Deposit Range</span>
                    <span className="font-semibold">${plan.minAmount.toLocaleString()} - ${plan.maxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-slate-500">ROI & Duration</span>
                    <span className="font-semibold">{plan.roiDisplay} / {plan.durationDisplay}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-slate-500">Raw Config</span>
                    <span className="font-semibold text-xs text-slate-400">{plan.roiPercentage}% / {plan.durationDays} days</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Features</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-sm flex items-start">
                        <ArrowRight className="h-3 w-3 text-gold mr-2 mt-1 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Investment Plan" : "Create Investment Plan"}</DialogTitle>
            <DialogDescription>
              Configure the parameters for this investment plan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Starter Plan" />
              </div>
              <div className="flex items-center gap-4 mt-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded border-slate-300 text-navy focus:ring-navy" />
                  Is Active
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} className="rounded border-slate-300 text-navy focus:ring-navy" />
                  Is Popular
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Amount ($)</label>
                <Input type="number" required min="0" value={formData.minAmount} onChange={e => setFormData({...formData, minAmount: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Amount ($)</label>
                <Input type="number" required min="0" value={formData.maxAmount} onChange={e => setFormData({...formData, maxAmount: Number(e.target.value)})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ROI Percentage (%)</label>
                <Input type="number" required min="0" step="0.1" value={formData.roiPercentage} onChange={e => setFormData({...formData, roiPercentage: Number(e.target.value)})} />
                <p className="text-xs text-muted-foreground">Total percentage return (e.g. 150 for 150%)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (Days)</label>
                <Input type="number" required min="1" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})} />
                <p className="text-xs text-muted-foreground">Number of days the plan runs</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ROI Display Text</label>
                <Input required value={formData.roiDisplay} onChange={e => setFormData({...formData, roiDisplay: e.target.value})} placeholder="e.g. 150% ROI" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration Display Text</label>
                <Input required value={formData.durationDisplay} onChange={e => setFormData({...formData, durationDisplay: e.target.value})} placeholder="e.g. After 24 Hours" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Features (One per line)</label>
              <Textarea 
                required 
                rows={4} 
                value={formData.features} 
                onChange={e => setFormData({...formData, features: e.target.value})}
                placeholder="24/7 Support&#10;Instant Withdrawals"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-navy text-white hover:bg-navy/90">{editingPlan ? "Save Changes" : "Create Plan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
