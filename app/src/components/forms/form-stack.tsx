/**
 * SRP: Provides consistent vertical spacing between grouped form elements.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormStackProps {
  children: ReactNode;
  className?: string;
}

export function FormStack({ children, className }: FormStackProps) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}
