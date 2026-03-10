import { Heart } from "lucide-react";

interface JournalMetaRowProps {
  canEdit: boolean;
  bookmarked: boolean;
  onBookmarkToggle: () => void;
}

export default function JournalMetaRow({
  canEdit,
  bookmarked,
  onBookmarkToggle,
}: JournalMetaRowProps) {
  if (!canEdit) return null;

  return (
    <div className="flex justify-end">
      {/* Bookmark */}
      <button
        onClick={onBookmarkToggle}
        className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
          bookmarked
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
        title={bookmarked ? "Remove bookmark" : "Bookmark this day"}
      >
        <Heart
          className="h-5 w-5"
          fill={bookmarked ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}
