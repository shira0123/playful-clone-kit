import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getAdminOverview } from "@/server-fns";
import { Users, ShieldCheck, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({ component: Admin });

function Admin() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<{ users: number; active: number; verified: number }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getAdminOverview()
      .then(setOverview)
      .catch(() => navigate({ to: "/login" }))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  return (
    <DashboardLayout admin title="Administrator dashboard">
      <p className="mt-2 text-muted-foreground">Manage accounts and review platform activity.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registered users</CardTitle>
                <div className="rounded-full bg-navy/10 p-2 text-navy">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.users ?? "—"}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active accounts</CardTitle>
                <div className="rounded-full bg-navy/10 p-2 text-navy">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.active ?? "—"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified emails</CardTitle>
                <div className="rounded-full bg-navy/10 p-2 text-navy">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.verified ?? "—"}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-4">
          <Button asChild className="bg-navy text-white hover:bg-navy/90">
            <Link to="/admin/users">
              Manage Users
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/audit">
              View Audit Logs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
