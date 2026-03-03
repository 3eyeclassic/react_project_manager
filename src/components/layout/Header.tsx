import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";

export function Header() {
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
      {isDemoMode && (
        <div className="rounded-md bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200">
          デモモードで閲覧中
        </div>
      )}
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={isDark ? "ライトモード" : "ダークモード"}
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="ログアウト">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
