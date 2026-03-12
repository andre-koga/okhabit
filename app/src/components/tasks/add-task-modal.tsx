import { useState } from "react";
import { InputPromptDialog } from "@/components/ui/input-prompt-dialog";
import { Plus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AddTaskModalProps {
  /** Called with the task title; return true on success to close the modal. */
  onAdd: (title: string) => Promise<boolean>;
  triggerClassName?: string;
  triggerTitle?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export default function AddTaskModal({
  onAdd,
  triggerClassName,
  triggerTitle = "Add one-time task",
  icon: Icon = Plus,
  disabled = false,
}: AddTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setAdding(true);
    const success = await onAdd(title);
    if (success) {
      setTitle("");
      setOpen(false);
    }
    setAdding(false);
  };

  return (
    <>
      <InputPromptDialog
        open={open}
        onOpenChange={setOpen}
        title="New memo"
        value={title}
        onChange={setTitle}
        onConfirm={handleAdd}
        confirmLabel="Add"
        placeholder="Task title…"
        confirmDisabled={adding || !title.trim()}
      />

      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        title={triggerTitle}
        className={
          triggerClassName ||
          "fixed bottom-3 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
        }
      >
        {open ? <X className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </button>
    </>
  );
}
