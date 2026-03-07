import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setAdding(true);
    const success = await onAdd(title);
    if (success) {
      setTitle("");
      setShowModal(false);
    }
    setAdding(false);
  };

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-32"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-background border rounded-xl shadow-2xl shadow-black p-4 mx-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold mb-3">New one-time task</p>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") setShowModal(false);
                }}
                placeholder="Task title…"
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={adding || !title.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowModal((v) => !v)}
        disabled={disabled}
        title={triggerTitle}
        className={
          triggerClassName ||
          "fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary/90 transition-colors"
        }
      >
        {showModal ? <X className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </button>
    </>
  );
}
