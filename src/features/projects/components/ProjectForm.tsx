import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectWithClient } from "@/types/database";
import type { CreateProjectInput } from "@/api/projects";
import {
  PROJECT_CATEGORY,
  PRIORITY_LABELS,
  BILLING_TYPE_LABELS,
} from "@/types/enums";
import { cn } from "@/lib/utils";

interface ProjectFormProps {
  project?: ProjectWithClient | null;
  clientOptions: { id: string; name: string | null }[];
  onSubmit: (input: CreateProjectInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ProjectForm({
  project,
  clientOptions,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProjectFormProps) {
  const isEdit = !!project;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const clientId = data.get("client_id") as string;
    if (!clientId) return;
    onSubmit({
      client_id: clientId,
      name: (data.get("name") as string) || null,
      category: (data.get("category") as string) || null,
      billing_type: (data.get("billing_type") as "fixed" | "hourly") || "fixed",
      amount: data.get("amount")
        ? Number(data.get("amount"))
        : null,
      hourly_rate: data.get("hourly_rate")
        ? Number(data.get("hourly_rate"))
        : null,
      memo: (data.get("memo") as string) || null,
      priority: (data.get("priority") as "high" | "medium" | "low") || "medium",
      start_date: (data.get("start_date") as string) || null,
      end_date: (data.get("end_date") as string) || null,
      progress: data.get("progress") ? Number(data.get("progress")) : 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client_id">クライアント</Label>
        <select
          id="client_id"
          name="client_id"
          required
          defaultValue={project?.client_id}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <option value="">選択してください</option>
          {clientOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name || "（名前未設定）"}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">案件名</Label>
        <Input
          id="name"
          name="name"
          defaultValue={project?.name ?? ""}
          placeholder="案件名"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">カテゴリ</Label>
        <select
          id="category"
          name="category"
          defaultValue={project?.category ?? ""}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <option value="">—</option>
          {Object.entries(PROJECT_CATEGORY).map(([key, label]) => (
            <option key={key} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>料金体系</Label>
          <div className="flex gap-4">
            {Object.entries(BILLING_TYPE_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="billing_type"
                  value={value}
                  defaultChecked={
                    (project?.billing_type ?? "fixed") === value
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">優先度</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={project?.priority ?? "medium"}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">契約金額・請求額（円）</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={0}
            defaultValue={project?.amount ?? ""}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourly_rate">時間単価（円/時間）</Label>
          <Input
            id="hourly_rate"
            name="hourly_rate"
            type="number"
            min={0}
            defaultValue={project?.hourly_rate ?? ""}
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">開始日</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={
              project?.start_date
                ? project.start_date.slice(0, 10)
                : ""
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">終了日</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={
              project?.end_date ? project.end_date.slice(0, 10) : ""
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="progress">進捗（0–100）</Label>
        <Input
          id="progress"
          name="progress"
          type="number"
          min={0}
          max={100}
          defaultValue={project?.progress ?? 0}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="memo">メモ</Label>
        <Input
          id="memo"
          name="memo"
          defaultValue={project?.memo ?? ""}
          placeholder="メモ"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "保存中..." : isEdit ? "更新" : "作成"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        )}
      </div>
    </form>
  );
}
