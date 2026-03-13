import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGoogleCalendarConnection } from "@/hooks/useGoogleCalendarConnection";
import { getGoogleCalendarAuthUrl } from "@/api/gcal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Link2, Unlink } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export function IntegrationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const linked = searchParams.get("linked") === "1";
  const [showLinkedMessage, setShowLinkedMessage] = useState(linked);
  const user = useCurrentUser();
  const { isConnected, isLoading, disconnect } = useGoogleCalendarConnection(user?.id);

  useEffect(() => {
    if (linked) {
      setShowLinkedMessage(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("linked");
        return next;
      }, { replace: true });
    }
  }, [linked, setSearchParams]);

  function handleConnectGoogle() {
    const redirectUri = `${window.location.origin}/integrations/google/callback`;
    const url = getGoogleCalendarAuthUrl(redirectUri);
    window.location.href = url;
  }

  async function handleDisconnect() {
    try {
      await disconnect.mutateAsync();
    } catch {
      // Error can be shown via disconnect.error in UI
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">連携</h1>
        <p className="text-muted-foreground">
          外部サービスと連携して案件をカレンダーに反映します
        </p>
      </div>

      {showLinkedMessage && (
        <div className="rounded-md border border-green-500/50 bg-green-500/10 p-4 text-green-700 dark:text-green-400">
          Google カレンダーと連携しました。案件の登録・日程変更時にイベントが自動作成・更新されます。
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google カレンダー
          </CardTitle>
          <CardDescription>
            案件の開始日・終了日を Google カレンダーに反映します。連携後、案件の登録や日程変更時にイベントが自動作成・更新されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">確認中...</p>
          ) : isConnected ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
                <Link2 className="h-4 w-4" />
                連携済み
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnect.isPending}
              >
                <Unlink className="mr-2 h-4 w-4" />
                連携を解除
              </Button>
              {disconnect.isError && (
                <span className="text-sm text-destructive">
                  {disconnect.error instanceof Error
                    ? disconnect.error.message
                    : "解除に失敗しました"}
                </span>
              )}
            </div>
          ) : (
            <Button onClick={handleConnectGoogle}>
              <Calendar className="mr-2 h-4 w-4" />
              Google カレンダーと連携
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
