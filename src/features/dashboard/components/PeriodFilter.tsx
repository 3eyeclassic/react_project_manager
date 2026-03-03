import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PeriodType } from "../lib/dashboardStats";
interface PeriodFilterProps {
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
}

export function PeriodFilter({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {(["month", "quarter", "year"] as const).map((p) => (
        <Button
          key={p}
          variant={period === p ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(p)}
        >
          {p === "month" ? "月" : p === "quarter" ? "四半期" : "年"}
        </Button>
      ))}
      <Button
        variant={period === "custom" ? "default" : "outline"}
        size="sm"
        onClick={() => onPeriodChange("custom")}
      >
        カスタム
      </Button>
      {period === "custom" && (
        <>
          <Input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="w-[140px]"
          />
          <span className="text-muted-foreground">〜</span>
          <Input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="w-[140px]"
          />
        </>
      )}
    </div>
  );
}
