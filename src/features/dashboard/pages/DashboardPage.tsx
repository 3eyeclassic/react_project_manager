import { useState, useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProjects } from "@/hooks/useProjects";
import { useInvoices } from "@/hooks/useInvoices";
import { useWorkLogs } from "@/hooks/useWorkLogs";
import { PeriodFilter } from "../components/PeriodFilter";
import { KpiCards } from "../components/KpiCards";
import { MonthlyRevenueChart } from "../components/MonthlyRevenueChart";
import { ClientRevenueChart } from "../components/ClientRevenueChart";
import { CategoryChart } from "../components/CategoryChart";
import { MonthlyHoursChart } from "../components/MonthlyHoursChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getRangeForPeriod,
  computeRevenueInRange,
  computeUnpaidTotal,
  monthlyRevenueSeries,
  clientRevenueSeries,
  categoryRevenueSeries,
  monthlyHoursSeries,
  type PeriodType,
} from "../lib/dashboardStats";
import { subMonths, format } from "date-fns";

export function DashboardPage() {
  const user = useCurrentUser();
  const { data: projects = [], isLoading: projectsLoading } = useProjects(user?.id);
  const { data: invoices = [] } = useInvoices(user?.id);
  const today = useMemo(() => new Date(), []);
  const [period, setPeriod] = useState<PeriodType>("month");
  const [customStart, setCustomStart] = useState(
    format(subMonths(today, 1), "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(format(today, "yyyy-MM-dd"));

  const range = useMemo(
    () => getRangeForPeriod(period, today, customStart, customEnd),
    [period, today, customStart, customEnd]
  );
  const lastMonthRange = useMemo(() => {
    const ref = subMonths(today, 1);
    return getRangeForPeriod("month", ref);
  }, [today]);

  const currentMonthRange = useMemo(
    () => getRangeForPeriod("month", today),
    [today]
  );

  const currentMonthRevenue = useMemo(
    () => computeRevenueInRange(projects, invoices, currentMonthRange),
    [projects, invoices, currentMonthRange]
  );
  const lastMonthRevenue = useMemo(
    () => computeRevenueInRange(projects, invoices, lastMonthRange),
    [projects, invoices, lastMonthRange]
  );
  const unpaidTotal = useMemo(
    () => computeUnpaidTotal(projects, invoices),
    [projects, invoices]
  );
  const revenueInRange = useMemo(
    () => computeRevenueInRange(projects, invoices, range),
    [projects, invoices, range]
  );
  const paidCountInRange = useMemo(() => {
    let count = 0;
    for (const p of projects) {
      if (p.status !== "payment_received" || !p.payment_date) continue;
      const d = new Date(p.payment_date);
      if (d >= range.start && d <= range.end) count++;
    }
    return count;
  }, [projects, range]);
  const averageProjectAmount =
    paidCountInRange > 0 ? Math.round(revenueInRange / paidCountInRange) : 0;

  const monthlyRevenue = useMemo(
    () => monthlyRevenueSeries(projects, invoices, range),
    [projects, invoices, range]
  );
  const clientRevenue = useMemo(
    () => clientRevenueSeries(projects, invoices, range),
    [projects, invoices, range]
  );
  const categoryRevenue = useMemo(
    () => categoryRevenueSeries(projects, invoices, range),
    [projects, invoices, range]
  );
  const { data: workLogs = [] } = useWorkLogs(user?.id, {
    startDate: range.start.toISOString(),
    endDate: range.end.toISOString(),
  });
  const monthlyHours = useMemo(
    () => monthlyHoursSeries(workLogs, range),
    [workLogs, range]
  );

  if (projectsLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">売上ダッシュボード</h1>
        <p className="text-muted-foreground">
          売上・稼働の推移と内訳
        </p>
      </div>

      <PeriodFilter
        period={period}
        onPeriodChange={setPeriod}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <KpiCards
        currentMonthRevenue={currentMonthRevenue}
        lastMonthRevenue={lastMonthRevenue}
        unpaidTotal={unpaidTotal}
        averageProjectAmount={averageProjectAmount}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>月別売上推移</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyRevenueChart data={monthlyRevenue} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>クライアント別売上</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientRevenueChart data={clientRevenue} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>カテゴリ別売上</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryRevenue.length > 0 ? (
            <CategoryChart data={categoryRevenue} />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              データがありません
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>月別稼働時間</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyHours.length > 0 ? (
            <MonthlyHoursChart data={monthlyHours} />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              データがありません
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
