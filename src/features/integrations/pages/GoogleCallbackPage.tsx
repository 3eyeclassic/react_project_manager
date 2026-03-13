import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeGoogleCode } from "@/api/gcal";
import { Loader2 } from "lucide-react";

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("認証コードがありません");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const redirectUri = `${window.location.origin}/integrations/google/callback`;
        await exchangeGoogleCode(code, redirectUri);
        if (!cancelled) navigate("/integrations?linked=1", { replace: true });
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Google 連携に失敗しました"
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">{error}</p>
        <a href="/integrations" className="text-primary underline">
          連携設定に戻る
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Google と連携しています...</p>
    </div>
  );
}
