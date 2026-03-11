import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/stores/kanbanStore";
import type { Client } from "@/types/database";
import { Search, X } from "lucide-react";

interface TableFiltersProps {
  clients: Client[];
}

export function TableFilters({ clients }: TableFiltersProps) {
  const {
    filters,
    setSearch,
    setClientId,
    setDateRange,
    resetFilters,
  } = useKanbanStore();

  const hasActiveFilters =
    filters.search ||
    filters.clientId ||
    filters.startDate ||
    filters.endDate;

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
        value={filters.startDate ?? ""}
        onChange={(e) => setDateRange(e.target.value || null, filters.endDate)}
        className="w-[140px]"
      />
      <Input
        type="date"
        value={filters.endDate ?? ""}
        onChange={(e) =>
          setDateRange(filters.startDate, e.target.value || null)
        }
        className="w-[140px]"
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="mr-1 h-4 w-4" />
          リセット
        </Button>
      )}
    </div>
  );
}
