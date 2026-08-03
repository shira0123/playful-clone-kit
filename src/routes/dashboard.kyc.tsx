import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserKyc, submitKyc } from "@/server-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Clock, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/kyc")({
  component: DashboardKyc,
});

function DashboardKyc() {
  const [kyc, setKyc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [residenceAddress, setResidenceAddress] = useState("");
  const [documentType, setDocumentType] = useState<any>("");
  const [documentUrl, setDocumentUrl] = useState("");

  useEffect(() => {
    loadKyc();
  }, []);

  const loadKyc = () => {
    setIsLoading(true);
    getUserKyc()
      .then((data) => {
        setKyc(data);
        if (data && (data.status === "rejected" || data.status === "pending")) {
          setDateOfBirth(data.dateOfBirth || "");
          setResidenceAddress(data.residenceAddress || "");
          setDocumentType(data.documentType || "");
          setDocumentUrl(data.documentUrl || "");
        }
      })
      .catch(() => toast.error("Failed to load KYC status"))
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateOfBirth || !residenceAddress || !documentType) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitKyc({
        data: {
          dateOfBirth,
          residenceAddress,
          documentType,
          documentUrl: documentUrl || "",
        },
      });
      toast.success("KYC information submitted successfully.");
      loadKyc();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit KYC");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Identity Verification">
        <div className="flex h-40 items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Identity Verification">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {kyc?.status === "approved" && (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-green-100 p-3">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Identity Verified</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Your identity has been successfully verified. You have full access to all features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {kyc?.status === "pending" && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-amber-100 p-2 shrink-0">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">Verification in Progress</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Your documents are currently being reviewed by our compliance team. This usually takes 1-2 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {kyc?.status === "rejected" && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="rounded-full bg-red-100 p-2 shrink-0">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-900">Verification Rejected</h3>
                  <p className="mt-1 text-sm text-red-700">
                    Unfortunately, we could not verify your identity with the provided information.
                  </p>
                  {kyc?.adminNotes && (
                    <div className="mt-3 rounded-md bg-red-100/50 p-3 text-sm text-red-900">
                      <span className="font-semibold">Reason:</span> {kyc.adminNotes}
                    </div>
                  )}
                  <p className="mt-3 text-sm text-red-700">
                    Please correct your details and submit again below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(!kyc || kyc.status === "rejected" || kyc.status === "pending") && (
          <Card>
            <CardHeader>
              <CardTitle>KYC Application</CardTitle>
              <CardDescription>
                To comply with financial regulations, we require you to verify your identity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residenceAddress">Full Residence Address</Label>
                  <Textarea
                    id="residenceAddress"
                    required
                    placeholder="Enter your complete residential address"
                    value={residenceAddress}
                    onChange={(e) => setResidenceAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-4 rounded-lg border p-4 bg-slate-50">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Identification Document
                  </h4>
                  
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <select
                      required
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                    >
                      <option value="" disabled>Select document type</option>
                      <option value="passport">Passport</option>
                      <option value="drivers_licence">Driver's License</option>
                      <option value="national_id">National ID Card</option>
                      <option value="work_id">Work ID</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentUrl">Document URL (Optional)</Label>
                    <Input
                      id="documentUrl"
                      type="url"
                      placeholder="e.g. Google Drive link to your document image"
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      If you have your document hosted online, paste the shareable link here. 
                      Otherwise, support will contact you for the document.
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-navy hover:bg-navy/90">
                  {isSubmitting ? "Submitting..." : kyc?.status === "pending" ? "Update Application" : "Submit KYC Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
