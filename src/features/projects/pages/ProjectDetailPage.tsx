import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useWorkLogsByProject } from "@/hooks/useWorkLogs";
import { ProjectForm } from "../components/ProjectForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PROJECT_STATUS_LABELS,
  SUB_STATUS_LABELS,
  PRIORITY_LABELS,
  BILLING_TYPE_LABELS,
} from "@/types/enums";
import type { UpdateProjectInput } from "@/api/projects";
import { ArrowLeft, FileText, Pencil, Clock } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useCurrentUser();
  const { data: project, isLoading, error } = useProject(id, user?.id);
  const { data: clients = [] } = useClients(user?.id);
  const { data: workLogs = [] } = useWorkLogsByProject(id, user?.id);
  const updateProject = useUpdateProject(user?.id);
  const [editing, setEditing] = useState(false);

  const totalSeconds = workLogs.reduce((acc, w) => acc + (w.duration ?? 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const referenceAmount =
    project?.billing_type === "hourly" &&
    project?.hourly_rate != null &&
    totalSeconds > 0
      ? Math.round((totalSeconds / 3600) * project.hourly_rate)
      : null;

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error.message}
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        {isLoading ? "読み込み中..." : "案件が見つかりません"}
      </div>
    );
  }

  const clientOptions = clients.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {project.name || "（無題）"}
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
            <ProjectForm
              project={project}
              clientOptions={clientOptions}
              onSubmit={async (input) => {
                await updateProject.mutateAsync({
                  id: project.id,
                  input: input as UpdateProjectInput,
                });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
              isLoading={updateProject.isPending}
            />
          ) : (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">クライアント</dt>
                <dd>
                  <Link
                    to={`/clients/${project.client_id}`}
                    className="text-primary hover:underline"
                  >
                    {(project.clients as { name?: string } | null)?.name ??
                      "—"}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">ステータス</dt>
                <dd>
                  {PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS] ?? project.status}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">サブステータス</dt>
                <dd>
                  {project.sub_status
                    ? (SUB_STATUS_LABELS as Record<string, string>)[
                        project.sub_status
                      ] ?? project.sub_status
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">カテゴリ</dt>
                <dd>{project.category || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">料金体系</dt>
                <dd>
                  {BILLING_TYPE_LABELS[project.billing_type]} 
                  {project.amount != null && ` ・ ${project.amount.toLocaleString()}円`}
                </dd>
              </div>
              {project.billing_type === "hourly" && project.hourly_rate != null && (
                <div>
                  <dt className="text-muted-foreground">時間単価</dt>
                  <dd>{project.hourly_rate.toLocaleString()}円/時間</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground">優先度</dt>
                <dd>{PRIORITY_LABELS[project.priority]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">進捗</dt>
                <dd>{project.progress}%</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">開始日</dt>
                <dd>
                  {project.start_date
                    ? format(
                        new Date(project.start_date),
                        "yyyy/MM/dd",
                        { locale: ja }
                      )
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">終了日</dt>
                <dd>
                  {project.end_date
                    ? format(
                        new Date(project.end_date),
                        "yyyy/MM/dd",
                        { locale: ja }
                      )
                    : "—"}
                </dd>
              </div>
              {project.memo && (
                <div className="col-span-2">
                  <dt className="text-muted-foreground">メモ</dt>
                  <dd>{project.memo}</dd>
                </div>
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      {project.billing_type === "hourly" && referenceAmount != null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">参考金額（時間単価ベース）</CardTitle>
            <CardDescription>
              累計稼働時間 × 時間単価（請求額の目安）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {referenceAmount.toLocaleString()}円
            </p>
            <p className="text-sm text-muted-foreground">
              稼働: {hours}h {mins}m
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            作業ログ
          </CardTitle>
          <CardDescription>この案件の作業記録</CardDescription>
        </CardHeader>
        <CardContent>
          {workLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              まだ作業ログがありません
            </p>
          ) : (
            <ul className="space-y-2">
              {workLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {format(
                      new Date(log.started_at),
                      "yyyy/MM/dd HH:mm",
                      { locale: ja }
                    )}
                    {log.memo && ` — ${log.memo}`}
                  </span>
                  <span>
                    {Math.floor(log.duration / 3600)}h{" "}
                    {Math.floor((log.duration % 3600) / 60)}m
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            合計: {hours}h {mins}m
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            請求書
          </CardTitle>
          <CardDescription>請求書の作成・管理</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to={`/invoice/new?project_id=${project.id}`}>
              請求書を作成
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
