import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Briefcase } from "lucide-react";

interface KpiCardsProps {
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  unpaidTotal: number;
  averageProjectAmount: number;
}

export function KpiCards({
  currentMonthRevenue,
  lastMonthRevenue,
  unpaidTotal,
  averageProjectAmount,
}: KpiCardsProps) {
  const change =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            今月売上
          </span>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {currentMonthRevenue.toLocaleString()}円
          </p>
          <p className="text-xs text-muted-foreground">
            先月比 {change >= 0 ? "+" : ""}
            {change.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            先月売上
          </span>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {lastMonthRevenue.toLocaleString()}円
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            未入金合計
          </span>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {unpaidTotal.toLocaleString()}円
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            平均案件単価
          </span>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {averageProjectAmount.toLocaleString()}円
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
