import Pill from "@/components/ui/pill";

export interface GroupPillProps {
  name: string;
  color: string;
  elapsedMs?: number;
  isRunning?: boolean;
  onClick?: () => void;
  /** When true, renders as a non-interactive div instead of a button */
  readOnly?: boolean;
  className?: string;
}

export default function GroupPill({
  name,
  color,
  elapsedMs,
  isRunning,
  onClick,
  readOnly = false,
  className = "",
}: GroupPillProps) {
  return (
    <Pill
      name={name}
      color={color}
      elapsedMs={elapsedMs}
      isRunning={isRunning}
      onPlayStop={onClick}
      readOnly={readOnly}
      className={className}
    />
  );
}
