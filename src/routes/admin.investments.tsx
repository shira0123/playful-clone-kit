import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getAdminInvestments, approveInvestment, rejectInvestment, cancelInvestment } from "@/server-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/investments")({ component: AdminInvestments });

type Investment = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  startedAt: string | null;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  plan: {
    name: string;
  };
};

function AdminInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModalOpen, setApproveModalOpen] = useState<Investment | null>(null);
  const [approveAmount, setApproveAmount] = useState<string>("");

  const loadData = async () => {
    try {
      const data = await getAdminInvestments({ data: {} });
      setInvestments(data as any);
    } catch (err) {
      toast.error("Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const confirmApprove = async () => {
    if (!approveModalOpen || !approveAmount) return;
    try {
      await approveInvestment({ data: { id: approveModalOpen.id, newAmount: Number(approveAmount) } });
      toast.success("Investment approved successfully");
      setApproveModalOpen(null);
      await loadData();
    } catch (err) {
      toast.error("Failed to approve investment");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this investment?")) return;
    try {
      await rejectInvestment({ data: { id } });
      toast.success("Investment rejected");
      await loadData();
    } catch (err) {
      toast.error("Failed to reject investment");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this active investment?")) return;
    try {
      await cancelInvestment({ data: { id } });
      toast.success("Investment cancelled successfully");
      await loadData();
    } catch (err) {
      toast.error("Failed to cancel investment");
    }
  };

  return (
    <DashboardLayout admin title="Manage Investments">
      <p className="mt-2 text-muted-foreground mb-6">Review and approve user investment requests.</p>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading investments...</div>
          ) : investments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No investments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Plan & Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {investments.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy">{inv.user.firstName} {inv.user.lastName}</div>
                        <div className="text-slate-500">{inv.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-navy">{inv.plan.name}</div>
                        <div className="text-gold font-bold">${inv.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {format(new Date(inv.createdAt), "MMM d, yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => { setApproveModalOpen(inv); setApproveAmount(inv.amount.toString()); }}>
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(inv.id)}>
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                        {inv.status === "active" && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-slate-600 hover:text-slate-700 hover:bg-slate-50" onClick={() => handleCancel(inv.id)}>
                              <X className="h-4 w-4 mr-1" /> Cancel Plan
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!approveModalOpen} onOpenChange={(open) => !open && setApproveModalOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm & Edit Deposit</DialogTitle>
            <DialogDescription>
              Confirm the final deposit amount for this investment. This will be added to the user's Total Invested balance.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Deposit Amount ($)</label>
            <Input 
              type="number" 
              min="0"
              step="0.01"
              value={approveAmount} 
              onChange={(e) => setApproveAmount(e.target.value)} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(null)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={confirmApprove}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
