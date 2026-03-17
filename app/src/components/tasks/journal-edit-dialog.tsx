/**
 * SRP: Renders the journal edit dialog for emoji, title, and reflection fields.
 */
import { useState } from "react";
import {
  FormCharacterCount,
  FormDialog,
  FormDialogActions,
  FormField,
  FormStack,
  FormTextareaField,
} from "@/components/forms";
import { getFirstEmoji } from "@/lib/emoji-utils";

const TITLE_LIMIT = 30;
const TEXT_LIMIT = 300;

interface JournalEditDialogProps {
  open: boolean;
  canEdit: boolean;
  initialEmoji: string;
  initialTitle: string;
  initialText: string;
  onOpenChange: (open: boolean) => void;
  onSave: (values: { emoji: string; title: string; text: string }) => void;
}

export default function JournalEditDialog({
  open,
  canEdit,
  initialEmoji,
  initialTitle,
  initialText,
  onOpenChange,
  onSave,
}: JournalEditDialogProps) {
  const [emoji, setEmoji] = useState(initialEmoji);
  const [title, setTitle] = useState(initialTitle);
  const [text, setText] = useState(initialText);

  const handleSave = () => {
    onSave({
      emoji: getFirstEmoji(emoji),
      title: title.trim(),
      text: text.trim(),
    });
    onOpenChange(false);
  };

  if (!canEdit) return null;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit journal"
      contentClassName="w-[22rem]"
    >
      <FormStack>
        <div className="flex items-center justify-center">
          <input
            autoFocus
            type="text"
            value={emoji}
            maxLength={4}
            onChange={(e) => setEmoji(getFirstEmoji(e.target.value))}
            placeholder="🙂"
            className="h-16 w-16 rounded-full border bg-background text-center text-3xl placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <FormField
          id="journal-title"
          label="Journal title"
          labelClassName="sr-only"
          value={title}
          maxLength={TITLE_LIMIT}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this day a title..."
          message={
            <FormCharacterCount current={title.length} max={TITLE_LIMIT} />
          }
        />

        <FormTextareaField
          id="journal-reflection"
          label="Journal reflection"
          labelClassName="sr-only"
          value={text}
          maxLength={TEXT_LIMIT}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your thoughts for the day..."
          rows={6}
          className="leading-relaxed"
          message={
            <FormCharacterCount current={text.length} max={TEXT_LIMIT} />
          }
        />
      </FormStack>

      <FormDialogActions
        onConfirm={handleSave}
        confirmLabel="Save"
        secondaryAction={{
          label: "Cancel",
          onClick: () => onOpenChange(false),
        }}
      />
    </FormDialog>
  );
}
