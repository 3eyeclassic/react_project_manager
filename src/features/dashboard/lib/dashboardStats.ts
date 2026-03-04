import type { ProjectWithClient } from "@/types/database";
import type { Invoice, InvoiceItem } from "@/types/database";
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
  invoices: Invoice[],
  items: InvoiceItem[]
): number {
  const projectItems = items.filter((i) => i.project_id === p.id);
  let sum = 0;
  for (const it of projectItems) {
    const inv = invoices.find((i) => i.id === it.invoice_id);
    if (inv?.status === "paid") sum += it.amount ?? 0;
  }
  return sum;
}

/** 売上: payment_date ベース（請求明細の合計） */
export function computeRevenueInRange(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  items: InvoiceItem[],
  range: DateRange
): number {
  let total = 0;
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    total += getAmountForProject(p, invoices, items);
  }
  return total;
}

function getUnpaidAmount(
  p: ProjectWithClient,
  invoices: Invoice[],
  items: InvoiceItem[]
): number {
  const projectItems = items.filter((i) => i.project_id === p.id);
  let sum = 0;
  for (const it of projectItems) {
    const inv = invoices.find((i) => i.id === it.invoice_id);
    if (inv && inv.status !== "paid") sum += it.amount ?? 0;
  }
  return sum;
}

/** 未入金合計（請求済みで未入金の金額） */
export function computeUnpaidTotal(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  items: InvoiceItem[]
): number {
  let total = 0;
  for (const p of projects) {
    if (p.status === "payment_received") continue;
    total += getUnpaidAmount(p, invoices, items);
  }
  return total;
}

/** 月別売上（payment_date ベース） */
export function monthlyRevenueSeries(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  items: InvoiceItem[],
  range: DateRange
): { month: string; revenue: number }[] {
  const map = new Map<string, number>();
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    const key = format(d, "yyyy-MM", { locale: ja });
    map.set(key, (map.get(key) ?? 0) + getAmountForProject(p, invoices, items));
  }
  return Array.from(map.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** クライアント別売上（範囲内、入金済み） */
export function clientRevenueSeries(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  items: InvoiceItem[],
  range: DateRange
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    const name =
      (p.clients as { name?: string } | null)?.name ?? "（未設定）";
    map.set(name, (map.get(name) ?? 0) + getAmountForProject(p, invoices, items));
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

/** カテゴリ別売上 */
export function categoryRevenueSeries(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  items: InvoiceItem[],
  range: DateRange
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    const name = p.category ?? "その他";
    map.set(name, (map.get(name) ?? 0) + getAmountForProject(p, invoices, items));
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

/** 料金体系別（一式 vs 時間単価） */
export function billingTypeRevenue(
  projects: ProjectWithClient[],
  invoices: Invoice[],
  items: InvoiceItem[],
  range: DateRange
): { fixed: number; hourly: number } {
  let fixed = 0;
  let hourly = 0;
  for (const p of projects) {
    if (p.status !== "payment_received" || !p.payment_date) continue;
    const d = parseISO(p.payment_date);
    if (!isWithinInterval(d, range)) continue;
    const amt = getAmountForProject(p, invoices, items);
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
