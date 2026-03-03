import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInvoices } from "@/hooks/useInvoices";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INVOICE_STATUS_LABELS } from "@/types/enums";
import type { InvoiceStatus } from "@/types/enums";
import { FileText, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function formatYMD(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}

export function InvoicesPage() {
  const user = useCurrentUser();
  const { data: invoices = [], isLoading, error } = useInvoices(user?.id);
  const { data: projects = [] } = useProjects(user?.id);
  const [search, setSearch] = useState("");

  const projectMap = useMemo(() => {
    const m = new Map(projects.map((p) => [p.id, p]));
    return m;
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const project = projectMap.get(inv.project_id);
      const name = (project?.name ?? "").toLowerCase();
      const statusLabel = (INVOICE_STATUS_LABELS[inv.status as InvoiceStatus] ?? "").toLowerCase();
      const amountStr = (inv.amount ?? "").toString();
      return (
        name.includes(q) ||
        statusLabel.includes(q) ||
        amountStr.includes(q)
      );
    });
  }, [invoices, projectMap, search]);

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
          <h1 className="text-2xl font-bold tracking-tight">請求一覧</h1>
          <p className="text-muted-foreground">請求書の一覧と管理</p>
        </div>
        <Button asChild>
          <Link to="/invoice/new">
            <Plus className="mr-2 h-4 w-4" />
            新規請求
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="案件名・ステータス・金額で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg border bg-muted/50"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {invoices.length === 0
                ? "まだ請求がありません"
                : "検索に一致する請求がありません"}
            </p>
            {invoices.length === 0 && (
              <Button className="mt-4" asChild>
                <Link to="/invoice/new">
                  <Plus className="mr-2 h-4 w-4" />
                  最初の請求を作成
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((invoice) => {
            const project = projectMap.get(invoice.project_id);
            return (
              <Link key={invoice.id} to={`/projects/${invoice.project_id}`}>
                <Card
                  className={cn(
                    "transition-colors hover:bg-accent/50",
                    "cursor-pointer"
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {project?.name ?? "（案件不明）"}
                    </CardTitle>
                    <CardDescription>
                      {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus] ?? invoice.status}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>{formatAmount(invoice.amount)}</span>
                      <span>発行: {formatYMD(invoice.issued_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
