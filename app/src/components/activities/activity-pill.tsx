import Pill from "@/components/ui/pill";

export interface ActivityPillProps {
  name: string;
  color?: string;
  elapsedMs?: number;
  isRunning?: boolean;
  onNameClick?: () => void;
  onClick?: () => void;
  /** When true, renders as a non-interactive div instead of a button */
  readOnly?: boolean;
  className?: string;
}

export default function ActivityPill({
  name,
  color = "#3b82f6",
  elapsedMs,
  isRunning,
  onNameClick,
  onClick,
  readOnly = false,
  className = "",
}: ActivityPillProps) {
  return (
    <Pill
      name={name}
      color={color}
      elapsedMs={elapsedMs}
      isRunning={isRunning}
      onPlayStop={onClick}
      onNameClick={onNameClick}
      readOnly={readOnly}
      className={className}
    />
  );
}
