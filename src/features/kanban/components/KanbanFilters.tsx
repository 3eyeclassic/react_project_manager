import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/stores/kanbanStore";
import type { CardDisplayField } from "@/stores/kanbanStore";

const CARD_DISPLAY_OPTIONS: { field: CardDisplayField; label: string }[] = [
  { field: "name", label: "案件名" },
  { field: "clientName", label: "クライアント名" },
  { field: "timer", label: "タイマー" },
  { field: "priority", label: "優先度" },
  { field: "progress", label: "進捗" },
  { field: "amount", label: "金額" },
];

export function KanbanFilters() {
  const { cardDisplay, setCardDisplay, resetCardDisplay } = useKanbanStore();

  const isDefaultCardDisplay =
    cardDisplay.name &&
    cardDisplay.clientName &&
    cardDisplay.timer &&
    !cardDisplay.priority &&
    !cardDisplay.progress &&
    !cardDisplay.amount;

  return (
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
  );
}
