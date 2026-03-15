/**
 * SRP: Renders a reusable single-input confirmation dialog with optional secondary action.
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface InputPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  confirmLabel?: string;
  placeholder?: string;
  inputType?: "text" | "url";
  inputReadOnly?: boolean;
  confirmDisabled?: boolean;
  /** Optional secondary action (e.g. Clear) shown above the confirm button */
  secondaryAction?: {
    label: React.ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
  };
  inputClassName?: string;
  contentClassName?: string;
}

export function InputPromptDialog({
  open,
  onOpenChange,
  title,
  value,
  onChange,
  onConfirm,
  confirmLabel = "Save",
  placeholder,
  inputType = "text",
  inputReadOnly = false,
  confirmDisabled = false,
  secondaryAction,
  inputClassName,
  contentClassName,
}: InputPromptDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !confirmDisabled) {
      e.preventDefault();
      onConfirm();
    }
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" className={cn("w-80 p-4", contentClassName)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <input
          autoFocus
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={inputReadOnly}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
            inputClassName
          )}
        />
        <div className="flex items-center justify-center gap-3 pt-2">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
              className={cn(
                "flex items-center gap-1 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-md transition-colors hover:bg-secondary/90 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40",
                secondaryAction.className
              )}
            >
              {secondaryAction.label}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={cn(
              "w-full max-w-[12rem] rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
