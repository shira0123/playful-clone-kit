import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserSessions, getUserActivity, revokeOtherSessions } from "@/server-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Monitor, Smartphone, Shield, Globe, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/activity")({ 
  component: Activity 
});

function Activity() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await getUserSessions();
      setSessions(data || []);
    } catch (error) {
      toast.error("Failed to load sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadActivity = async () => {
    setIsLoadingActivities(true);
    try {
      const data = await getUserActivity();
      setActivities(data || []);
    } catch (error) {
      toast.error("Failed to load activity");
    } finally {
      setIsLoadingActivities(false);
    }
  };

  useEffect(() => {
    loadSessions();
    loadActivity();
  }, []);

  const handleRevokeOtherSessions = async () => {
    setIsRevoking(true);
    try {
      await revokeOtherSessions();
      toast.success("Other sessions revoked successfully");
      await loadSessions();
    } catch (error) {
      toast.error("Failed to revoke sessions");
    } finally {
      setIsRevoking(false);
    }
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'user.login': return 'Signed in';
      case 'user.password_changed': return 'Password changed';
      case 'user.created': return 'Account created';
      case 'user.logout': return 'Signed out';
      case 'session.revoked': return 'Session revoked';
      default: return action;
    }
  };

  return (
    <DashboardLayout title="Activity">
      <div className="grid gap-6 mt-6">
        {/* Active Sessions Section */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Active Sessions</h2>
          <p className="text-sm text-muted-foreground mb-6">Devices currently signed in to your account</p>
          
          <div className="space-y-6">
            {isLoadingSessions ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              sessions.map((session, index) => {
                const isMobile = session.userAgent?.toLowerCase().includes('mobile');
                // Assume the most recent/current session is first, or use a current flag if provided
                const isCurrent = session.current || index === 0;
                
                return (
                  <div key={session.id || index} className="flex items-start gap-4">
                    <div className="mt-1 rounded-full bg-slate-100 p-2">
                      {isMobile ? (
                        <Smartphone className="h-5 w-5 text-slate-600" />
                      ) : (
                        <Monitor className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {session.userAgent ? (session.userAgent.length > 50 ? session.userAgent.substring(0, 50) + '...' : session.userAgent) : 'Unknown Device'}
                        </p>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" /> 
                          {session.ipAddress || 'Unknown IP'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          {session.updatedAt ? formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true }) : 'Unknown time'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!isLoadingSessions && sessions.length > 1 && (
            <>
              <Separator className="my-6" />
              <Button 
                variant="outline" 
                onClick={handleRevokeOtherSessions}
                disabled={isRevoking}
              >
                {isRevoking ? "Revoking..." : "Revoke All Other Sessions"}
              </Button>
            </>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <p className="text-sm text-muted-foreground mb-6">Account events from the last 30 days</p>
          
          <div className="space-y-6">
            {isLoadingActivities ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {activities.map((activity, index) => (
                  <div key={activity.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium text-sm">{getActionName(activity.action)}</span>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {activity.ipAddress && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" /> 
                              {activity.ipAddress}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> 
                            {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
