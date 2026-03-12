import type { Activity } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import { Pencil, Archive } from "lucide-react";
import ActivityPill from "@/components/activities/activity-pill";

interface GroupActivitiesListProps {
  activities: Activity[];
  groupColor: string;
  currentActivityId: string | null;
  getElapsedMs: (activityId: string) => number | undefined;
  onToggleActivity: (activityId: string) => void | Promise<void>;
  onEditActivity: (activityId: string) => void;
  onArchiveActivity: (activity: Activity) => void;
}

export default function GroupActivitiesList({
  activities,
  groupColor,
  currentActivityId,
  getElapsedMs,
  onToggleActivity,
  onEditActivity,
  onArchiveActivity,
}: GroupActivitiesListProps) {
  if (activities.length === 0) return null;

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <ActivityPill
              name={activity.name}
              color={groupColor}
              isRunning={currentActivityId === activity.id}
              elapsedMs={getElapsedMs(activity.id)}
              onClick={() => onToggleActivity(activity.id)}
            />
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEditActivity(activity.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onArchiveActivity(activity)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
