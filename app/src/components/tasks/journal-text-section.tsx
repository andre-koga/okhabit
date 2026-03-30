/**
 * SRP: Renders journal location and streak above the title, then title and reflection text.
 */
import { MapPin } from "lucide-react";
import type { LocationData } from "@/lib/db/types";

interface JournalTextSectionProps {
  title: string;
  text: string;
  location?: LocationData;
  /** Shown next to location when the day’s journal is complete. */
  journalCompletionStreak?: number | null;
}

export default function JournalTextSection({
  title,
  text,
  location,
  journalCompletionStreak,
}: JournalTextSectionProps) {
  const showStreak = typeof journalCompletionStreak === "number";

  const showMetaRow = Boolean(location) || showStreak;

  return (
    <>
      {showMetaRow && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
          {location ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{location.displayName}</span>
            </span>
          ) : (
            <span />
          )}
          {showStreak && (
            <span
              className="inline-flex shrink-0 items-center gap-0.5 tabular-nums"
              title={`Journal streak: ${journalCompletionStreak}`}
              aria-label={`Journal streak: ${journalCompletionStreak}`}
            >
              <span aria-hidden>🔥</span>
              {journalCompletionStreak}
            </span>
          )}
        </div>
      )}

      <p
        className={`text-left font-crimson text-3xl font-bold ${
          title ? "" : "text-muted-foreground/30"
        } ${showMetaRow ? "pt-1" : "pt-2"}`}
      >
        {title || "Untitled"}
      </p>

      <p
        className={`w-full whitespace-pre-wrap text-left font-crimson text-base leading-relaxed ${
          text ? "text-muted-foreground" : "italic text-muted-foreground/30"
        }`}
      >
        {text || "No reflection written."}
      </p>
    </>
  );
}
