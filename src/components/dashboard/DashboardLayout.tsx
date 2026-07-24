import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Settings,
  Bell,
  Activity,
  LogOut,
  ScrollText,
  Users as UsersIcon,
  Shield,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { logoutUser } from "@/server-fns";

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
  admin?: boolean;
  userName?: string;
  userEmail?: string;
}

export function DashboardLayout({
  title,
  children,
  admin = false,
  userName,
  userEmail,
}: DashboardLayoutProps) {
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutUser();
    await navigate({ to: "/login" as any });
  }

  const userNavItems = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/investments", label: "Investments", icon: Activity },
    { to: "/dashboard/profile", label: "Profile", icon: User },
    { to: "/dashboard/settings", label: "Settings", icon: Settings },
    { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ];

  const adminNavItems = [
    { to: "/admin", label: "Overview", icon: Shield },
    { to: "/admin/investments", label: "Investments", icon: Activity },
    { to: "/admin/users", label: "Users", icon: UsersIcon },
    { to: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  ];

  const navItems = admin ? adminNavItems : userNavItems;

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  const renderNavContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-navy">
          EVOLVE <span className="text-gold">DIGITAL TRADE</span>
        </Link>
      </div>

      {userName && (
        <>
          <div className="flex items-center gap-3 px-6 pb-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-medium text-gold">
              {initials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-slate-900">{userName}</span>
              {userEmail && <span className="truncate text-xs text-slate-500">{userEmail}</span>}
            </div>
          </div>
          <Separator className="mx-6 mb-4 w-auto" />
        </>
      )}

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to as any}
            className="group flex items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 [&.active]:border-gold [&.active]:bg-slate-50 [&.active]:font-medium [&.active]:text-gold"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-600 hover:text-slate-900"
          onClick={() => void handleLogout()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 lg:flex-row">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-navy px-4 text-white lg:hidden">
        <Link to="/" className="font-display text-lg font-bold">
          EVOLVE <span className="text-gold">DIGITAL TRADE</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            {renderNavContent()}
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col border-r bg-white lg:fixed lg:inset-y-0 lg:flex lg:z-20">
        {renderNavContent()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-72">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-navy">{title}</h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
