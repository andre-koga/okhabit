import { memo } from "react";
import { Check, Trash2 } from "lucide-react";
import type { OneTimeTask } from "@/lib/db/types";

interface OneTimeTaskItemProps {
  task: OneTimeTask;
  isToday: boolean;
  onToggle: (task: OneTimeTask) => void;
  onDelete: (taskId: string) => void;
}

function OneTimeTaskItem({
  task,
  isToday,
  onToggle,
  onDelete,
}: OneTimeTaskItemProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isToday ? () => onToggle(task) : undefined}
        disabled={!isToday}
        className={`flex items-center justify-center h-6 w-6 rounded-full border transition-colors ${
          task.is_completed
            ? "bg-primary text-primary-foreground border-primary"
            : "border-muted-foreground text-muted-foreground"
        } disabled:opacity-60 disabled:cursor-default`}
        title={
          isToday
            ? task.is_completed
              ? "Mark incomplete"
              : "Mark complete"
            : undefined
        }
      >
        {task.is_completed && <Check className="h-4 w-4" />}
      </button>

      <div className="relative flex-1 flex items-center border border-border rounded-full overflow-hidden h-8">
        <label
          onClick={isToday ? () => onToggle(task) : undefined}
          className={`flex-1 text-left font-medium truncate px-4 text-sm ${
            task.is_completed ? "line-through text-muted-foreground" : ""
          } ${isToday ? "cursor-pointer" : "cursor-default"}`}
        >
          {task.title}
        </label>

        {isToday && (
          <button
            type="button"
            aria-label="Delete quick task"
            className="h-9 flex items-center justify-center flex-shrink-0 mr-0.5 relative rounded-full px-3 text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(OneTimeTaskItem);
