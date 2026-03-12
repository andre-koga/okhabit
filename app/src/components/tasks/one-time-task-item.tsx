import { memo, useState } from "react";
import { Pencil } from "lucide-react";
import type { OneTimeTask } from "@/lib/db/types";
import TaskCheckbox from "@/components/tasks/task-checkbox";
import { InputPromptDialog } from "@/components/ui/input-prompt-dialog";

interface OneTimeTaskItemProps {
  task: OneTimeTask;
  isToday: boolean;
  onToggle: (task: OneTimeTask) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, title: string) => Promise<boolean>;
}

function OneTimeTaskItem({
  task,
  isToday,
  onToggle,
  onDelete,
  onUpdate,
}: OneTimeTaskItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (open: boolean) => {
    if (open) setDraft(task.title);
    setEditOpen(open);
  };

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    const success = await onUpdate(task.id, draft);
    if (success) setEditOpen(false);
    setSaving(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setEditOpen(false);
  };

  return (
    <div className="flex items-start gap-2">
      <div className="mt-1.5">
        <TaskCheckbox
          isComplete={!!task.is_completed}
          isToday={isToday}
          onClick={() => onToggle(task)}
          size="sm"
        />
      </div>

      <div className="relative flex min-h-8 flex-1 items-start overflow-hidden rounded-2xl border border-border">
        <label
          onClick={isToday ? () => onToggle(task) : undefined}
          className={`min-w-0 flex-1 break-words px-4 py-2 text-left text-sm font-medium ${
            task.is_completed ? "text-muted-foreground line-through" : ""
          } ${isToday ? "cursor-pointer" : "cursor-default"}`}
        >
          {task.title}
        </label>

        {isToday && (
          <button
            type="button"
            aria-label="Edit memo"
            className="relative flex h-9 flex-shrink-0 items-center justify-center px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <InputPromptDialog
        open={editOpen}
        onOpenChange={handleOpenEdit}
        title="Edit memo"
        value={draft}
        onChange={setDraft}
        onConfirm={handleSave}
        confirmLabel="Save"
        placeholder="Task title…"
        confirmDisabled={saving || !draft.trim()}
        secondaryAction={{
          label: <>Delete</>,
          onClick: handleDelete,
        }}
      />
    </div>
  );
}

export default memo(OneTimeTaskItem);
