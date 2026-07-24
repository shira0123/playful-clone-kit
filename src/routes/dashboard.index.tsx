import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser, getNotifications, getPortfolioStats } from "@/server-fns";
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
  ArrowRight,
  TrendingUp,
  Wallet
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

export const Route = createFileRoute("/dashboard/")({ component: Dashboard });

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SafeUser | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const [stats, setStats] = useState({ totalInvested: 0, activeCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getCurrentUser().then((u) => {
      if (!u) return navigate({ to: "/login" });
      if (u.role === "admin") return navigate({ to: "/admin" });
      setUser(u as SafeUser);
      
      Promise.all([
        getNotifications(),
        getPortfolioStats()
      ]).then(([notes, portfolioStats]) => {
        setNotifications(notes);
        setStats(portfolioStats);
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
      <p className="mt-2 text-muted-foreground">Your secure account overview and portfolio updates.</p>

      {/* Quick Actions Row */}
      <div className="mt-6 flex flex-wrap gap-4">
        <Button asChild className="bg-gold text-navy hover:brightness-110">
          <Link to="/dashboard/investments">
            <TrendingUp className="mr-2 h-4 w-4" />
            Invest Now
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/profile">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <Wallet className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalInvested.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Active portfolio balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Activity className="h-4 w-4 text-navy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.pendingCount > 0 ? `${stats.pendingCount} pending approval` : 'No pending approvals'}
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
