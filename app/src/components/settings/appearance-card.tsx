import { Sun } from "lucide-react";

import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { SettingsSection } from "@/components/ui/settings-section";

export function AppearanceCard() {
  return (
    <SettingsSection title="Appearance" icon={Sun}>
      <ThemeSwitcher />
    </SettingsSection>
  );
}
