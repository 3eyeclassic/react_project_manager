import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { ProjectWithClient } from "@/types/database";
import type { UpdateProjectInput } from "@/api/projects";
import {
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  PRIORITY,
  PRIORITY_LABELS,
} from "@/types/enums";
import type { ProjectStatus, Priority } from "@/types/enums";
import { FolderOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useUpdateProject } from "@/hooks/useProjects";

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

const PROJECT_STATUS_OPTIONS = Object.values(PROJECT_STATUS);
const PRIORITY_OPTIONS = Object.values(PRIORITY);

interface ProjectsTableProps {
  projects: ProjectWithClient[];
  isLoading?: boolean;
  userId?: string;
  clientOptions?: { id: string; name: string | null }[];
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

const selectClassName = cn(
  "flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
);

type EditableField =
  | "name"
  | "client_id"
  | "status"
  | "priority"
  | "amount"
  | "start_date"
  | "end_date"
  | "progress";

export function ProjectsTable({
  projects,
  isLoading,
  userId,
  clientOptions = [],
}: ProjectsTableProps) {
  const updateProject = useUpdateProject(userId);
  const [editingCell, setEditingCell] = useState<{
    projectId: string;
    field: EditableField;
  } | null>(null);
  const [editDraft, setEditDraft] = useState<UpdateProjectInput | null>(null);

  const canEdit = !!userId;

  function startEditCell(project: ProjectWithClient, field: EditableField) {
    setEditingCell({ projectId: project.id, field });
    setEditDraft({
      name: project.name ?? undefined,
      client_id: project.client_id,
      status: project.status,
      priority: project.priority,
      amount: project.amount ?? undefined,
      hourly_rate: project.hourly_rate ?? undefined,
      start_date: project.start_date ?? undefined,
      end_date: project.end_date ?? undefined,
      progress: project.progress ?? 0,
    });
  }

  function cancelEdit() {
    setEditingCell(null);
    setEditDraft(null);
  }

  function handleSave(projectId: string) {
    if (!editDraft || !userId) return;
    updateProject.mutate(
      { id: projectId, input: editDraft },
      { onSuccess: () => cancelEdit() }
    );
  }

  function commitCell(projectId: string) {
    handleSave(projectId);
    cancelEdit();
  }

  function updateDraft(field: keyof UpdateProjectInput, value: unknown) {
    setEditDraft((prev) => (prev ? { ...prev, [field]: value } : null));
  }

  function isEditingCell(projectId: string, field: EditableField) {
    return (
      editingCell?.projectId === projectId && editingCell?.field === field
    );
  }

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
              {canEdit && <th className="w-24 px-2 py-3" aria-label="操作" />}
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
                {canEdit && <td className="px-2 py-3" />}
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
            {canEdit && <th className="w-24 px-2 py-3" aria-label="操作" />}
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const draft =
              editingCell?.projectId === project.id ? editDraft : null;
            const clientName =
              (project.clients as { name?: string } | null)?.name ?? "—";
            const statusLabel =
              PROJECT_STATUS_LABELS[project.status as ProjectStatus] ?? project.status;
            const priorityLabel =
              PRIORITY_LABELS[project.priority as Priority] ?? project.priority;

            const cellProps = (field: EditableField) => {
              const base = "px-4 py-2";
              const extra =
                field === "amount" || field === "progress"
                  ? "tabular-nums"
                  : field === "start_date" || field === "end_date"
                    ? "text-muted-foreground"
                    : "";
              return canEdit
                ? {
                    onClick: () => {
                      if (!isEditingCell(project.id, field))
                        startEditCell(project, field);
                    },
                    className: cn(
                      base,
                      extra,
                      !isEditingCell(project.id, field) &&
                        "cursor-pointer hover:bg-muted/20"
                    ),
                  }
                : { className: cn(base, extra) };
            };

            const blurSave = () => commitCell(project.id);
            const keyDownCancel = (e: React.KeyboardEvent) => {
              if (e.key === "Escape") cancelEdit();
            };

            return (
              <tr
                key={project.id}
                className="group border-b border-border/50 transition-colors"
              >
                <td {...cellProps("name")}>
                  {isEditingCell(project.id, "name") && draft ? (
                    <Input
                      className="h-8 text-sm"
                      value={draft.name ?? ""}
                      onChange={(e) => updateDraft("name", e.target.value || null)}
                      onBlur={blurSave}
                      onKeyDown={keyDownCancel}
                      placeholder="案件名"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium text-foreground">
                      {project.name || "（名前未設定）"}
                    </span>
                  )}
                </td>
                <td {...cellProps("client_id")}>
                  {isEditingCell(project.id, "client_id") && draft ? (
                    <select
                      className={selectClassName}
                      value={draft.client_id ?? ""}
                      onChange={(e) => updateDraft("client_id", e.target.value)}
                      onBlur={blurSave}
                      onKeyDown={keyDownCancel}
                      autoFocus
                    >
                      {clientOptions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name || "（名前未設定）"}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted-foreground">{clientName}</span>
                  )}
                </td>
                <td {...cellProps("status")}>
                  {isEditingCell(project.id, "status") && draft ? (
                    <select
                      className={selectClassName}
                      value={draft.status ?? ""}
                      onChange={(e) =>
                        updateDraft("status", e.target.value as ProjectStatus)
                      }
                      onBlur={blurSave}
                      onKeyDown={keyDownCancel}
                      autoFocus
                    >
                      {PROJECT_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {PROJECT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                        STATUS_BADGE_CLASSES[project.status as ProjectStatus] ??
                          "bg-muted text-muted-foreground"
                      )}
                    >
                      {statusLabel}
                    </span>
                  )}
                </td>
                <td {...cellProps("priority")}>
                  {isEditingCell(project.id, "priority") && draft ? (
                    <select
                      className={selectClassName}
                      value={draft.priority ?? ""}
                      onChange={(e) =>
                        updateDraft("priority", e.target.value as Priority)
                      }
                      onBlur={blurSave}
                      onKeyDown={keyDownCancel}
                      autoFocus
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {PRIORITY_LABELS[p]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                        PRIORITY_BADGE_CLASSES[project.priority as Priority] ??
                          "bg-muted text-muted-foreground"
                      )}
                    >
                      {priorityLabel}
                    </span>
                  )}
                </td>
                <td {...cellProps("amount")}>
                  {isEditingCell(project.id, "amount") && draft ? (
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      className="h-8 w-28 text-sm tabular-nums"
                      value={
                        project.billing_type === "hourly"
                          ? draft.hourly_rate ?? ""
                          : draft.amount ?? ""
                      }
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : null;
                        if (project.billing_type === "hourly") {
                          updateDraft("hourly_rate", v);
                        } else {
                          updateDraft("amount", v);
                        }
                      }}
                      onBlur={blurSave}
                      onKeyDown={keyDownCancel}
                      autoFocus
                    />
                  ) : (
                    formatAmount(project)
                  )}
                </td>
                <td {...cellProps("start_date")}>
                  {isEditingCell(project.id, "start_date") && draft ? (
                    <Input
                      type="date"
                      className="h-8 w-36 text-sm"
                      value={draft.start_date ?? ""}
                      onChange={(e) =>
                        updateDraft("start_date", e.target.value || null)
                      }
                      onBlur={blurSave}
                      onKeyDown={keyDownCancel}
                      autoFocus
                    />
                  ) : (
                    formatDate(project.start_date)
                  )}
                </td>
                <td {...cellProps("end_date")}>
                  {isEditingCell(project.id, "end_date") && draft ? (
                    <Input
                      type="date"
                      className="h-8 w-36 text-sm"
                      value={draft.end_date ?? ""}
                      onChange={(e) =>
                        updateDraft("end_date", e.target.value || null)
                      }
                      onBlur={blurSave}
                      onKeyDown={keyDownCancel}
                      autoFocus
                    />
                  ) : (
                    formatDate(project.end_date)
                  )}
                </td>
                <td {...cellProps("progress")}>
                  {isEditingCell(project.id, "progress") && draft ? (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="h-8 w-16 text-sm tabular-nums"
                      value={draft.progress ?? 0}
                      onChange={(e) =>
                        updateDraft("progress", Number(e.target.value) || 0)
                      }
                      onBlur={blurSave}
                      onKeyDown={keyDownCancel}
                      autoFocus
                    />
                  ) : (
                    `${project.progress}%`
                  )}
                </td>
                {canEdit && (
                  <td
                    className="w-10 px-2 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to={`/projects/${project.id}`}
                      className={cn(
                        "inline-flex items-center justify-center rounded p-1.5 text-primary",
                        "opacity-0 transition-opacity group-hover:opacity-100",
                        "pointer-events-none group-hover:pointer-events-auto",
                        "hover:bg-muted hover:text-primary"
                      )}
                      title="詳細"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </Link>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
