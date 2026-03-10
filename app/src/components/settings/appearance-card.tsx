import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Sun } from "lucide-react";

export function AppearanceCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Sun className="h-4 w-4" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm">Theme</span>
          <ThemeSwitcher />
        </div>
      </CardContent>
    </Card>
  );
}
