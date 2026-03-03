import { useNavigate, Link } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useClients } from "@/hooks/useClients";
import { useCreateProject } from "@/hooks/useProjects";
import { ProjectForm } from "../components/ProjectForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export function ProjectNewPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data: clients = [] } = useClients(user?.id);
  const createProject = useCreateProject(user?.id);

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

      <Card>
        <CardHeader>
          <CardTitle>案件を登録</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            clientOptions={clientOptions}
            onSubmit={async (input) => {
              const project = await createProject.mutateAsync(input);
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
