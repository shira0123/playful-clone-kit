import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getCurrentUser, saveProfile } from "@/server-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile")({
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getCurrentUser().then((value) => {
      if (!value) return navigate({ to: "/login" });
      setUser(value as any);
      setLoading(false);
    });
  }, [navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const f = new FormData(event.currentTarget);
    try {
      await saveProfile({
        data: {
          firstName: String(f.get("firstName")),
          lastName: String(f.get("lastName")),
          phone: String(f.get("phone")),
        },
      });
      toast.success("Profile updated");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Profile">
        <div className="mt-6 max-w-xl rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 flex justify-center">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const initials =
    user?.firstName || user?.lastName
      ? `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()
      : null;

  return (
    <DashboardLayout title="Profile">
      <form
        onSubmit={submit}
        className="mt-6 max-w-xl rounded-lg bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-2xl font-bold text-gold">
            {initials ? initials : <User size={32} />}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                required
                name="firstName"
                defaultValue={user?.firstName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                required
                name="lastName"
                defaultValue={user?.lastName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                disabled
                value={user?.email ?? ""}
                className="bg-slate-50 pl-10"
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={user?.phone ?? ""}
            />
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="bg-gold font-semibold text-navy hover:bg-gold/90 w-full sm:w-auto"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
