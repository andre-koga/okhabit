/**
 * SRP: Renders journal title, location, and reflection text in read-only form.
 */
import { MapPin } from "lucide-react";
import type { LocationData } from "@/lib/db/types";

interface JournalTextSectionProps {
  title: string;
  text: string;
  location?: LocationData;
}

export default function JournalTextSection({
  title,
  text,
  location,
}: JournalTextSectionProps) {
  return (
    <>
      <p
        className={`pt-2 text-left font-crimson text-3xl font-bold ${
          title ? "" : "text-muted-foreground/30"
        }`}
      >
        {title || "Untitled"}
      </p>

      {location && (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {location.displayName}
        </span>
      )}

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
