import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export function InvoiceNewPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project_id");

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="icon" asChild>
        <Link to={projectId ? `/projects/${projectId}` : "/invoices"}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>請求書作成</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            misoca API 連携は Phase 4 で実装予定です。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
