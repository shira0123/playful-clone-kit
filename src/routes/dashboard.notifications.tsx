import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/server-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bell, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/notifications")({
  component: Notifications,
});

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string | Date;
};

function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then((data) => setItems(data as unknown as NotificationItem[]))
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead({ data: { notificationId: id } });
      toast.success("Notification marked as read");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-4xl mx-auto w-full mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0A2540]">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                No notifications yet
              </h2>
              <p className="text-muted-foreground mt-2">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-start gap-4 p-6 transition-colors ${
                    !item.read
                      ? "bg-slate-50 border-l-4 border-l-[#D4AF37]"
                      : "bg-white opacity-75"
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                      <h3
                        className={`font-semibold ${
                          !item.read ? "text-[#0A2540]" : "text-slate-600"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="text-xs text-muted-foreground ml-auto sm:ml-4 whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        !item.read ? "text-slate-700" : "text-muted-foreground"
                      }`}
                    >
                      {item.body}
                    </p>
                  </div>
                  {!item.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(item.id)}
                      className="shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2 sm:mt-0"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Mark as read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
