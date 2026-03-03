import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Client } from "@/types/database";
import type { CreateClientInput } from "@/api/clients";

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (input: CreateClientInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ClientForm({
  client,
  onSubmit,
  onCancel,
  isLoading = false,
}: ClientFormProps) {
  const isEdit = !!client;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    onSubmit({
      name: (data.get("name") as string) || null,
      company_name: (data.get("company_name") as string) || null,
      representative: (data.get("representative") as string) || null,
      billing_email: (data.get("billing_email") as string) || null,
      phone: (data.get("phone") as string) || null,
      address: (data.get("address") as string) || null,
      notes: (data.get("notes") as string) || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">名前</Label>
          <Input
            id="name"
            name="name"
            defaultValue={client?.name ?? ""}
            placeholder="担当者名"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">会社名・法人名</Label>
          <Input
            id="company_name"
            name="company_name"
            defaultValue={client?.company_name ?? ""}
            placeholder="株式会社〇〇"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="representative">代表者</Label>
        <Input
          id="representative"
          name="representative"
          defaultValue={client?.representative ?? ""}
          placeholder="代表取締役 山田太郎"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="billing_email">請求先メール</Label>
        <Input
          id="billing_email"
          name="billing_email"
          type="email"
          defaultValue={client?.billing_email ?? ""}
          placeholder="billing@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">電話番号</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={client?.phone ?? ""}
          placeholder="03-1234-5678"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">住所</Label>
        <Input
          id="address"
          name="address"
          defaultValue={client?.address ?? ""}
          placeholder="東京都〇〇区..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">備考</Label>
        <Input
          id="notes"
          name="notes"
          defaultValue={client?.notes ?? ""}
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
