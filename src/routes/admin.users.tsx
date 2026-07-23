import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { 
  adminDeleteUser, 
  adminImpersonateUser, 
  adminResetPassword, 
  adminVerifyEmail, 
  changeAdminUserStatus, 
  getAdminUsers 
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
  Eye 
} from "lucide-react";

type User = { 
  id: string; 
  email: string; 
  role: string; 
  status: "active" | "suspended"; 
  emailVerifiedAt: Date | null; 
  firstName: string | null; 
  lastName: string | null;
};

export const Route = createFileRoute("/admin/users")({ component: Users });

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const load = (q: string, p: number) => {
    setIsLoading(true);
    getAdminUsers({ data: { query: q, page: p } })
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
    } catch (error) {
      toast.error("Action failed.");
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => void act(() => changeAdminUserStatus({ data: { userId: user.id, status: user.status === "active" ? "suspended" : "active" } }), `User ${user.status === "active" ? "suspended" : "reactivated"}.`)}>                            {user.status === "active" ? (
                              <><UserCog className="mr-2 h-4 w-4" /> Suspend</>
                            ) : (
                              <><ShieldCheck className="mr-2 h-4 w-4" /> Reactivate</>
                            )}
                          </DropdownMenuItem>
                          
                          {!user.emailVerifiedAt && (
                            <DropdownMenuItem onClick={() => void act(() => adminVerifyEmail({ data: { userId: user.id } }), "Email verified.")}>
                              <ShieldCheck className="mr-2 h-4 w-4" /> Verify Email
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => void act(() => adminResetPassword({ data: { userId: user.id } }), "Password reset link sent.")}>
                            <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => void act(() => adminImpersonateUser({ data: { userId: user.id } }), "Impersonating user...")}>
                            <Eye className="mr-2 h-4 w-4" /> Impersonate
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setUserToDelete(user)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
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
    </DashboardLayout>
  );
}
