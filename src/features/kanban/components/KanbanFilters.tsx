import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/stores/kanbanStore";
import type { CardDisplayField } from "@/stores/kanbanStore";
import type { Client } from "@/types/database";
import { Search, X } from "lucide-react";

interface KanbanFiltersProps {
  clients: Client[];
}

const CARD_DISPLAY_OPTIONS: { field: CardDisplayField; label: string }[] = [
  { field: "name", label: "案件名" },
  { field: "clientName", label: "クライアント名" },
  { field: "timer", label: "タイマー" },
  { field: "priority", label: "優先度" },
  { field: "progress", label: "進捗" },
  { field: "amount", label: "金額" },
];

export function KanbanFilters({ clients }: KanbanFiltersProps) {
  const {
    filters,
    cardDisplay,
    setSearch,
    setClientId,
    setDateRange,
    setCardDisplay,
    resetFilters,
    resetCardDisplay,
  } = useKanbanStore();

  const hasActiveFilters =
    filters.search ||
    filters.clientId ||
    filters.startDate ||
    filters.endDate;

  const isDefaultCardDisplay =
    cardDisplay.name &&
    cardDisplay.clientName &&
    cardDisplay.timer &&
    !cardDisplay.priority &&
    !cardDisplay.progress &&
    !cardDisplay.amount;

  return (
    <div className="space-y-2">
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
      <details className="group">
        <summary className="cursor-pointer list-none text-sm text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
          表示項目 ▼
        </summary>
        <div className="mt-2 flex flex-wrap items-center gap-4 rounded-md border border-border bg-muted/30 px-3 py-2">
          {CARD_DISPLAY_OPTIONS.map(({ field, label }) => (
            <label
              key={field}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={cardDisplay[field]}
                onChange={(e) => setCardDisplay(field, e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              {label}
            </label>
          ))}
          {!isDefaultCardDisplay && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={resetCardDisplay}
            >
              表示をデフォルトに戻す
            </Button>
          )}
        </div>
      </details>
    </div>
  );
}
