import { useDroppable } from "@dnd-kit/core";
import type { ProjectWithClient } from "@/types/database";
import type { ProjectStatus } from "@/types/enums";
import { KanbanCard } from "./KanbanCard";
import { PROJECT_STATUS_LABELS } from "@/types/enums";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: ProjectStatus;
  projects: ProjectWithClient[];
  isOver?: boolean;
}

const columnColors: Record<ProjectStatus, string> = {
  not_started: "border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30",
  in_progress: "border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20",
  completed: "border-green-300 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20",
  payment_received: "border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-900/20",
};

export function KanbanColumn({
  status,
  projects,
  isOver,
}: KanbanColumnProps) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: status,
  });

  const label = PROJECT_STATUS_LABELS[status] ?? status;
  const isActive = isOver ?? isDroppableOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-w-[280px] max-w-[320px] max-h-[70vh] shrink-0 flex-col rounded-lg border-2 p-3 transition-colors",
        columnColors[status],
        isActive && "ring-2 ring-primary/50"
      )}
    >
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-sm text-muted-foreground">
          {projects.length}
        </span>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {projects.map((project) => (
          <li key={project.id}>
            <KanbanCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
