import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileClock,
  FilePenLine,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Upload,
} from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "../components/ThemeToggle";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/questions", label: "Question Bank", icon: BookOpen },
  { to: "/import", label: "Import", icon: Upload },
  { to: "/templates", label: "Templates", icon: FileClock },
  { to: "/generate", label: "Generate", icon: FilePenLine },
  { to: "/preview", label: "Preview", icon: FileText },
  { to: "/history", label: "History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background/80">
      <aside
        className={[
          "hidden border-r border-white/40 bg-white/70 px-3 py-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-card/70 lg:block",
          collapsed ? "w-20" : "w-72",
        ].join(" ")}
      >
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="min-w-0 text-left"
          >
            <p className="text-xs font-semibold uppercase text-cyan-600">ExamForge</p>
            {!collapsed && <h1 className="mt-1 truncate text-xl font-semibold">AI</h1>}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-muted"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed ? "justify-center" : "",
                ].join(" ")
              }
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-white/40 bg-white/70 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-card/70 sm:px-6">
          <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-md border bg-background/70 px-3 lg:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="h-10 w-full bg-transparent text-sm outline-none"
              placeholder="Search questions, papers, subjects..."
            />
          </div>
          <div className="min-w-0 flex-1 lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              ExamForge AI
            </p>
            <p className="truncate text-sm font-medium">Tech University</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNotificationsOpen((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-muted"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-28 top-14 z-20 w-72 rounded-lg border bg-card p-3 text-sm shadow-xl">
                <p className="font-medium">Notifications</p>
                <p className="mt-2 text-muted-foreground">No unread production alerts.</p>
              </div>
            )}
            <ThemeToggle />
            <div className="hidden rounded-md border bg-background px-3 py-1.5 sm:block">
              <p className="text-xs text-muted-foreground">{user?.role}</p>
              <p className="text-sm font-medium">{user?.fullName}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-muted"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
