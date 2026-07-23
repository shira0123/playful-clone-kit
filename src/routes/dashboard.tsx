import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser, getNotifications } from "@/server-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Bell, 
  User, 
  Settings, 
  Activity, 
  ArrowRight 
} from "lucide-react";

type SafeUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  impersonatorId: string | null;
};

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getCurrentUser().then((u) => {
      if (!u) return navigate({ to: "/login" });
      if (u.role === "admin") return navigate({ to: "/admin" });
      setUser(u as SafeUser);
      return getNotifications().then((notes) => {
        setNotifications(notes);
        setLoading(false);
      });
    });
  }, [navigate]);

  if (loading || !user) {
    return (
      <DashboardLayout title="Welcome">
        <div className="space-y-6 mt-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={`Welcome${user.firstName ? `, ${user.firstName}` : ""}`}
      userName={`${user.firstName} ${user.lastName}`.trim()}
      userEmail={user.email}
    >
      <p className="mt-2 text-muted-foreground">Your secure account overview and recent updates.</p>

      {/* Quick Actions Row */}
      <div className="mt-6 flex flex-wrap gap-4">
        <Button asChild variant="outline">
          <Link to="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Change Password
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/activity">
            <Activity className="mr-2 h-4 w-4" />
            View Activity
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Your account is in good standing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Verification</CardTitle>
            {user.emailVerified ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.emailVerified ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Unverified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground truncate" title={user.email}>
              {user.email}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              New updates
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-navy">Latest notifications</CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link to="/dashboard/notifications">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {notifications.length ? (
                notifications.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-medium text-navy">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-navy">No notifications yet</p>
                  <p className="text-sm text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <Button asChild variant="ghost" className="w-full mt-4 sm:hidden">
                <Link to="/dashboard/notifications">
                  View All Notifications <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
