import { useState, useRef, useEffect } from "react";

const TITLE_LIMIT = 30;
const TEXT_LIMIT = 300;

interface JournalTextSectionProps {
  canEdit: boolean;
  title: string;
  text: string;
  onTitleChange: (val: string) => void;
  onTextChange: (val: string) => void;
  onBlur: () => void;
}

export default function JournalTextSection({
  canEdit,
  title,
  text,
  onTitleChange,
  onTextChange,
  onBlur,
}: JournalTextSectionProps) {
  const [titleFocused, setTitleFocused] = useState(false);
  const [textFocused, setTextFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea (works for both editable and read-only paths)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  return (
    <>
      {/* Title */}
      <div>
        {canEdit ? (
          <div className="relative pb-2">
            <input
              type="text"
              value={title}
              maxLength={TITLE_LIMIT}
              onChange={(e) => onTitleChange(e.target.value)}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => {
                setTitleFocused(false);
                onBlur();
              }}
              placeholder="Give this day a title…"
              className="w-full text-3xl font-bold text-center bg-transparent focus:outline-none placeholder:text-muted-foreground/50 font-crimson"
            />
            {titleFocused && (
              <p className="absolute bottom-0 right-0 text-xs text-muted-foreground">
                {title.length}/{TITLE_LIMIT}
              </p>
            )}
          </div>
        ) : (
          <div className="pb-2">
            <p
              className={`text-3xl font-bold text-center font-crimson ${
                title ? "" : "text-muted-foreground/30"
              }`}
            >
              {title || "Untitled"}
            </p>
          </div>
        )}
      </div>

      {/* Reflection */}
      <div>
        {canEdit ? (
          // Editable days: auto-growing textarea
          <div className="relative pb-2">
            <textarea
              ref={textareaRef}
              value={text}
              maxLength={TEXT_LIMIT}
              rows={1}
              onChange={(e) => onTextChange(e.target.value)}
              onFocus={() => setTextFocused(true)}
              onBlur={() => {
                setTextFocused(false);
                onBlur();
              }}
              placeholder="Write your thoughts for the day…"
              className="w-full resize-none bg-transparent focus:outline-none text-base leading-relaxed text-muted-foreground placeholder:text-muted-foreground/50 text-center font-crimson"
            />
            {textFocused && (
              <p className="absolute bottom-0 right-0 text-xs text-muted-foreground">
                {text.length}/{TEXT_LIMIT}
              </p>
            )}
          </div>
        ) : (
          // Read-only days: same textarea element so height is identical
          <div className="pb-2">
            <textarea
              ref={textareaRef}
              value={text}
              rows={1}
              readOnly
              placeholder="No reflection written."
              className="w-full resize-none bg-transparent focus:outline-none text-base leading-relaxed text-muted-foreground text-center font-crimson placeholder:text-muted-foreground/30 placeholder:italic cursor-default"
            />
          </div>
        )}
      </div>
    </>
  );
}
