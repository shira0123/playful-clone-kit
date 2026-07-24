import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getAdminInvestments, approveInvestment, rejectInvestment } from "@/server-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

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

  const handleApprove = async (id: string) => {
    try {
      await approveInvestment({ data: { id } });
      toast.success("Investment approved successfully");
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
                            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApprove(inv.id)}>
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(inv.id)}>
                              <X className="h-4 w-4 mr-1" /> Reject
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
    </DashboardLayout>
  );
}
