import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { ProjectWithClient } from "@/types/database";
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS } from "@/types/enums";
import type { ProjectStatus, Priority } from "@/types/enums";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/** ステータスごとのバッジ用クラス */
const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  not_started: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  in_progress: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  completed: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  payment_received: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
};

/** 優先度ごとのバッジ用クラス */
const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  high: "bg-red-500/20 text-red-700 dark:text-red-400",
  medium: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  low: "bg-slate-500/20 text-slate-600 dark:text-slate-400",
};

interface ProjectsTableProps {
  projects: ProjectWithClient[];
  isLoading?: boolean;
}

function formatAmount(project: ProjectWithClient): string {
  if (project.billing_type === "fixed" && project.amount != null) {
    return `¥${project.amount.toLocaleString()}`;
  }
  if (project.billing_type === "hourly" && project.hourly_rate != null) {
    return `¥${project.hourly_rate.toLocaleString()}/h`;
  }
  return "—";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(value, "yyyy/MM/dd");
  } catch {
    return value;
  }
}

export function ProjectsTable({ projects, isLoading }: ProjectsTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">案件名</th>
              <th className="px-4 py-3 text-left font-medium">クライアント</th>
              <th className="px-4 py-3 text-left font-medium">ステータス</th>
              <th className="px-4 py-3 text-left font-medium">優先度</th>
              <th className="px-4 py-3 text-left font-medium">金額</th>
              <th className="px-4 py-3 text-left font-medium">開始日</th>
              <th className="px-4 py-3 text-left font-medium">終了日</th>
              <th className="px-4 py-3 text-left font-medium">進捗</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="px-4 py-3">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-8 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-12 animate-pulse rounded bg-muted" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16">
        <FolderOpen className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          案件がありません
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">案件名</th>
            <th className="px-4 py-3 text-left font-medium">クライアント</th>
            <th className="px-4 py-3 text-left font-medium">ステータス</th>
            <th className="px-4 py-3 text-left font-medium">優先度</th>
            <th className="px-4 py-3 text-left font-medium">金額</th>
            <th className="px-4 py-3 text-left font-medium">開始日</th>
            <th className="px-4 py-3 text-left font-medium">終了日</th>
            <th className="px-4 py-3 text-left font-medium">進捗</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const clientName =
              (project.clients as { name?: string } | null)?.name ?? "—";
            const statusLabel =
              PROJECT_STATUS_LABELS[project.status as ProjectStatus] ?? project.status;
            const priorityLabel =
              PRIORITY_LABELS[project.priority as Priority] ?? project.priority;
            return (
              <tr
                key={project.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/projects/${project.id}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {project.name || "（名前未設定）"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {clientName}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      STATUS_BADGE_CLASSES[project.status as ProjectStatus] ??
                        "bg-muted text-muted-foreground"
                    )}
                  >
                    {statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      PRIORITY_BADGE_CLASSES[project.priority as Priority] ??
                        "bg-muted text-muted-foreground"
                    )}
                  >
                    {priorityLabel}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatAmount(project)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(project.start_date)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(project.end_date)}
                </td>
                <td className="px-4 py-3 tabular-nums">{project.progress}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
