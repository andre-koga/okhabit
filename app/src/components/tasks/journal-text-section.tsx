/**
 * SRP: Renders journal title and reflection text in read-only form.
 */

interface JournalTextSectionProps {
  title: string;
  text: string;
}

export default function JournalTextSection({
  title,
  text,
}: JournalTextSectionProps) {
  return (
    <>
      <div>
        <div className="pb-2">
          <p
            className={`text-center font-crimson text-3xl font-bold ${
              title ? "" : "text-muted-foreground/30"
            }`}
          >
            {title || "Untitled"}
          </p>
        </div>
      </div>

      <div>
        <div className="pb-2">
          <p
            className={`w-full whitespace-pre-wrap text-center font-crimson text-base leading-relaxed ${
              text ? "text-muted-foreground" : "italic text-muted-foreground/30"
            }`}
          >
            {text || "No reflection written."}
          </p>
        </div>
      </div>
    </>
  );
}
