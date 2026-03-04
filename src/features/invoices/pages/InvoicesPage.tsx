import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { INVOICE_STATUS_LABELS } from "@/types/enums";
import type { InvoiceStatus } from "@/types/enums";
import { FileText, Plus, Search, Trash2 } from "lucide-react";
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
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data: invoices = [], isLoading, error } = useInvoices(user?.id);
  const { data: clients = [] } = useClients(user?.id);
  const deleteInvoice = useDeleteInvoice(user?.id);
  const [search, setSearch] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function handleDeleteClick(e: React.MouseEvent, invoiceId: string) {
    e.stopPropagation();
    setDeleteTargetId(invoiceId);
  }

  function handleConfirmDelete() {
    if (deleteTargetId) deleteInvoice.mutate(deleteTargetId);
    setDeleteTargetId(null);
  }

  const clientMap = useMemo(() => {
    const m = new Map(clients.map((c) => [c.id, c]));
    return m;
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const client = clientMap.get(inv.client_id);
      const name = (client?.name ?? client?.company_name ?? "").toLowerCase();
      const statusLabel = (INVOICE_STATUS_LABELS[inv.status as InvoiceStatus] ?? "").toLowerCase();
      const amountStr = (inv.amount ?? "").toString();
      return (
        name.includes(q) ||
        statusLabel.includes(q) ||
        amountStr.includes(q)
      );
    });
  }, [invoices, clientMap, search]);

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="請求書を削除"
        description="この請求書を削除しますか？この操作は取り消せません。"
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteInvoice.isPending}
      />
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
          placeholder="クライアント名・ステータス・金額で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">発行日</th>
                <th className="px-4 py-3 text-left font-medium">クライアント</th>
                <th className="px-4 py-3 text-right font-medium">金額</th>
                <th className="px-4 py-3 text-left font-medium">ステータス</th>
                <th className="w-12 px-2 py-3" aria-label="操作" />
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="px-4 py-3">
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-5 w-20 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                  </td>
                  <td className="px-2 py-3" />
                </tr>
              ))}
            </tbody>
          </table>
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
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">発行日</th>
                <th className="px-4 py-3 text-left font-medium">クライアント</th>
                <th className="px-4 py-3 text-right font-medium">金額</th>
                <th className="px-4 py-3 text-left font-medium">ステータス</th>
                <th className="w-12 px-2 py-3" aria-label="操作" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => {
                const client = clientMap.get(invoice.client_id);
                const clientName = client?.name ?? client?.company_name ?? "（クライアント不明）";
                const statusLabel = INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus] ?? invoice.status;
                return (
                  <tr
                    key={invoice.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/invoices/${invoice.id}`);
                      }
                    }}
                    className={cn(
                      "cursor-pointer border-b border-border/50 transition-colors",
                      "hover:bg-accent/50 focus:bg-accent/50 focus:outline-none"
                    )}
                  >
                    <td className="px-4 py-3">{formatYMD(invoice.issued_at)}</td>
                    <td className="px-4 py-3">{clientName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatAmount(invoice.amount)}
                    </td>
                    <td className="px-4 py-3">{statusLabel}</td>
                    <td className="w-12 px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => handleDeleteClick(e, invoice.id)}
                        disabled={deleteInvoice.isPending}
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
