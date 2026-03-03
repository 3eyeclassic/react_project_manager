import type { ProjectWithClient } from "@/types/database";
import type { Invoice } from "@/types/database";
import type { WorkLog } from "@/types/database";
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  parseISO,
  isWithinInterval,
  format,
} from "date-fns";
import { ja } from "date-fns/locale";

export type PeriodType = "month" | "quarter" | "year" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export function getRangeForPeriod(
  period: PeriodType,
  refDate: Date,
  customStart?: string,
  customEnd?: string
): DateRange {
  if (period === "custom" && customStart && customEnd) {
    return {
      start: parseISO(customStart),
      end: parseISO(customEnd),
    };
  }
  if (period === "month") {
    return {
      start: startOfMonth(refDate),
      end: endOfMonth(refDate),
    };
  }
  if (period === "quarter") {
    return {
      start: startOfQuarter(refDate),
      end: endOfQuarter(refDate),
    };
  }
  return {
    start: startOfYear(refDate),
    end: endOfYear(refDate),
  };
}

function getAmountForProject(
  p: ProjectWithClient,
  invoices: Invoice[]
): number {
  if (p.billing_type === "fixed" && p.amount != null) return p.amount;
  if (p.billing_type === "hourly") {
    const inv = invoices.find(
      (i) => i.project_id === p.id && i.status === "paid"
    );
    return inv?.amount ?? 0;
  }
  return 0;
}

/** 売上: payment_date ベース */
export function computeRevenueInRange(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  range: DateRange
): number {
  let total = 0;
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    total += getAmountForProject(p, invoices);
  }
  return total;
}

function getUnpaidAmount(p: ProjectWithClient, invoices: Invoice[]): number {
  if (p.billing_type === "fixed" && p.amount != null) return p.amount;
  if (p.billing_type === "hourly") {
    const inv = invoices.find((i) => i.project_id === p.id);
    return inv?.amount ?? 0;
  }
  return 0;
}

/** 未入金合計（完了・請求済みで未入金の金額） */
export function computeUnpaidTotal(
  projects: ProjectWithClient[],
  invoices: Invoice[]
): number {
  let total = 0;
  for (const p of projects) {
    if (p.status === "payment_received") continue;
    total += getUnpaidAmount(p, invoices);
  }
  return total;
}

/** 月別売上（payment_date ベース） */
export function monthlyRevenueSeries(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  range: DateRange
): { month: string; revenue: number }[] {
  const map = new Map<string, number>();
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    const key = format(d, "yyyy-MM", { locale: ja });
    map.set(key, (map.get(key) ?? 0) + getAmountForProject(p, invoices));
  }
  return Array.from(map.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** クライアント別売上（範囲内、入金済み） */
export function clientRevenueSeries(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  range: DateRange
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    const name =
      (p.clients as { name?: string } | null)?.name ?? "（未設定）";
    map.set(name, (map.get(name) ?? 0) + getAmountForProject(p, invoices));
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

/** カテゴリ別売上 */
export function categoryRevenueSeries(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  range: DateRange
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    const name = p.category ?? "その他";
    map.set(name, (map.get(name) ?? 0) + getAmountForProject(p, invoices));
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

/** 料金体系別（一式 vs 時間単価） */
export function billingTypeRevenue(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  range: DateRange
): { fixed: number; hourly: number } {
  let fixed = 0;
  let hourly = 0;
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    const amt = getAmountForProject(p, invoices);
    if (p.billing_type === "fixed") fixed += amt;
    else hourly += amt;
  }
  return { fixed, hourly };
}

/** 月別稼働時間（work_logs） */
export function monthlyHoursSeries(
  workLogs: WorkLog[],
  range: DateRange
): { month: string; hours: number }[] {
  const map = new Map<string, number>();
  for (const log of workLogs) {
    const d = parseISO(log.started_at);
    if (!isWithinInterval(d, range)) continue;
    const key = format(d, "yyyy-MM", { locale: ja });
    const hours = (log.duration ?? 0) / 3600;
    map.set(key, (map.get(key) ?? 0) + hours);
  }
  return Array.from(map.entries())
    .map(([month, hours]) => ({ month, hours }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
