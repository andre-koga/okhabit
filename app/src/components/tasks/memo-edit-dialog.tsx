import {
  FormCharacterCount,
  FormCalendarDateField,
  FormSelectField,
  FormDialog,
  FormDialogActions,
  FormRow,
  FormStack,
  FormTextareaField,
  FormToggleButton,
} from "@/components/forms";
import { Pin } from "lucide-react";
import { MEMO_TITLE_LIMIT } from "@/components/tasks/memo-title";

interface MemoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogTitle?: string;
  title: string;
  onTitleChange: (value: string) => void;
  dueDate: string | null;
  onDueDateChange: (value: string | null) => void;
  groupId: string | null;
  onGroupChange: (value: string | null) => void;
  groupOptions: Array<{
    value: string;
    label: string;
    emoji?: string | null;
    color?: string | null;
  }>;
  isPinned: boolean;
  onPinnedChange: (value: boolean) => void;
  onConfirm: () => void;
  onDelete?: () => void;
  confirmLabel?: string;
  confirmDisabled?: boolean;
}

const NO_GROUP_VALUE = "__no_group__";

export function MemoEditDialog({
  open,
  onOpenChange,
  dialogTitle = "Edit memo",
  title,
  onTitleChange,
  dueDate,
  onDueDateChange,
  groupId,
  onGroupChange,
  groupOptions,
  isPinned,
  onPinnedChange,
  onConfirm,
  onDelete,
  confirmLabel = "Save",
  confirmDisabled = false,
}: MemoEditDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onConfirm();
    }
    if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      contentClassName="w-80"
    >
      <FormStack className="space-y-2">
        <FormTextareaField
          id="memo-title"
          label="Memo title"
          labelClassName="sr-only"
          autoFocus
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task title…"
          maxLength={MEMO_TITLE_LIMIT}
          rows={5}
          message={
            <FormCharacterCount current={title.length} max={MEMO_TITLE_LIMIT} />
          }
        />
        <FormSelectField
          id="memo-project"
          label="Project"
          labelClassName="sr-only"
          value={groupId ?? NO_GROUP_VALUE}
          onValueChange={(value) =>
            onGroupChange(value === NO_GROUP_VALUE ? null : value)
          }
          options={[
            { value: NO_GROUP_VALUE, label: "No project" },
            ...groupOptions.map((option) => ({
              value: option.value,
              label: (
                <span className="flex items-center gap-2">
                  {option.emoji ? (
                    <span className="shrink-0 text-sm" aria-hidden>
                      {option.emoji}
                    </span>
                  ) : null}
                  <span className="truncate">{option.label}</span>
                </span>
              ),
            })),
          ]}
          placeholder="Project"
        />
        <FormRow>
          <FormCalendarDateField
            id="memo-due-date"
            label="Due date"
            labelClassName="sr-only"
            value={dueDate ?? ""}
            onValueChange={(value) => onDueDateChange(value || null)}
            containerClassName="flex-1 space-y-0"
            placeholder="Due date"
            clearable
          />
          <FormToggleButton
            toggled={isPinned}
            onToggle={onPinnedChange}
            label={isPinned ? "Unpin memo" : "Pin memo"}
          >
            <Pin className={isPinned ? "h-4 w-4 fill-current" : "h-4 w-4"} />
          </FormToggleButton>
        </FormRow>
      </FormStack>
      <FormDialogActions
        onConfirm={onConfirm}
        confirmLabel={confirmLabel}
        confirmDisabled={confirmDisabled}
        secondaryAction={
          onDelete
            ? {
                label: "Delete",
                onClick: onDelete,
                destructive: true,
              }
            : undefined
        }
      />
    </FormDialog>
  );
}
