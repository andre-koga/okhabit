/**
 * SRP: Displays a standardized character count for form fields.
 */
import { cn } from "@/lib/utils";

interface FormCharacterCountProps {
  current: number;
  max: number;
  className?: string;
}

export function FormCharacterCount({
  current,
  max,
  className,
}: FormCharacterCountProps) {
  return (
    <p className={cn("text-right text-xs text-muted-foreground", className)}>
      {current}/{max}
    </p>
  );
}
