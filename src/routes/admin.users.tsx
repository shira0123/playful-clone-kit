import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  adminDeleteUser, 
  adminImpersonateUser, 
  adminResetPassword, 
  adminVerifyEmail, 
  changeAdminUserStatus, 
  getAdminUsers,
  adminUpdateUserFunds,
  adminChangeUserRole,
  getCurrentUser
} from "@/server-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  Search, 
  MoreHorizontal, 
  UserCog, 
  ShieldCheck, 
  KeyRound, 
  Trash2, 
  Users as UsersIcon, 
  Eye,
  CircleDollarSign
} from "lucide-react";

type User = { 
  id: string; 
  email: string; 
  role: string; 
  status: "active" | "suspended"; 
  emailVerifiedAt: Date | null; 
  firstName: string | null; 
  lastName: string | null;
  balance?: number | null;
  totalInvested?: number | null;
  totalWithdrawal?: number | null;
  profits?: number | null;
  bonus?: number | null;
  referralCommission?: number | null;
};

export const Route = createFileRoute("/admin/users")({ component: Users });

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToVerify, setUserToVerify] = useState<User | null>(null);
  const [fundManageUser, setFundManageUser] = useState<User | null>(null);
  const [fundField, setFundField] = useState<"balance" | "profits" | "bonus" | "referralCommission">("balance");
  const [fundAmount, setFundAmount] = useState("");
  const [fundAction, setFundAction] = useState<"add" | "deduct">("add");
  const [isSubmittingFund, setIsSubmittingFund] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("admin");

  useEffect(() => {
    getCurrentUser().then(u => {
      if (u) setCurrentUserRole(u.role);
    });
  }, []);

  const load = (q: string, p: number) => {
    setIsLoading(true);
    getAdminUsers({ data: { query: q, page: p - 1 } })
      .then(setUsers)
      .catch(() => toast.error("Unable to load users."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load(searchQuery, page);
  }, [searchQuery, page]);

  async function act(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action();
      toast.success(successMessage);
      load(searchQuery, page);
    } catch (error: any) {
      toast.error(error?.message || "Action failed.");
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(query);
  };

  return (
    <DashboardLayout admin title="Users">
      <div className="mt-6 rounded-lg bg-white p-5 shadow-sm">
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search users by name or email" 
              className="pl-9" 
            />
          </div>
          <Button type="submit" className="bg-navy text-white hover:bg-navy/90">Search</Button>
        </form>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "destructive"} className={user.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}>
                        {user.status}
                      </Badge>
                      {currentUserRole === "super_admin" && user.role === "super_admin" && <Badge className="ml-2 bg-purple-600 hover:bg-purple-700">Super Admin</Badge>}
                      {(user.role === "admin" || (user.role === "super_admin" && currentUserRole !== "super_admin")) && <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">Admin</Badge>}
                    </TableCell>
                    <TableCell>
                      {user.emailVerifiedAt ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-xl z-50">
                          <DropdownMenuItem onClick={() => void act(() => changeAdminUserStatus({ data: { userId: user.id, status: user.status === "active" ? "suspended" : "active" } }), `User ${user.status === "active" ? "suspended" : "reactivated"}.`)}>                            {user.status === "active" ? (
                              <><UserCog className="mr-2 h-4 w-4" /> Suspend</>
                            ) : (
                              <><ShieldCheck className="mr-2 h-4 w-4" /> Reactivate</>
                            )}
                          </DropdownMenuItem>
                          
                          {!user.emailVerifiedAt && (
                            <DropdownMenuItem onClick={() => setUserToVerify(user)}>
                              <ShieldCheck className="mr-2 h-4 w-4" /> Verify Email
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => void act(() => adminResetPassword({ data: { userId: user.id } }), "Password reset link sent.")}>
                            <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => {
                            void act(async () => {
                              await adminImpersonateUser({ data: { userId: user.id } });
                              window.location.href = "/dashboard";
                            }, "Impersonating user...");
                          }}>
                            <Eye className="mr-2 h-4 w-4" /> Impersonate
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => setFundManageUser(user)}>
                            <CircleDollarSign className="mr-2 h-4 w-4" /> Manage Funds
                          </DropdownMenuItem>

                          {currentUserRole === "super_admin" && user.role !== "super_admin" && (
                            <DropdownMenuItem onClick={() => void act(() => adminChangeUserRole({ data: { userId: user.id, role: user.role === "admin" ? "user" : "admin" } }), `User is now ${user.role === "admin" ? "a regular user" : "an admin"}.`)}>
                              <ShieldCheck className="mr-2 h-4 w-4" /> {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                            </DropdownMenuItem>
                          )}

                          {user.role !== "super_admin" && (
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setUserToDelete(user)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page}</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              disabled={users.length < 25 || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for{" "}
              <span className="font-semibold">{userToDelete?.email}</span> and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700" 
              onClick={() => {
                if (userToDelete) {
                  void act(() => adminDeleteUser({ data: { userId: userToDelete.id } }), "User permanently deleted.");
                  setUserToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToVerify} onOpenChange={(open) => !open && setUserToVerify(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forcibly Verify Email?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify the email address <span className="font-semibold">{userToVerify?.email}</span>? This will allow the user to access the dashboard even if they haven't verified their email manually.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-navy hover:bg-navy/90" 
              onClick={() => {
                if (userToVerify) {
                  void act(() => adminVerifyEmail({ data: { userId: userToVerify.id } }), "Email verified.");
                  setUserToVerify(null);
                }
              }}
            >
              Verify User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    {/* Manage Funds Modal */}
      <AlertDialog open={!!fundManageUser} onOpenChange={(open) => {
        if (!open) {
          setFundManageUser(null);
          setFundAmount("");
          setFundAction("add");
          setFundField("balance");
        }
      }}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Manage Funds: {fundManageUser?.email}</AlertDialogTitle>
            <AlertDialogDescription>Add or deduct funds from this user's account balances.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Field</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={fundField}
                  onChange={(e: any) => setFundField(e.target.value)}
                >
                  <option value="balance">Wallet Balance</option>
                  <option value="profits">Profits</option>
                  <option value="bonus">Bonus</option>
                  <option value="referralCommission">Referral Commission</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={fundAction}
                  onChange={(e: any) => setFundAction(e.target.value)}
                >
                  <option value="add">Add Funds</option>
                  <option value="deduct">Deduct Funds</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount ($)</label>
              <Input 
                type="number" 
                min="0"
                step="0.01"
                placeholder="0.00" 
                value={fundAmount} 
                onChange={(e) => setFundAmount(e.target.value)} 
              />
            </div>
            {fundManageUser && (
              <div className="bg-slate-50 p-3 rounded-md text-sm border">
                <p><strong>Current {fundField}:</strong> ${(fundManageUser as any)[fundField]?.toLocaleString() || 0}</p>
                <p><strong>New {fundField}:</strong> ${
                  fundAction === "add" 
                    ? ((fundManageUser as any)[fundField] || 0) + Number(fundAmount || 0)
                    : Math.max(0, ((fundManageUser as any)[fundField] || 0) - Number(fundAmount || 0))
                }</p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmittingFund}>Cancel</AlertDialogCancel>
            <Button 
              className={fundAction === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              disabled={!fundAmount || Number(fundAmount) <= 0 || isSubmittingFund}
              onClick={async () => {
                if (!fundManageUser || !fundAmount || isNaN(Number(fundAmount))) return;
                setIsSubmittingFund(true);
                try {
                  await adminUpdateUserFunds({ data: { userId: fundManageUser.id, field: fundField, amount: Number(fundAmount), action: fundAction } });
                  toast.success("User funds updated successfully.");
                  setFundManageUser(null);
                  setFundAmount("");
                  load(searchQuery, page);
                } catch(e: any) {
                  toast.error(e.message || "Failed to update funds.");
                } finally {
                  setIsSubmittingFund(false);
                }
              }}
            >
              {isSubmittingFund ? "Processing..." : fundAction === "add" ? "Add Funds" : "Deduct Funds"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
