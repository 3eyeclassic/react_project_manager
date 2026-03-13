import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useClients } from "@/hooks/useClients";
import { useCreateProject } from "@/hooks/useProjects";
import { syncProjectToGCal } from "@/api/gcal";
import { ProjectForm } from "../components/ProjectForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export function ProjectNewPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data: clients = [] } = useClients(user?.id);
  const createProject = useCreateProject(user?.id);
  const [gcalSyncError, setGcalSyncError] = useState<string | null>(null);

  const clientOptions = clients.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">新規案件</h1>
      </div>

      {gcalSyncError && (
        <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          {gcalSyncError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>案件を登録</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            clientOptions={clientOptions}
            onSubmit={async (input) => {
              setGcalSyncError(null);
              const project = await createProject.mutateAsync(input);
              try {
                await syncProjectToGCal(project.id);
              } catch {
                setGcalSyncError("カレンダー同期に失敗しました。連携設定を確認してください。");
              }
              navigate(`/projects/${project.id}`);
            }}
            onCancel={() => navigate("/")}
            isLoading={createProject.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
