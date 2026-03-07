import { useState } from "react";
import { Pencil, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface JournalYoutubeSectionProps {
  canEdit: boolean;
  youtubeUrl: string;
  embedUrl: string | null;
  onChange: (url: string) => void;
  onBlur: () => void;
}

function getVideoId(embedUrl: string): string | null {
  const match = embedUrl.match(/embed\/([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function JournalYoutubeSection({
  canEdit,
  youtubeUrl,
  embedUrl,
  onChange,
  onBlur,
}: JournalYoutubeSectionProps) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Reset player when video changes
  const videoId = embedUrl ? getVideoId(embedUrl) : null;

  const handleOpen = (next: boolean) => {
    if (next) setDraft(youtubeUrl);
    setOpen(next);
  };

  const handleSave = () => {
    onChange(draft);
    onBlur();
    setOpen(false);
    setPlaying(false);
  };

  const handleClear = () => {
    onChange("");
    onBlur();
    setOpen(false);
    setPlaying(false);
  };

  return (
    <div
      className="relative w-full bg-muted"
      style={{ paddingBottom: "56.25%" }}
    >
      {videoId ? (
        playing ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title="Daily vlog"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          /* Thumbnail facade — shows only the thumbnail + play button */
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full group"
            title="Play video"
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              onError={(e) => {
                // fall back to hqdefault if maxres isn't available
                (e.currentTarget as HTMLImageElement).src =
                  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Play button */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-black/60 group-hover:bg-black/80 transition-colors">
                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground/40 text-sm select-none">
            No video
          </span>
        </div>
      )}

      {/* Bottom fade into background */}
      <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-b from-transparent to-background pointer-events-none z-10" />

      {canEdit && (
        <div className="absolute -bottom-4 right-3 z-20">
          <Popover open={open} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
              <button
                className="h-7 w-7 flex items-center border border-muted justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
                title="Set video URL"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <p className="text-sm font-medium mb-2">YouTube URL</p>
              <input
                autoFocus
                type="url"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="https://youtu.be/…"
                className="w-full px-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-2 mt-2 justify-end">
                {youtubeUrl && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
