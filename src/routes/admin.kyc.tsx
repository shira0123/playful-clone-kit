import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getAdminKycList, approveKyc, rejectKyc } from "@/server-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FileText, CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin/kyc")({
  component: AdminKyc,
});

function AdminKyc() {
  const [kycList, setKycList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for rejection dialog
  const [rejectingKycId, setRejectingKycId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const load = () => {
    setIsLoading(true);
    getAdminKycList()
      .then(setKycList)
      .catch(() => toast.error("Failed to load KYC list"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to approve this KYC application?")) return;
    try {
      await approveKyc({ data: { id } });
      toast.success("KYC approved.");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve KYC.");
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingKycId || !rejectNotes) return;
    try {
      await rejectKyc({ data: { id: rejectingKycId, notes: rejectNotes } });
      toast.success("KYC rejected.");
      setRejectingKycId(null);
      setRejectNotes("");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject KYC.");
    }
  };

  return (
    <DashboardLayout title="KYC Management">
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : kycList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No KYC submissions found.
                </TableCell>
              </TableRow>
            ) : (
              kycList.map((kyc) => (
                <TableRow key={kyc.id}>
                  <TableCell>
                    <div className="font-medium">{kyc.user.firstName} {kyc.user.lastName}</div>
                    <div className="text-sm text-muted-foreground">{kyc.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="capitalize">{kyc.documentType.replace("_", " ")}</div>
                    {kyc.documentUrl ? (
                      <a href={kyc.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center mt-1">
                        <FileText className="h-3 w-3 mr-1" /> View Document
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">No document URL</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">DOB:</span> {new Date(kyc.dateOfBirth).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={kyc.residenceAddress}>
                      {kyc.residenceAddress}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={kyc.status === "approved" ? "default" : kyc.status === "rejected" ? "destructive" : "secondary"} className={kyc.status === "approved" ? "bg-green-600" : ""}>
                      {kyc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {kyc.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApprove(kyc.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setRejectingKycId(kyc.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {rejectingKycId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-navy">Reject KYC Submission</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please provide a reason for rejecting this KYC application. The user will see this message.
            </p>
            <form onSubmit={handleReject} className="mt-4">
              <textarea
                required
                className="w-full rounded-md border p-2 text-sm"
                rows={3}
                placeholder="e.g. Document image is blurry, please re-upload."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setRejectingKycId(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive">
                  Reject Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
