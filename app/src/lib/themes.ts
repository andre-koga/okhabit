import type { LucideIcon } from "lucide-react";
import { Coffee, Laptop, Moon, Rainbow, Sparkles, Stone, Sun, Sunset, Trees, Waves, Zap } from "lucide-react";

export type ThemeModeValue = "system" | "light" | "dark";

export type PaletteValue = "default" | "ocean" | "sunset" | "forest" | "mocha" | "cyberpunk" | "pastel dreams" | "graphite" | "jellyfish";

export interface ThemeModeOption {
    value: ThemeModeValue;
    label: string;
    icon: LucideIcon;
}

export interface PaletteOption {
    value: PaletteValue;
    label: string;
    icon: LucideIcon;
}

export const THEME_MODE_OPTIONS: ThemeModeOption[] = [
    { value: "system", label: "System", icon: Laptop },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
];

export const PALETTE_OPTIONS: PaletteOption[] = [
    { value: "default", label: "Classic", icon: Sun },
    { value: "ocean", label: "Ocean", icon: Waves },
    { value: "sunset", label: "Sunset", icon: Sunset },
    { value: "forest", label: "Forest", icon: Trees },
    { value: "mocha", label: "Mocha", icon: Coffee },
    { value: "cyberpunk", label: "Cyberpunk", icon: Sparkles },
    { value: "pastel dreams", label: "Pastel Dreams", icon: Rainbow },
    { value: "graphite", label: "Graphite", icon: Stone },
    { value: "jellyfish", label: "Jellyfish", icon: Zap },
];

export const DEFAULT_PALETTE: PaletteValue = "default";