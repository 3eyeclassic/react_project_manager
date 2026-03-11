import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  type ColumnDef,
  type RowData,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUpdateProject } from "@/hooks/useProjects";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    editingCell: { projectId: string; field: EditableField } | null;
    editDraft: UpdateProjectInput | null;
    canEdit: boolean;
    clientOptions: { id: string; name: string | null }[];
    startEditCell: (project: ProjectWithClient, field: EditableField) => void;
    updateDraft: (field: keyof UpdateProjectInput, value: unknown) => void;
    commitCell: (projectId: string) => void;
    cancelEdit: () => void;
    isEditingCell: (projectId: string, field: EditableField) => boolean;
  }
}

const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  not_started: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  in_progress: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  completed: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  payment_received: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
};

const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  high: "bg-red-500/20 text-red-700 dark:text-red-400",
  medium: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  low: "bg-slate-500/20 text-slate-600 dark:text-slate-400",
};

const PROJECT_STATUS_OPTIONS = Object.values(PROJECT_STATUS);
const PRIORITY_OPTIONS = Object.values(PRIORITY);

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

  const tableMeta = useMemo(
    () => ({
      editingCell,
      editDraft,
      canEdit,
      clientOptions,
      startEditCell,
      updateDraft,
      commitCell,
      cancelEdit,
      isEditingCell,
    }),
    [
      editingCell,
      editDraft,
      canEdit,
      clientOptions,
    ]
  );

  const columns = useMemo<ColumnDef<ProjectWithClient>[]>(
    () => [
      {
        accessorKey: "name",
        header: "案件名",
        cell: ({ row, table }) => {
          const project = row.original;
          const meta = table.options.meta!;
          const draft = meta.editingCell?.projectId === project.id ? meta.editDraft : null;
          const blurSave = () => meta.commitCell(project.id);
          const keyDownCancel = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") meta.cancelEdit();
          };
          return (
            <TableCell
              className={cn(
                "px-4 py-2",
                meta.canEdit &&
                  !meta.isEditingCell(project.id, "name") &&
                  "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => {
                if (meta.canEdit && !meta.isEditingCell(project.id, "name"))
                  meta.startEditCell(project, "name");
              }}
            >
              {meta.isEditingCell(project.id, "name") && draft ? (
                <Input
                  className="h-8 text-sm"
                  value={draft.name ?? ""}
                  onChange={(e) => meta.updateDraft("name", e.target.value || null)}
                  onBlur={blurSave}
                  onKeyDown={keyDownCancel}
                  placeholder="案件名"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="font-medium text-foreground">
                  {project.name || "（名前未設定）"}
                </span>
              )}
            </TableCell>
          );
        },
      },
      {
        id: "client",
        header: "クライアント",
        cell: ({ row, table }) => {
          const project = row.original;
          const meta = table.options.meta!;
          const draft = meta.editingCell?.projectId === project.id ? meta.editDraft : null;
          const clientName = (project.clients as { name?: string } | null)?.name ?? "—";
          const blurSave = () => meta.commitCell(project.id);
          const keyDownCancel = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") meta.cancelEdit();
          };
          return (
            <TableCell
              className={cn(
                "px-4 py-2",
                meta.canEdit &&
                  !meta.isEditingCell(project.id, "client_id") &&
                  "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => {
                if (meta.canEdit && !meta.isEditingCell(project.id, "client_id"))
                  meta.startEditCell(project, "client_id");
              }}
            >
              {meta.isEditingCell(project.id, "client_id") && draft ? (
                <select
                  className={selectClassName}
                  value={draft.client_id ?? ""}
                  onChange={(e) => meta.updateDraft("client_id", e.target.value)}
                  onBlur={blurSave}
                  onKeyDown={keyDownCancel}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                >
                  {meta.clientOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || "（名前未設定）"}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-muted-foreground">{clientName}</span>
              )}
            </TableCell>
          );
        },
      },
      {
        accessorKey: "status",
        header: "ステータス",
        cell: ({ row, table }) => {
          const project = row.original;
          const meta = table.options.meta!;
          const draft = meta.editingCell?.projectId === project.id ? meta.editDraft : null;
          const statusLabel = PROJECT_STATUS_LABELS[project.status as ProjectStatus] ?? project.status;
          const blurSave = () => meta.commitCell(project.id);
          const keyDownCancel = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") meta.cancelEdit();
          };
          return (
            <TableCell
              className={cn(
                "px-4 py-2",
                meta.canEdit &&
                  !meta.isEditingCell(project.id, "status") &&
                  "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => {
                if (meta.canEdit && !meta.isEditingCell(project.id, "status"))
                  meta.startEditCell(project, "status");
              }}
            >
              {meta.isEditingCell(project.id, "status") && draft ? (
                <select
                  className={selectClassName}
                  value={draft.status ?? ""}
                  onChange={(e) => meta.updateDraft("status", e.target.value as ProjectStatus)}
                  onBlur={blurSave}
                  onKeyDown={keyDownCancel}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
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
                    STATUS_BADGE_CLASSES[project.status as ProjectStatus] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {statusLabel}
                </span>
              )}
            </TableCell>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "優先度",
        cell: ({ row, table }) => {
          const project = row.original;
          const meta = table.options.meta!;
          const draft = meta.editingCell?.projectId === project.id ? meta.editDraft : null;
          const priorityLabel = PRIORITY_LABELS[project.priority as Priority] ?? project.priority;
          const blurSave = () => meta.commitCell(project.id);
          const keyDownCancel = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") meta.cancelEdit();
          };
          return (
            <TableCell
              className={cn(
                "px-4 py-2",
                meta.canEdit &&
                  !meta.isEditingCell(project.id, "priority") &&
                  "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => {
                if (meta.canEdit && !meta.isEditingCell(project.id, "priority"))
                  meta.startEditCell(project, "priority");
              }}
            >
              {meta.isEditingCell(project.id, "priority") && draft ? (
                <select
                  className={selectClassName}
                  value={draft.priority ?? ""}
                  onChange={(e) => meta.updateDraft("priority", e.target.value as Priority)}
                  onBlur={blurSave}
                  onKeyDown={keyDownCancel}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
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
                    PRIORITY_BADGE_CLASSES[project.priority as Priority] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {priorityLabel}
                </span>
              )}
            </TableCell>
          );
        },
      },
      {
        id: "amount",
        header: "金額",
        cell: ({ row, table }) => {
          const project = row.original;
          const meta = table.options.meta!;
          const draft = meta.editingCell?.projectId === project.id ? meta.editDraft : null;
          const blurSave = () => meta.commitCell(project.id);
          const keyDownCancel = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") meta.cancelEdit();
          };
          return (
            <TableCell
              className={cn(
                "px-4 py-2 tabular-nums",
                meta.canEdit &&
                  !meta.isEditingCell(project.id, "amount") &&
                  "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => {
                if (meta.canEdit && !meta.isEditingCell(project.id, "amount"))
                  meta.startEditCell(project, "amount");
              }}
            >
              {meta.isEditingCell(project.id, "amount") && draft ? (
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
                      meta.updateDraft("hourly_rate", v);
                    } else {
                      meta.updateDraft("amount", v);
                    }
                  }}
                  onBlur={blurSave}
                  onKeyDown={keyDownCancel}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                formatAmount(project)
              )}
            </TableCell>
          );
        },
      },
      {
        accessorKey: "start_date",
        header: "開始日",
        cell: ({ row, table }) => {
          const project = row.original;
          const meta = table.options.meta!;
          const draft = meta.editingCell?.projectId === project.id ? meta.editDraft : null;
          const blurSave = () => meta.commitCell(project.id);
          const keyDownCancel = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") meta.cancelEdit();
          };
          return (
            <TableCell
              className={cn(
                "px-4 py-2 text-muted-foreground",
                meta.canEdit &&
                  !meta.isEditingCell(project.id, "start_date") &&
                  "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => {
                if (meta.canEdit && !meta.isEditingCell(project.id, "start_date"))
                  meta.startEditCell(project, "start_date");
              }}
            >
              {meta.isEditingCell(project.id, "start_date") && draft ? (
                <Input
                  type="date"
                  className="h-8 w-36 text-sm"
                  value={draft.start_date ?? ""}
                  onChange={(e) => meta.updateDraft("start_date", e.target.value || null)}
                  onBlur={blurSave}
                  onKeyDown={keyDownCancel}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                formatDate(project.start_date)
              )}
            </TableCell>
          );
        },
      },
      {
        accessorKey: "end_date",
        header: "終了日",
        cell: ({ row, table }) => {
          const project = row.original;
          const meta = table.options.meta!;
          const draft = meta.editingCell?.projectId === project.id ? meta.editDraft : null;
          const blurSave = () => meta.commitCell(project.id);
          const keyDownCancel = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") meta.cancelEdit();
          };
          return (
            <TableCell
              className={cn(
                "px-4 py-2 text-muted-foreground",
                meta.canEdit &&
                  !meta.isEditingCell(project.id, "end_date") &&
                  "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => {
                if (meta.canEdit && !meta.isEditingCell(project.id, "end_date"))
                  meta.startEditCell(project, "end_date");
              }}
            >
              {meta.isEditingCell(project.id, "end_date") && draft ? (
                <Input
                  type="date"
                  className="h-8 w-36 text-sm"
                  value={draft.end_date ?? ""}
                  onChange={(e) => meta.updateDraft("end_date", e.target.value || null)}
                  onBlur={blurSave}
                  onKeyDown={keyDownCancel}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                formatDate(project.end_date)
              )}
            </TableCell>
          );
        },
      },
      {
        accessorKey: "progress",
        header: "進捗",
        cell: ({ row, table }) => {
          const project = row.original;
          const meta = table.options.meta!;
          const draft = meta.editingCell?.projectId === project.id ? meta.editDraft : null;
          const blurSave = () => meta.commitCell(project.id);
          const keyDownCancel = (e: React.KeyboardEvent) => {
            if (e.key === "Escape") meta.cancelEdit();
          };
          return (
            <TableCell
              className={cn(
                "px-4 py-2 tabular-nums",
                meta.canEdit &&
                  !meta.isEditingCell(project.id, "progress") &&
                  "cursor-pointer hover:bg-muted/20"
              )}
              onClick={() => {
                if (meta.canEdit && !meta.isEditingCell(project.id, "progress"))
                  meta.startEditCell(project, "progress");
              }}
            >
              {meta.isEditingCell(project.id, "progress") && draft ? (
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="h-8 w-16 text-sm tabular-nums"
                  value={draft.progress ?? 0}
                  onChange={(e) =>
                    meta.updateDraft("progress", Number(e.target.value) || 0)
                  }
                  onBlur={blurSave}
                  onKeyDown={keyDownCancel}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                `${project.progress}%`
              )}
            </TableCell>
          );
        },
      },
      ...(canEdit
        ? [
            {
              id: "actions",
              header: () => <span className="sr-only">操作</span>,
              cell: ({ row }: { row: { original: ProjectWithClient } }) => {
                const project = row.original;
                return (
                  <TableCell
                    className="w-10 px-2 py-2"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
                  </TableCell>
                );
              },
            } as ColumnDef<ProjectWithClient>,
          ]
        : []),
    ],
    [tableMeta]
  );

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: tableMeta,
  });

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="px-4 py-3">案件名</TableHead>
              <TableHead className="px-4 py-3">クライアント</TableHead>
              <TableHead className="px-4 py-3">ステータス</TableHead>
              <TableHead className="px-4 py-3">優先度</TableHead>
              <TableHead className="px-4 py-3">金額</TableHead>
              <TableHead className="px-4 py-3">開始日</TableHead>
              <TableHead className="px-4 py-3">終了日</TableHead>
              <TableHead className="px-4 py-3">進捗</TableHead>
              {canEdit && <TableHead className="w-24 px-2 py-3" aria-label="操作" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-8 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="h-5 w-12 animate-pulse rounded bg-muted" />
                </TableCell>
                {canEdit && <TableCell className="px-2 py-3" />}
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="px-4 py-3">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="group border-border/50 transition-colors"
            >
              {row.getVisibleCells().map((cell) =>
                flexRender(cell.column.columnDef.cell, cell.getContext())
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
