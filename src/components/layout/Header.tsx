import { useRef, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { useTimerStore } from "@/stores/timerStore";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun, Timer, Square } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProjects } from "@/hooks/useProjects";
import { useCreateWorkLog } from "@/hooks/useWorkLogs";
import { formatElapsedSeconds } from "@/lib/utils";
import { cn } from "@/lib/utils";

function TimerElapsed({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = Math.floor(
    (now - new Date(startedAt).getTime()) / 1000
  );
  return <span className="tabular-nums">{formatElapsedSeconds(elapsed)}</span>;
}

export function Header() {
  const user = useCurrentUser();
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects(user?.id);
  const createWorkLog = useCreateWorkLog(user?.id);
  const { projectId, projectName, startedAt, start, stop } = useTimerStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  function handleStartTimer(pid: string, name: string) {
    start(pid, name ?? "（無題）");
    setPickerOpen(false);
  }

  async function handleStopTimer() {
    if (!user?.id || !projectId || !startedAt) return;
    const ended = new Date();
    const duration = Math.floor(
      (ended.getTime() - new Date(startedAt).getTime()) / 1000
    );
    try {
      await createWorkLog.mutateAsync({
        project_id: projectId,
        started_at: startedAt,
        ended_at: ended.toISOString(),
        duration,
      });
    } finally {
      stop();
    }
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const isRunning = !!projectId && !!startedAt;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
      {isDemoMode && (
        <div className="rounded-md bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200">
          デモモードで閲覧中
        </div>
      )}
      <div className="flex flex-1 items-center gap-3">
        {isRunning ? (
          <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="max-w-[180px] truncate font-medium">
              {projectName}
            </span>
            <span className="text-muted-foreground">
              <TimerElapsed startedAt={startedAt} />
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 gap-1"
              onClick={handleStopTimer}
              disabled={createWorkLog.isPending}
            >
              <Square className="h-3.5 w-3.5" />
              停止
            </Button>
          </div>
        ) : (
          <div className="relative" ref={pickerRef}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setPickerOpen((o) => !o)}
              title="タイマーを開始"
            >
              <Timer className="h-4 w-4" />
              タイマー
            </Button>
            {pickerOpen && (
              <div
                className={cn(
                  "absolute left-0 top-full z-20 mt-1 max-h-[280px] min-w-[220px]",
                  "overflow-auto rounded-md border bg-popover shadow-md"
                )}
              >
                {projects.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    案件がありません
                  </p>
                ) : (
                  <ul className="py-1">
                    {projects.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() =>
                            handleStartTimer(
                              p.id,
                              p.name ?? "（無題）"
                            )
                          }
                        >
                          <span className="block truncate">
                            {p.name || "（無題）"}
                          </span>
                          {p.clients?.name && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {p.clients.name}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
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
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          title="ログアウト"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
