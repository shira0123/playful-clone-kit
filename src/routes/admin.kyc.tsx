import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getAdminKycList, approveKyc, rejectKyc } from "@/server-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/kyc")({
  component: AdminKyc,
});

function AdminKyc() {
  const [kycList, setKycList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for viewing/rejection dialog
  const [viewingKyc, setViewingKyc] = useState<any>(null);
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
      setViewingKyc(null); // Close modal if open
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
      setViewingKyc(null); // Close modal if open
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject KYC.");
    }
  };

  const openRejectDialog = (id: string) => {
    setRejectingKycId(id);
  };

  return (
    <DashboardLayout admin title="KYC Management">
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
                <TableRow key={kyc.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setViewingKyc(kyc)}>
                  <TableCell>
                    <div className="font-medium">{kyc.user.firstName} {kyc.user.lastName}</div>
                    <div className="text-sm text-muted-foreground">{kyc.user.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="capitalize">{kyc.documentType.replace("_", " ")}</div>
                    {kyc.documentUrl && (
                       <span className="text-xs text-blue-600 flex items-center mt-1">
                         <FileText className="h-3 w-3 mr-1" /> View Document
                       </span>
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
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {kyc.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="text-navy" onClick={() => setViewingKyc(kyc)}>
                          <Eye className="h-4 w-4 mr-1" /> Review
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setViewingKyc(kyc)}>
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Modal */}
      {viewingKyc && !rejectingKycId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-navy">KYC Review: {viewingKyc.user.firstName} {viewingKyc.user.lastName}</h2>
                  <p className="text-sm text-muted-foreground">{viewingKyc.user.email}</p>
                </div>
                <Badge variant={viewingKyc.status === "approved" ? "default" : viewingKyc.status === "rejected" ? "destructive" : "secondary"} className={viewingKyc.status === "approved" ? "bg-green-600" : ""}>
                  {viewingKyc.status}
                </Badge>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date of Birth</p>
                  <p className="text-sm">{new Date(viewingKyc.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submitted On</p>
                  <p className="text-sm">{new Date(viewingKyc.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Residence Address</p>
                <div className="p-3 bg-slate-50 rounded-md border text-sm whitespace-pre-wrap">
                  {viewingKyc.residenceAddress}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identification Document</p>
                <div className="p-4 bg-slate-50 rounded-md border flex flex-col gap-2">
                  <p className="font-medium capitalize flex items-center gap-2">
                    <FileText className="h-4 w-4 text-navy" />
                    {viewingKyc.documentType.replace("_", " ")}
                  </p>
                  {viewingKyc.documentUrl ? (
                    <a href={viewingKyc.documentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all font-medium flex items-center bg-white p-2 rounded border">
                      {viewingKyc.documentUrl}
                    </a>
                  ) : (
                    <p className="text-sm text-amber-600 italic">No document link provided by user. Manual outreach may be required.</p>
                  )}
                </div>
              </div>
              
              {viewingKyc.status === "rejected" && viewingKyc.adminNotes && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Rejection Reason</p>
                  <div className="p-3 bg-red-50 text-red-800 rounded-md border border-red-100 text-sm">
                    {viewingKyc.adminNotes}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 shrink-0">
              <Button variant="ghost" onClick={() => setViewingKyc(null)}>Close</Button>
              {viewingKyc.status === "pending" && (
                <>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => openRejectDialog(viewingKyc.id)}>
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(viewingKyc.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingKycId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
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
