import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { changeUserPassword, deleteUserAccount } from "@/server-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { KeyRound, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changeUserPassword({ currentPassword, newPassword });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm.");
      return;
    }

    try {
      setIsDeletingAccount(true);
      await deleteUserAccount({ password: deletePassword });
      toast.success("Account deleted successfully.");
      setIsDeleteDialogOpen(false);
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="mx-auto max-w-4xl space-y-6 mt-6">
        {/* Change Password Section */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#0B1A30]" />
            <h2 className="text-lg font-semibold text-[#0B1A30]">Change Password</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Use this form to update your password securely. Active sessions are revoked when your password changes.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                12+ characters with uppercase, lowercase, and a number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-[#0B1A30] text-white hover:bg-[#0B1A30]/90"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>

        {/* Danger Zone Section */}
        <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-600">Delete Account</h2>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="my-4 space-y-2">
                <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                <Input
                  id="deletePassword"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletePassword("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteAccount();
                  }}
                  disabled={isDeletingAccount || !deletePassword}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeletingAccount ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DashboardLayout>
  );
}
