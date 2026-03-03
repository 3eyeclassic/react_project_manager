import { useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";

export function ThemeInit() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolved);
  }, [theme]);

  return null;
}
