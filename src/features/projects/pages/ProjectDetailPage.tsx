import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  useProject,
  useUpdateProject,
  useArchiveProject,
  useUnarchiveProject,
} from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import {
  useWorkLogsByProject,
  useCreateWorkLog,
  useUpdateWorkLog,
  useDeleteWorkLog,
} from "@/hooks/useWorkLogs";
import { ProjectForm } from "../components/ProjectForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PROJECT_STATUS,
  PROJECT_STATUS_LABELS,
  SUB_STATUS_LABELS,
  PRIORITY_LABELS,
  BILLING_TYPE_LABELS,
} from "@/types/enums";
import type { UpdateProjectInput } from "@/api/projects";
import {
  ArrowLeft,
  FileText,
  Pencil,
  Clock,
  Archive,
  ArchiveRestore,
  Plus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { WorkLog } from "@/types/database";

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function WorkLogForm({
  projectId: _projectId,
  initialLog,
  onSave,
  onCancel,
  isLoading,
}: {
  projectId: string;
  initialLog?: WorkLog | null;
  onSave: (started_at: string, ended_at: string, memo: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const now = new Date();
  const defaultStart = new Date(now.getTime() - 60 * 60 * 1000);
  const [startedAt, setStartedAt] = useState(
    initialLog ? toDatetimeLocal(initialLog.started_at) : toDatetimeLocal(defaultStart.toISOString())
  );
  const [endedAt, setEndedAt] = useState(() => {
    if (initialLog?.ended_at) return toDatetimeLocal(initialLog.ended_at);
    if (initialLog) {
      const end = new Date(
        new Date(initialLog.started_at).getTime() + (initialLog.duration ?? 0) * 1000
      );
      return toDatetimeLocal(end.toISOString());
    }
    return toDatetimeLocal(now.toISOString());
  });
  const [memo, setMemo] = useState(initialLog?.memo ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startedAt || !endedAt) return;
    await onSave(startedAt, endedAt, memo);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="worklog-started">開始</Label>
        <Input
          id="worklog-started"
          type="datetime-local"
          value={startedAt}
          onChange={(e) => setStartedAt(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="worklog-ended">終了</Label>
        <Input
          id="worklog-ended"
          type="datetime-local"
          value={endedAt}
          onChange={(e) => setEndedAt(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="worklog-memo">メモ（任意）</Label>
        <Input
          id="worklog-memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="作業内容など"
          className="w-full"
        />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "保存中..." : "保存"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useCurrentUser();
  const { data: project, isLoading, error } = useProject(id, user?.id);
  const { data: clients = [] } = useClients(user?.id);
  const { data: workLogs = [] } = useWorkLogsByProject(id, user?.id);
  const updateProject = useUpdateProject(user?.id);
  const archiveProject = useArchiveProject(user?.id);
  const unarchiveProject = useUnarchiveProject(user?.id);
  const createWorkLog = useCreateWorkLog(user?.id);
  const updateWorkLog = useUpdateWorkLog(user?.id);
  const deleteWorkLog = useDeleteWorkLog(user?.id);
  const [editing, setEditing] = useState(false);
  const [showWorkLogAdd, setShowWorkLogAdd] = useState(false);
  const [editingWorkLogId, setEditingWorkLogId] = useState<string | null>(null);
  const [deleteWorkLogId, setDeleteWorkLogId] = useState<string | null>(null);

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

      <ConfirmDialog
        open={!!deleteWorkLogId}
        onOpenChange={(open) => !open && setDeleteWorkLogId(null)}
        title="作業ログを削除"
        description="この作業ログを削除しますか？"
        confirmLabel="削除する"
        variant="destructive"
        onConfirm={() => {
          if (deleteWorkLogId) deleteWorkLog.mutate(deleteWorkLogId);
          setDeleteWorkLogId(null);
        }}
        isLoading={deleteWorkLog.isPending}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              作業ログ
            </CardTitle>
            <CardDescription>この案件の作業記録（手動追加・編集可）</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWorkLogAdd((v) => !v)}
            disabled={!!editingWorkLogId}
          >
            <Plus className="mr-2 h-4 w-4" />
            手動で追加
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showWorkLogAdd && id && user?.id && (
            <WorkLogForm
              projectId={id}
              onSave={async (started_at, ended_at, memo) => {
                const start = new Date(started_at).getTime();
                const end = new Date(ended_at).getTime();
                const duration = Math.max(0, Math.floor((end - start) / 1000));
                await createWorkLog.mutateAsync({
                  project_id: id,
                  started_at: new Date(started_at).toISOString(),
                  ended_at: new Date(ended_at).toISOString(),
                  duration,
                  memo: memo || null,
                });
                setShowWorkLogAdd(false);
              }}
              onCancel={() => setShowWorkLogAdd(false)}
              isLoading={createWorkLog.isPending}
            />
          )}

          {workLogs.length === 0 && !showWorkLogAdd ? (
            <p className="text-sm text-muted-foreground">
              まだ作業ログがありません
            </p>
          ) : (
            <ul className="space-y-2">
              {workLogs.map((log) =>
                editingWorkLogId === log.id ? (
                  <li key={log.id} className="rounded-md border bg-muted/30 p-3">
                    <WorkLogForm
                      projectId={log.project_id}
                      initialLog={log}
                      onSave={async (started_at, ended_at, memo) => {
                        const start = new Date(started_at).getTime();
                        const end = new Date(ended_at).getTime();
                        const duration = Math.max(
                          0,
                          Math.floor((end - start) / 1000)
                        );
                        await updateWorkLog.mutateAsync({
                          id: log.id,
                          input: {
                            started_at: new Date(started_at).toISOString(),
                            ended_at: new Date(ended_at).toISOString(),
                            duration,
                            memo: memo || null,
                          },
                        });
                        setEditingWorkLogId(null);
                      }}
                      onCancel={() => setEditingWorkLogId(null)}
                      isLoading={updateWorkLog.isPending}
                    />
                  </li>
                ) : (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      {format(
                        new Date(log.started_at),
                        "yyyy/MM/dd HH:mm",
                        { locale: ja }
                      )}
                      {log.memo && ` — ${log.memo}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="tabular-nums text-muted-foreground">
                        {Math.floor(log.duration / 3600)}h{" "}
                        {Math.floor((log.duration % 3600) / 60)}m
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingWorkLogId(log.id)}
                        disabled={!!showWorkLogAdd}
                        title="編集"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteWorkLogId(log.id)}
                        disabled={!!showWorkLogAdd}
                        title="削除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </span>
                  </li>
                )
              )}
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
          <CardDescription>請求書の作成・管理（完了した案件のみ作成可能）</CardDescription>
        </CardHeader>
        <CardContent>
          {project.status === PROJECT_STATUS.COMPLETED ||
          project.status === PROJECT_STATUS.PAYMENT_RECEIVED ? (
            <Button asChild>
              <Link to={`/invoice/new?client_id=${project.client_id}`}>
                請求書を作成
              </Link>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              請求書は案件を「完了」にしたあとで作成できます。
            </p>
          )}
        </CardContent>
      </Card>

      {(project.status === PROJECT_STATUS.PAYMENT_RECEIVED && !project.archived_at) ||
      project.archived_at ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              アーカイブ
            </CardTitle>
            <CardDescription>
              {project.archived_at
                ? "アーカイブを解除するとカンバン・テーブルに再表示されます"
                : "アーカイブするとカンバン・テーブルから非表示になります"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.archived_at ? (
              <Button
                variant="outline"
                onClick={() => unarchiveProject.mutate(project.id)}
                disabled={unarchiveProject.isPending}
              >
                <ArchiveRestore className="mr-2 h-4 w-4" />
                アーカイブ解除
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => archiveProject.mutate(project.id)}
                disabled={archiveProject.isPending}
              >
                <Archive className="mr-2 h-4 w-4" />
                アーカイブする
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
