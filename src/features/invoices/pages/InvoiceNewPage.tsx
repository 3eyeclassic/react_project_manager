import { useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCreateInvoice } from "@/hooks/useInvoices";
import { useProjects } from "@/hooks/useProjects";
import { useClient } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PROJECT_STATUS } from "@/types/enums";
import type { ProjectWithClient } from "@/types/database";
import { ArrowLeft, ChevronRight } from "lucide-react";

export function InvoiceNewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get("client_id");
  const user = useCurrentUser();
  const { data: projects = [] } = useProjects(user?.id);
  const { data: client, isLoading: clientLoading } = useClient(
    clientId ?? undefined,
    user?.id
  );
  const createInvoice = useCreateInvoice(user?.id);

  const completedProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.status === PROJECT_STATUS.COMPLETED ||
          p.status === PROJECT_STATUS.PAYMENT_RECEIVED
      ),
    [projects]
  );

  /** 完了案件があるクライアント一覧（client_id → クライアント名・案件リスト） */
  const clientsWithCompleted = useMemo(() => {
    const map = new Map<
      string,
      { clientName: string; projects: ProjectWithClient[] }
    >();
    for (const p of completedProjects) {
      const cid = p.client_id;
      const clientName =
        (p.clients as { name?: string } | null)?.name ?? "（クライアント未設定）";
      if (!map.has(cid)) map.set(cid, { clientName, projects: [] });
      map.get(cid)!.projects.push(p);
    }
    return Array.from(map.entries());
  }, [completedProjects]);

  /** 選択した案件ID（ステップ2でチェックしたもの） */
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  /** 案件選択後にフォームを表示するか */
  const [showForm, setShowForm] = useState(false);

  const clientProjects = useMemo(
    () =>
      clientId
        ? completedProjects.filter((p) => p.client_id === clientId)
        : [],
    [clientId, completedProjects]
  );

  const selectedProjects = useMemo(
    () => clientProjects.filter((p) => selectedProjectIds.includes(p.id)),
    [clientProjects, selectedProjectIds]
  );

  function toggleProject(projectId: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user?.id || !clientId || selectedProjects.length === 0) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    let total = 0;
    const items = selectedProjects.map((p) => {
      const raw = data.get(`amount_${p.id}`);
      const amount =
        raw !== null && raw !== "" ? Number(raw) : null;
      if (amount != null) total += amount;
      return { project_id: p.id, amount };
    });

    const issuedAt = (data.get("issued_at") as string) || null;

    createInvoice.mutate(
      {
        input: {
          client_id: clientId,
          status: "draft",
          amount: total,
          issued_at: issuedAt,
        },
        items,
      },
      {
        onSuccess: () => navigate("/invoices"),
      }
    );
  }

  function goBackToProjectSelect() {
    setShowForm(false);
    setSelectedProjectIds([]);
  }

  function goBackToClientSelect() {
    setSearchParams({});
    setSelectedProjectIds([]);
    setShowForm(false);
  }

  // ——— ステップ1: クライアント選択 ———
  if (!clientId) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>請求書作成</CardTitle>
            <CardDescription>
              請求先のクライアントを選択してください。完了した案件があるクライアントのみ表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientsWithCompleted.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                完了した案件がありません。まず案件を完了にしてください。
              </p>
            ) : (
              <ul className="space-y-2">
                {clientsWithCompleted.map(([cid, { clientName, projects: ps }]) => (
                  <li key={cid}>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setSearchParams({ client_id: cid })}
                    >
                      <span>{clientName}</span>
                      <span className="text-muted-foreground">
                        {ps.length}件の案件
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="secondary" className="mt-4" asChild>
              <Link to="/invoices">請求一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ——— ステップ2: 案件選択（複数可） ———
  if (!showForm) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={goBackToClientSelect}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>案件を選択</CardTitle>
            <CardDescription>
              {clientsWithCompleted.find(([c]) => c === clientId)?.[1]
                .clientName ?? ""}
              の完了した案件から、請求書に含める案件を選んでください（複数選択可）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                このクライアントに完了した案件がありません。
              </p>
            ) : (
              <ul className="space-y-2">
                {clientProjects.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`project_${p.id}`}
                      checked={selectedProjectIds.includes(p.id)}
                      onChange={() => toggleProject(p.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <label
                      htmlFor={`project_${p.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {p.name || "（無題）"}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => setShowForm(true)}
                disabled={selectedProjectIds.length === 0}
              >
                選択した{selectedProjectIds.length}件で請求書を作成
              </Button>
              <Button variant="outline" onClick={goBackToClientSelect}>
                クライアントを変更
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ——— ステップ3: 請求書フォーム（金額・発行日） ———
  if (clientLoading || !client) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={goBackToProjectSelect}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="icon" onClick={goBackToProjectSelect}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>請求内容を入力</CardTitle>
          <CardDescription>
            {client.name ?? client.company_name ?? "（クライアント）"} —
            各案件の請求金額と発行日を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">請求先</h3>
              <dl className="grid gap-2 rounded-md border bg-muted/30 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">名前</dt>
                  <dd>{client.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">会社名</dt>
                  <dd>{client.company_name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">請求先メール</dt>
                  <dd>{client.billing_email ?? "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">住所</dt>
                  <dd className="whitespace-pre-wrap">{client.address ?? "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">案件ごとの請求金額（円）</h3>
              {selectedProjects.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Label
                    htmlFor={`amount_${p.id}`}
                    className="min-w-[120px] shrink-0 text-muted-foreground"
                  >
                    {p.name || "（無題）"}
                  </Label>
                  <Input
                    id={`amount_${p.id}`}
                    name={`amount_${p.id}`}
                    type="number"
                    min={0}
                    step={1}
                    placeholder="金額"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2 sm:max-w-[200px]">
              <Label htmlFor="issued_at">発行日</Label>
              <Input
                id="issued_at"
                name="issued_at"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? "保存中..." : "下書きとして保存"}
              </Button>
              <Button type="button" variant="outline" onClick={goBackToProjectSelect}>
                案件選択に戻る
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
