import { Link } from "react-router-dom";
import { X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const FLOATING_BACK_BUTTON_CLASSES =
  "fixed bottom-3 left-4 z-50 h-12 w-12 border border-border flex items-center justify-center rounded-full bg-background shadow-md text-muted-foreground hover:text-foreground transition-colors";

interface FloatingBackButtonProps {
  to?: string;
  onClick?: () => void;
  title?: string;
  "aria-label"?: string;
  icon?: "back" | "settings";
  className?: string;
}

export function FloatingBackButton({
  to,
  onClick,
  title,
  "aria-label": ariaLabel,
  icon = "back",
  className,
}: FloatingBackButtonProps) {
  const Icon = icon === "settings" ? Settings : X;
  const commonProps = {
    title,
    "aria-label": ariaLabel ?? title,
    className: cn(FLOATING_BACK_BUTTON_CLASSES, className),
    children: <Icon className="h-5 w-5" />,
  };

  if (to !== undefined) {
    return <Link to={to} {...commonProps} />;
  }

  return <button type="button" onClick={onClick} {...commonProps} />;
}
