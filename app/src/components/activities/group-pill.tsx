import { ChevronRight, Pencil } from "lucide-react";
import { getContrastColor } from "@/lib/color-utils";
import { Button } from "@/components/ui/button";

export interface GroupPillProps {
  name: string;
  color: string;
  isRunning?: boolean;
  onActionClick?: () => void;
  onNameClick?: () => void;
  /** When set, shows an edit button on the left that calls this. */
  onSettingsClick?: () => void;
  /** When true, renders as a non-interactive div instead of a button */
  readOnly?: boolean;
  className?: string;
}

export default function GroupPill({
  name,
  color,
  onActionClick,
  onNameClick,
  onSettingsClick,
  readOnly = false,
  className = "",
}: GroupPillProps) {
  const textColor = getContrastColor(color);
  const actionLabel = "Start";

  const base =
    "relative flex items-stretch gap-2 rounded-full overflow-hidden h-10 " +
    className;

  if (readOnly) {
    return (
      <div className={base}>
        {onSettingsClick && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-muted-foreground" />
        )}
        <span className="flex flex-1 items-center gap-2 truncate px-4 text-left text-sm font-medium">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          {name || (
            <span className="font-normal text-muted-foreground/50">Name…</span>
          )}
        </span>
        <div
          className="relative mr-0.5 flex h-9 flex-shrink-0 items-center justify-center rounded-full px-4 text-xs font-semibold"
          style={{ backgroundColor: color, color: textColor }}
        >
          Start
        </div>
      </div>
    );
  }

  return (
    <div className={base}>
      {onSettingsClick && (
        <Button
          type="button"
          variant="outline"
          onClick={onSettingsClick}
          className="h-10 w-10 shrink-0 rounded-full border-border p-0"
          aria-label="Edit group"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <div className="flex w-full gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onNameClick}
          className="h-full flex-1 justify-start gap-2 truncate rounded-full px-4 text-left text-sm font-medium shadow-none hover:bg-transparent"
        >
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          {name || (
            <span className="font-normal text-muted-foreground/50">Name…</span>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onActionClick}
          className="relative h-full shrink-0 gap-1.5 rounded-full px-4 font-semibold shadow-none"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="h-4 w-4 flex-shrink-0 translate-x-px" />
        </Button>
      </div>
    </div>
  );
}
