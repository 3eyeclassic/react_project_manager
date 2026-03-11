import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  BarChart3,
  FileText,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "カンバン", icon: LayoutGrid },
  { to: "/clients", label: "クライアント", icon: Users },
  { to: "/dashboard", label: "ダッシュボード", icon: BarChart3 },
  { to: "/invoices", label: "請求一覧", icon: FileText },
  { to: "/projects/archived", label: "アーカイブ済み", icon: Archive },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 flex-col border-r bg-card">
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
