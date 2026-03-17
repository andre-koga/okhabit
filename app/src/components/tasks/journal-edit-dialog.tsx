/**
 * SRP: Renders the journal edit dialog for emoji, title, and reflection fields.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [emoji, setEmoji] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setEmoji(initialEmoji);
      setTitle(initialTitle);
      setText(initialText);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    onSave({
      emoji: getFirstEmoji(emoji),
      title: title.trim(),
      text: text.trim(),
    });
    handleOpenChange(false);
  };

  if (!canEdit) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="sm" className="w-[22rem] p-4">
        <DialogHeader>
          <DialogTitle>Edit journal</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
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

          <div className="space-y-1">
            <input
              type="text"
              value={title}
              maxLength={TITLE_LIMIT}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this day a title..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-right text-xs text-muted-foreground">
              {title.length}/{TITLE_LIMIT}
            </p>
          </div>

          <div className="space-y-1">
            <textarea
              value={text}
              maxLength={TEXT_LIMIT}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your thoughts for the day..."
              rows={6}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-right text-xs text-muted-foreground">
              {text.length}/{TEXT_LIMIT}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="flex items-center gap-1 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-md transition-colors hover:bg-secondary/90"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full max-w-[12rem] rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
