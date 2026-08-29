import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../Context/theme.js";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-full border border-default bg-surface p-1 shadow-sm">
      <Button
        aria-label="Light mode"
        size="sm"
        variant={theme === "light" ? "primary" : "ghost"}
        isIconOnly
        onPress={() => setTheme("light")}
      >
        <Sun className="size-4" />
      </Button>
      <Button
        aria-label="Dark mode"
        size="sm"
        variant={theme === "dark" ? "primary" : "ghost"}
        isIconOnly
        onPress={() => setTheme("dark")}
      >
        <Moon className="size-4" />
      </Button>
    </div>
  );
}
