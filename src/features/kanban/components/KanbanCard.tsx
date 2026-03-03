import { Link } from "react-router-dom";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectWithClient } from "@/types/database";
import { PRIORITY_LABELS } from "@/types/enums";
import { useKanbanStore } from "@/stores/kanbanStore";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  project: ProjectWithClient;
  /** DragOverlay 用: ドラッグハンドルを付けない */
  overlay?: boolean;
}

const priorityColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-700 dark:text-red-400",
  medium: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  low: "bg-slate-500/20 text-slate-600 dark:text-slate-400",
};

export function KanbanCard({ project, overlay = false }: KanbanCardProps) {
  const { cardDisplay } = useKanbanStore();
  const draggable = useDraggable({
    id: project.id,
    data: { project },
  });
  const { attributes, listeners, setNodeRef, isDragging } = overlay
    ? { attributes: {}, listeners: {}, setNodeRef: () => {}, isDragging: false }
    : draggable;
  const clientName =
    (project.clients as { name?: string } | null)?.name ?? "—";
  const amountLabel =
    project.billing_type === "fixed"
      ? project.amount != null
        ? `${project.amount.toLocaleString()}円`
        : "—"
      : project.hourly_rate != null
        ? `${project.hourly_rate.toLocaleString()}円/h`
        : "—";

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow",
        isDragging && "opacity-90 shadow-lg ring-2 ring-primary"
      )}
    >
      {(cardDisplay.name || cardDisplay.clientName) && (
        <CardHeader className="p-3 pb-1">
          {cardDisplay.name && (
            <Link
              to={`/projects/${project.id}`}
              className="font-medium leading-tight hover:underline line-clamp-2 block min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              {project.name || "（無題）"}
            </Link>
          )}
          {cardDisplay.clientName && (
            <p className="text-xs text-muted-foreground truncate">
              {clientName}
            </p>
          )}
        </CardHeader>
      )}
      {(cardDisplay.priority ||
        cardDisplay.progress ||
        cardDisplay.amount ||
        cardDisplay.timer) && (
        <CardContent className="p-3 pt-0 space-y-2">
          {cardDisplay.priority && (
            <span
              className={cn(
                "inline-block rounded px-1.5 py-0.5 text-xs font-medium",
                priorityColors[project.priority] ?? priorityColors.medium
              )}
            >
              {PRIORITY_LABELS[project.priority]}
            </span>
          )}
          {(cardDisplay.progress || cardDisplay.amount) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {cardDisplay.progress && (
                <span className="text-muted-foreground">
                  進捗 {project.progress}%
                </span>
              )}
              {cardDisplay.amount && (
                <span className="text-muted-foreground">{amountLabel}</span>
              )}
            </div>
          )}
          {cardDisplay.timer && (
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={(e) => e.stopPropagation()}
              title="タイマー"
            >
              <Timer className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
