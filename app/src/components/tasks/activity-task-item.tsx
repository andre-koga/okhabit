import { Button } from "@/components/ui/button";
import { Check, Play, Square, X } from "lucide-react";
import type { Activity, ActivityGroup } from "@/lib/db/types";
import { formatActivityTime } from "@/lib/activity-utils";

interface ActivityTaskItemProps {
  activity: Activity;
  group: ActivityGroup | undefined;
  count: number;
  timeSpent: number;
  isCurrentActivity: boolean;
  isToday: boolean;
  onIncrement: (activityId: string, target: number) => void;
  onStartActivity: (activityId: string) => void;
}

export default function ActivityTaskItem({
  activity,
  group,
  count,
  timeSpent,
  isCurrentActivity,
  isToday,
  onIncrement,
  onStartActivity,
}: ActivityTaskItemProps) {
  const target = activity.completion_target ?? 1;
  const isComplete = count >= target;
  const isNeverTask = activity.routine === "never";
  const groupColor = group?.color || "#cccccc";

  return (
    <div className="flex items-center gap-3 p-3 border rounded-md hover:bg-accent">
      {isNeverTask ? (
        <div
          onClick={isToday ? () => onIncrement(activity.id, target) : undefined}
          className={`flex items-center justify-center w-4 h-4 rounded border border-destructive ${
            isToday ? "cursor-pointer" : "cursor-default opacity-60"
          } ${isComplete ? "bg-destructive" : "bg-transparent"}`}
          role={isToday ? "button" : undefined}
          tabIndex={isToday ? 0 : undefined}
          onKeyDown={
            isToday
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onIncrement(activity.id, target);
                  }
                }
              : undefined
          }
        >
          {isComplete && <X className="h-3 w-3 text-destructive-foreground" />}
        </div>
      ) : target <= 1 ? (
        <button
          onClick={isToday ? () => onIncrement(activity.id, target) : undefined}
          disabled={!isToday}
          className={`flex items-center justify-center h-6 w-6 rounded-full border transition-colors ${
            isComplete
              ? "bg-primary text-primary-foreground border-primary"
              : "border-muted-foreground text-muted-foreground"
          } disabled:opacity-60 disabled:cursor-default`}
          title={
            isToday
              ? isComplete
                ? "Mark incomplete"
                : "Mark complete"
              : undefined
          }
        >
          {isComplete && <Check className="h-3 w-3" />}
        </button>
      ) : (
        <button
          onClick={isToday ? () => onIncrement(activity.id, target) : undefined}
          disabled={!isToday}
          className={`flex items-center justify-center min-w-[2.75rem] h-6 rounded-full text-xs font-semibold px-2 border transition-colors ${
            isComplete
              ? "bg-primary text-primary-foreground border-primary"
              : count > 0
                ? "bg-primary/20 text-primary border-primary/40"
                : "border-muted-foreground text-muted-foreground"
          } disabled:opacity-60 disabled:cursor-default`}
          title={
            isToday
              ? `${count} / ${target} — click to increment`
              : `${count} / ${target}`
          }
        >
          {count}/{target}
        </button>
      )}

      <label
        className={`flex items-center gap-2 flex-1 ${
          isToday && !isNeverTask ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={
          isToday && !isNeverTask
            ? () => onIncrement(activity.id, target)
            : undefined
        }
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: groupColor }}
        />
        <span
          className={isComplete ? "line-through text-muted-foreground" : ""}
        >
          {activity.name}
        </span>
      </label>

      {timeSpent > 0 && (
        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-mono">
          {formatActivityTime(timeSpent)}
        </span>
      )}

      {isToday && (
        <Button
          size="sm"
          variant={isCurrentActivity ? "default" : "ghost"}
          onClick={() => onStartActivity(activity.id)}
          title={
            isCurrentActivity ? "Stop this activity" : "Start this activity"
          }
        >
          {isCurrentActivity ? (
            <Square className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}
