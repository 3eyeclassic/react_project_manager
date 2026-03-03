import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useClient, useUpdateClient } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { ClientForm } from "../components/ClientForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FolderKanban, Pencil } from "lucide-react";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useCurrentUser();
  const { data: client, isLoading, error } = useClient(id, user?.id);
  const { data: projects = [] } = useProjects(user?.id);
  const updateClient = useUpdateClient(user?.id);
  const [editing, setEditing] = useState(false);

  const clientProjects = projects.filter((p) => p.client_id === id);

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error.message}
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        {isLoading ? "読み込み中..." : "クライアントが見つかりません"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {client.name || "（名前未設定）"}
        </h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>基本情報</CardTitle>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {editing ? (
            <ClientForm
              client={client}
              onSubmit={async (input) => {
                await updateClient.mutateAsync({ id: client.id, input });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              isLoading={updateClient.isPending}
            />
          ) : (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">名前</dt>
                <dd>{client.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">会社名</dt>
                <dd>{client.company_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">代表者</dt>
                <dd>{client.representative || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">請求先メール</dt>
                <dd>{client.billing_email || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">電話番号</dt>
                <dd>{client.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">住所</dt>
                <dd className="col-span-2">{client.address || "—"}</dd>
              </div>
              {client.notes && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">備考</dt>
                  <dd>{client.notes}</dd>
                </div>
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            関連案件
          </CardTitle>
          <CardDescription>このクライアントに紐づく案件一覧</CardDescription>
        </CardHeader>
        <CardContent>
          {clientProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだ案件がありません
            </p>
          ) : (
            <ul className="space-y-2">
              {clientProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/projects/${p.id}`}
                    className="text-primary hover:underline"
                  >
                    {p.name || "（無題）"}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
