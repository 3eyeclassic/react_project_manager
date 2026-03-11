import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { ClientForm } from "../components/ClientForm";
import { ClientsTable } from "../components/ClientsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search } from "lucide-react";

export function ClientsPage() {
  const user = useCurrentUser();
  const { data: clients = [], isLoading, error } = useClients(user?.id);
  const createClient = useCreateClient(user?.id);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = clients.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = (c.name ?? "").toLowerCase();
    const company = (c.company_name ?? "").toLowerCase();
    return name.includes(q) || company.includes(q);
  });

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
          <h1 className="text-2xl font-bold tracking-tight">クライアント</h1>
          <p className="text-muted-foreground">クライアント一覧と管理</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規追加
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>新規クライアント</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              閉じる
            </Button>
          </CardHeader>
          <CardContent>
            <ClientForm
              onSubmit={async (input) => {
                await createClient.mutateAsync(input);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
              isLoading={createClient.isPending}
            />
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="名前・会社名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ClientsTable
        clients={filtered}
        isLoading={isLoading}
        totalCount={clients.length}
        onAddClick={() => setShowForm(true)}
      />
    </div>
  );
}
