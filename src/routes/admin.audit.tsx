import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getAuditLogs } from "@/server-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/audit")({ component: Audit });

function formatActionName(action: string) {
  return action
    .split(".")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getActionColor(action: string) {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes("create") || lowerAction.includes("verify") || lowerAction.includes("active")) {
    return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
  }
  if (lowerAction.includes("delete") || lowerAction.includes("remove")) {
    return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
  }
  if (lowerAction.includes("update") || lowerAction.includes("suspend") || lowerAction.includes("status")) {
    return "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200";
  }
  return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";
}

function Audit() {
  const [logs, setLogs] = useState<Array<{ id: string; action: string; actorEmail: string | null; createdAt: Date }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getAuditLogs()
      .then(setLogs)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardLayout admin title="Audit logs">
      <div className="mt-6 rounded-lg bg-white p-5 shadow-sm">
        <div className="divide-y">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-4">
                <Skeleton className="mb-2 h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ScrollText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium">No audit events yet</p>
              <p className="text-sm text-muted-foreground">System activity will appear here.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between py-4">
                <div>
                  <p className="font-medium text-foreground">
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {formatActionName(log.action)}
                    </Badge>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{log.actorEmail ?? "System"}</span> performed this action
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground" title={new Date(log.createdAt).toLocaleString()}>
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
