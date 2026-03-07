import type { ActivityGroup } from "@/lib/db/types";
import { Pencil, Archive, ArchiveRestore } from "lucide-react";

interface GroupActivitiesHeaderProps {
  group: ActivityGroup;
  isArchived: boolean | null;
  activityCount: number;
  onEditGroup: () => void;
  onToggleArchiveGroup: () => void;
}

export default function GroupActivitiesHeader({
  group,
  isArchived,
  activityCount,
  onEditGroup,
  onToggleArchiveGroup,
}: GroupActivitiesHeaderProps) {
  return (
    <div className="relative w-full h-40">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${group.color || "#888"} 0%, transparent 100%)`,
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-b from-transparent to-background pointer-events-none" />

      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-full px-4 text-center">
        {isArchived && (
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Archived
          </p>
        )}
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {activityCount} {activityCount === 1 ? "activity" : "activities"}
        </p>
      </div>

      <div className="absolute -bottom-12 right-3 z-20">
        <button
          onClick={onToggleArchiveGroup}
          className="h-7 w-7 flex items-center border border-muted justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
          title={isArchived ? "Unarchive group" : "Archive group"}
        >
          {isArchived ? (
            <ArchiveRestore className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="absolute -bottom-4 right-3 z-20">
        <button
          onClick={onEditGroup}
          className="h-7 w-7 flex items-center border border-muted justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-colors"
          title="Edit group"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
