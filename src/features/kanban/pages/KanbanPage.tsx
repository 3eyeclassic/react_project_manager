import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProjects, useUpdateProjectStatus } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useKanbanStore } from "@/stores/kanbanStore";
import { KanbanColumn } from "../components/KanbanColumn";
import { KanbanCard } from "../components/KanbanCard";
import { KanbanFilters } from "../components/KanbanFilters";
import { ProjectsTable } from "../components/ProjectsTable";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUS } from "@/types/enums";
import type { ProjectWithClient } from "@/types/database";
import { LayoutGrid, List, Plus } from "lucide-react";

const COLUMN_STATUSES = [
  PROJECT_STATUS.NOT_STARTED,
  PROJECT_STATUS.IN_PROGRESS,
  PROJECT_STATUS.COMPLETED,
  PROJECT_STATUS.PAYMENT_RECEIVED,
] as const;

export function KanbanPage() {
  const user = useCurrentUser();
  const { data: projects = [], isLoading, error } = useProjects(user?.id);
  const { data: clients = [] } = useClients(user?.id);
  const { filters } = useKanbanStore();
  const updateStatus = useUpdateProjectStatus(user?.id);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [activeProject, setActiveProject] = useState<ProjectWithClient | null>(
    null
  );

  const filteredProjects = useMemo(() => {
    let list = projects;
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter((p) => {
        const name = (p.name ?? "").toLowerCase();
        const clientName = (
          (p.clients as { name?: string } | null)?.name ?? ""
        ).toLowerCase();
        return name.includes(q) || clientName.includes(q);
      });
    }
    if (filters.clientId) {
      list = list.filter((p) => p.client_id === filters.clientId);
    }
    if (filters.startDate || filters.endDate) {
      list = list.filter((p) => {
        const start = p.start_date;
        const end = p.end_date;
        if (filters.startDate && end && end < filters.startDate) return false;
        if (filters.endDate && start && start > filters.endDate) return false;
        return true;
      });
    }
    return list;
  }, [projects, filters]);

  const projectsByStatus = useMemo(() => {
    const map: Record<string, ProjectWithClient[]> = {
      [PROJECT_STATUS.NOT_STARTED]: [],
      [PROJECT_STATUS.IN_PROGRESS]: [],
      [PROJECT_STATUS.COMPLETED]: [],
      [PROJECT_STATUS.PAYMENT_RECEIVED]: [],
    };
    for (const p of filteredProjects) {
      const status = p.status as keyof typeof map;
      if (map[status]) map[status].push(p);
    }
    return map;
  }, [filteredProjects]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const project = projects.find((p) => p.id === event.active.id);
    if (project) setActiveProject(project as ProjectWithClient);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveProject(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const newStatus = over.id as string;
    if (!COLUMN_STATUSES.includes(newStatus as (typeof COLUMN_STATUSES)[number]))
      return;
    const projectId = active.id as string;
    updateStatus.mutate({ id: projectId, status: newStatus as (typeof COLUMN_STATUSES)[number] });
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">案件一覧</h1>
          <p className="text-muted-foreground">
            {viewMode === "kanban"
              ? "案件をドラッグしてステータスを更新"
              : "案件を一覧で確認"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-input p-0.5">
            <Button
              type="button"
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
              カンバン
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
              テーブル
            </Button>
          </div>
          <Button asChild size="sm">
            <Link to="/projects/new">
              <Plus className="mr-1.5 h-4 w-4" />
              案件を追加
            </Link>
          </Button>
        </div>
      </div>

      <KanbanFilters clients={clients} />

      {viewMode === "table" ? (
        <ProjectsTable
          projects={filteredProjects}
          isLoading={isLoading}
          userId={user?.id}
          clientOptions={clients.map((c) => ({ id: c.id, name: c.name }))}
        />
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[70vh] min-w-[280px] max-w-[320px] shrink-0 rounded-lg border-2 border-muted bg-muted/30 p-3"
              >
                <div className="mb-2 h-6 w-24 animate-pulse rounded bg-muted" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-32 animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 min-h-[70vh]">
              {COLUMN_STATUSES.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  projects={projectsByStatus[status] ?? []}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeProject ? (
              <div className="min-w-[280px] max-w-[320px]">
                <KanbanCard project={activeProject} overlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
