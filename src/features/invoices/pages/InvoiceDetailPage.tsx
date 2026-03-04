import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInvoiceWithItems, useDeleteInvoice } from "@/hooks/useInvoices";
import { useClient } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { INVOICE_STATUS_LABELS } from "@/types/enums";
import type { InvoiceStatus } from "@/types/enums";
import { ArrowLeft, Trash2 } from "lucide-react";

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

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data, isLoading, error } = useInvoiceWithItems(id, user?.id);
  const deleteInvoice = useDeleteInvoice(user?.id);
  const { data: client } = useClient(
    data?.invoice.client_id,
    user?.id
  );
  const { data: projects = [] } = useProjects(user?.id);

  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleConfirmDelete() {
    if (!id) return;
    deleteInvoice.mutate(id, {
      onSuccess: () => navigate("/invoices"),
    });
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error.message}
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        {isLoading ? "読み込み中..." : "請求書が見つかりません"}
      </div>
    );
  }

  const { invoice, items } = data;
  const clientName = client?.name ?? client?.company_name ?? "（クライアント不明）";

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="請求書を削除"
        description="この請求書を削除しますか？この操作は取り消せません。"
        confirmLabel="削除"
        cancelLabel="キャンセル"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteInvoice.isPending}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">請求書詳細</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleteInvoice.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          削除
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>
            {INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus] ?? invoice.status}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">請求先</dt>
              <dd>
                <Link
                  to={`/clients/${invoice.client_id}`}
                  className="text-primary hover:underline"
                >
                  {clientName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">合計金額</dt>
              <dd>{formatAmount(invoice.amount)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">発行日</dt>
              <dd>{formatYMD(invoice.issued_at)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">送信日</dt>
              <dd>{formatYMD(invoice.sent_at)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">入金日</dt>
              <dd>{formatYMD(invoice.paid_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>明細（案件ごと）</CardTitle>
          <CardDescription>この請求書に含まれる案件と金額</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">明細がありません</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => {
                const project = projectMap.get(item.project_id);
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <Link
                      to={`/projects/${item.project_id}`}
                      className="text-primary hover:underline"
                    >
                      {project?.name ?? "（案件不明）"}
                    </Link>
                    <span>{formatAmount(item.amount)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
