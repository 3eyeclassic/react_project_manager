import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useArchivedProjects, useUnarchiveProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { ArchivedProjectsFilters } from "../components/ArchivedProjectsFilters";
import type { ArchivedProjectsFilterState } from "../components/ArchivedProjectsFilters";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Archive, ArchiveRestore, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { ProjectWithClient } from "@/types/database";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "yyyy/MM/dd", { locale: ja });
  } catch {
    return value;
  }
}

type SortKey = "name" | "client" | "payment_date" | "archived_at";
type SortDir = "asc" | "desc";

function compareArchived(
  a: ProjectWithClient,
  b: ProjectWithClient,
  key: SortKey,
  dir: SortDir
): number {
  const mult = dir === "asc" ? 1 : -1;
  switch (key) {
    case "name": {
      const va = (a.name ?? "").localeCompare(b.name ?? "", "ja");
      return mult * va;
    }
    case "client": {
      const va = ((a.clients as { name?: string } | null)?.name ?? "").localeCompare(
        (b.clients as { name?: string } | null)?.name ?? "",
        "ja"
      );
      return mult * va;
    }
    case "payment_date": {
      const ta = a.payment_date ? new Date(a.payment_date).getTime() : 0;
      const tb = b.payment_date ? new Date(b.payment_date).getTime() : 0;
      return mult * (ta - tb);
    }
    case "archived_at": {
      const ta = a.archived_at ? new Date(a.archived_at).getTime() : 0;
      const tb = b.archived_at ? new Date(b.archived_at).getTime() : 0;
      return mult * (ta - tb);
    }
    default:
      return 0;
  }
}

function SortableHeader({
  sortKey,
  sortDir,
  currentKey,
  label,
  onSort,
}: {
  sortKey: SortKey | null;
  sortDir: SortDir;
  currentKey: SortKey;
  label: string;
  onSort: () => void;
}) {
  const isActive = sortKey === currentKey;
  const sorted = isActive ? sortDir : false;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1 -mx-1"
      onClick={onSort}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort();
        }
      }}
      aria-sort={
        sorted === "asc"
          ? "ascending"
          : sorted === "desc"
            ? "descending"
            : undefined
      }
      title="クリックでソート"
    >
      {label}
      <span className="inline-flex text-muted-foreground">
        {sorted === false ? (
          <ArrowUpDown className="h-4 w-4" aria-hidden />
        ) : sorted === "asc" ? (
          <ArrowUp className="h-4 w-4" aria-hidden />
        ) : (
          <ArrowDown className="h-4 w-4" aria-hidden />
        )}
      </span>
    </button>
  );
}

const defaultFilters: ArchivedProjectsFilterState = {
  search: "",
  clientId: null,
  archivedFrom: null,
  archivedTo: null,
};

export function ArchivedProjectsPage() {
  const user = useCurrentUser();
  const { data: projects = [], isLoading, error } = useArchivedProjects(user?.id);
  const { data: clients = [] } = useClients(user?.id);
  const unarchiveProject = useUnarchiveProject(user?.id);
  const [sortKey, setSortKey] = useState<SortKey | null>("archived_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filters, setFilters] = useState<ArchivedProjectsFilterState>(defaultFilters);

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
    if (filters.archivedFrom || filters.archivedTo) {
      list = list.filter((p) => {
        const at = p.archived_at;
        if (!at) return false;
        const t = new Date(at).getTime();
        if (filters.archivedFrom) {
          const from = new Date(filters.archivedFrom).setHours(0, 0, 0, 0);
          if (t < from) return false;
        }
        if (filters.archivedTo) {
          const to = new Date(filters.archivedTo).setHours(23, 59, 59, 999);
          if (t > to) return false;
        }
        return true;
      });
    }
    return list;
  }, [projects, filters]);

  const sortedProjects = useMemo(() => {
    if (!sortKey) return filteredProjects;
    return [...filteredProjects].sort((a, b) =>
      compareArchived(a, b, sortKey, sortDir)
    );
  }, [filteredProjects, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function resetFilters() {
    setFilters(defaultFilters);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            アーカイブ済み案件
          </h1>
          <p className="text-muted-foreground">
            カンバン・テーブルから非表示にした案件です。解除すると再表示されます。
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">カンバンに戻る</Link>
        </Button>
      </div>

      {!isLoading && projects.length > 0 && (
        <ArchivedProjectsFilters
          clients={clients}
          filters={filters}
          setSearch={(value) => setFilters((f) => ({ ...f, search: value }))}
          setClientId={(value) => setFilters((f) => ({ ...f, clientId: value }))}
          setArchivedFrom={(value) =>
            setFilters((f) => ({ ...f, archivedFrom: value }))
          }
          setArchivedTo={(value) =>
            setFilters((f) => ({ ...f, archivedTo: value }))
          }
          onReset={resetFilters}
        />
      )}

      {isLoading ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-4 py-3">案件名</TableHead>
                <TableHead className="px-4 py-3">クライアント</TableHead>
                <TableHead className="px-4 py-3">入金日</TableHead>
                <TableHead className="px-4 py-3">アーカイブ日</TableHead>
                <TableHead className="w-24 px-2 py-3" aria-label="操作" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell className="px-4 py-3">
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                  </TableCell>
                  <TableCell className="px-2 py-3" />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16">
          <Archive className="h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            アーカイブ済みの案件はありません
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/">カンバンに戻る</Link>
          </Button>
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="rounded-md border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">
            条件に一致するアーカイブ済み案件はありません
          </p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={resetFilters}>
            フィルターをリセット
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="px-4 py-3">
                  <SortableHeader
                    sortKey={sortKey}
                    sortDir={sortDir}
                    currentKey="name"
                    label="案件名"
                    onSort={() => handleSort("name")}
                  />
                </TableHead>
                <TableHead className="px-4 py-3">
                  <SortableHeader
                    sortKey={sortKey}
                    sortDir={sortDir}
                    currentKey="client"
                    label="クライアント"
                    onSort={() => handleSort("client")}
                  />
                </TableHead>
                <TableHead className="px-4 py-3">
                  <SortableHeader
                    sortKey={sortKey}
                    sortDir={sortDir}
                    currentKey="payment_date"
                    label="入金日"
                    onSort={() => handleSort("payment_date")}
                  />
                </TableHead>
                <TableHead className="px-4 py-3">
                  <SortableHeader
                    sortKey={sortKey}
                    sortDir={sortDir}
                    currentKey="archived_at"
                    label="アーカイブ日"
                    onSort={() => handleSort("archived_at")}
                  />
                </TableHead>
                <TableHead className="w-32 px-2 py-3" aria-label="操作" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="group border-border/50 transition-colors"
                >
                  <TableCell className="px-4 py-2 font-medium">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-primary hover:underline"
                    >
                      {project.name || "（無題）"}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-muted-foreground">
                    {(project.clients as { name?: string } | null)?.name ?? "—"}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-muted-foreground">
                    {formatDate(project.payment_date)}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-muted-foreground">
                    {formatDate(project.archived_at)}
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          to={`/projects/${project.id}`}
                          className="h-8 w-8"
                          title="詳細"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => unarchiveProject.mutate(project.id)}
                        disabled={unarchiveProject.isPending}
                        title="アーカイブ解除"
                      >
                        <ArchiveRestore className="h-4 w-4" />
                        解除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
