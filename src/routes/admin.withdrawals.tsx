import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser, getAdminWithdrawals, adminUpdateWithdrawal } from "@/server-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowUpRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/withdrawals")({
  component: AdminWithdrawalsPage,
});

function AdminWithdrawalsPage() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      const data = await getAdminWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      toast.error("Failed to load withdrawals. The database table may not exist yet — run db:push first.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void getCurrentUser().then((u) => {
      if (!u || (u.role !== "admin" && u.role !== "super_admin")) {
        return navigate({ to: "/login" });
      }
      setAdmin(u);
      void fetchWithdrawals();
    });
  }, [navigate]);

  const handleAction = async (status: "approved" | "rejected") => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      await adminUpdateWithdrawal({ 
        data: { id: selectedRequest.id, status, adminNotes: adminNotes.trim() || undefined } 
      });
      toast.success(`Withdrawal request ${status}`);
      setSelectedRequest(null);
      setAdminNotes("");
      await fetchWithdrawals();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${status} request`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !admin) {
    return (
      <DashboardLayout title="Withdrawal Management" admin>
        <Skeleton className="h-[400px] w-full mt-6" />
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved</Badge>;
      case "rejected": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default: return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout
      title="Withdrawal Requests"
      admin
      userName={`${admin.firstName} ${admin.lastName}`.trim()}
      userEmail={admin.email}
    >
      <Card className="mt-6 border-navy/10 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-navy">All Requests</CardTitle>
          <CardDescription>Review and process user withdrawal requests.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {withdrawals.length > 0 ? (
            <div className="divide-y">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-navy text-xl">${w.amount.toLocaleString()}</span>
                      {getStatusBadge(w.status)}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">User:</span>{" "}
                        <span className="font-medium text-slate-700">{w.user.firstName} {w.user.lastName}</span>
                        <span className="text-muted-foreground ml-1">({w.user.email})</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Network:</span>{" "}
                        <span className="font-medium text-slate-700">{w.cryptoNetwork}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground">Address:</span>{" "}
                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded break-all">{w.walletAddress}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requested:</span>{" "}
                        {new Date(w.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {w.status === "pending" ? (
                      <Button 
                        onClick={() => { setSelectedRequest(w); setAdminNotes(""); }}
                        className="bg-navy hover:bg-navy/90 text-white w-full lg:w-auto"
                      >
                        Review Request
                      </Button>
                    ) : (
                      <div className="text-xs text-muted-foreground text-right w-full lg:w-auto">
                        <div>Processed: {new Date(w.reviewedAt).toLocaleString()}</div>
                        {w.adminNotes && (
                          <div className="mt-1 italic line-clamp-1 max-w-[200px]" title={w.adminNotes}>
                            Note: {w.adminNotes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <ArrowUpRight className="h-12 w-12 mx-auto text-slate-200 mb-4" />
              <p className="text-lg font-medium text-navy">No withdrawal requests</p>
              <p className="text-sm">When users request withdrawals, they will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Withdrawal</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2 border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-xl font-bold text-navy">${selectedRequest.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <span className="font-medium text-slate-700">{selectedRequest.cryptoNetwork}</span>
                </div>
                <div className="pt-2 border-t mt-2">
                  <span className="text-sm text-muted-foreground block mb-1">Destination Address:</span>
                  <div className="font-mono text-xs p-2 bg-white border rounded break-all">
                    {selectedRequest.walletAddress}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Admin Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Reason for rejection or transaction ID for approval..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleAction("rejected")} 
              disabled={processing}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject & Refund
            </Button>
            <Button 
              onClick={() => handleAction("approved")} 
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve & Mark Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
