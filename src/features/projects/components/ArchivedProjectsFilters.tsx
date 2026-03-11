import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types/database";
import { Search, X } from "lucide-react";

export interface ArchivedProjectsFilterState {
  search: string;
  clientId: string | null;
  archivedFrom: string | null;
  archivedTo: string | null;
}

interface ArchivedProjectsFiltersProps {
  clients: Client[];
  filters: ArchivedProjectsFilterState;
  setSearch: (value: string) => void;
  setClientId: (value: string | null) => void;
  setArchivedFrom: (value: string | null) => void;
  setArchivedTo: (value: string | null) => void;
  onReset: () => void;
}

export function ArchivedProjectsFilters({
  clients,
  filters,
  setSearch,
  setClientId,
  setArchivedFrom,
  setArchivedTo,
  onReset,
}: ArchivedProjectsFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.clientId ||
    filters.archivedFrom ||
    filters.archivedTo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="案件名・クライアントで検索..."
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <select
        value={filters.clientId ?? ""}
        onChange={(e) => setClientId(e.target.value || null)}
        className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[140px]"
      >
        <option value="">すべてのクライアント</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name || "（名前未設定）"}
          </option>
        ))}
      </select>
      <Input
        type="date"
        value={filters.archivedFrom ?? ""}
        onChange={(e) => setArchivedFrom(e.target.value || null)}
        className="w-[140px]"
        aria-label="アーカイブ日（開始）"
      />
      <Input
        type="date"
        value={filters.archivedTo ?? ""}
        onChange={(e) => setArchivedTo(e.target.value || null)}
        className="w-[140px]"
        aria-label="アーカイブ日（終了）"
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" />
          リセット
        </Button>
      )}
    </div>
  );
}
