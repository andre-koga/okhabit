import type { Activity, ActivityGroup } from "@/lib/db/types";
import { getActivityDisplayName } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import { Pencil, Archive } from "lucide-react";

interface GroupActivitiesListProps {
  activities: Activity[];
  group: ActivityGroup;
  onEditActivity: (activityId: string) => void;
  onArchiveActivity: (activity: Activity) => void;
}

export default function GroupActivitiesList({
  activities,
  group,
  onEditActivity,
  onArchiveActivity,
}: GroupActivitiesListProps) {
  if (activities.length === 0) return null;

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {activities.map((activity) => (
        <li
          key={activity.id}
          className="flex items-center gap-3 px-3 py-2.5"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {getActivityDisplayName(activity, group)}
          </span>
          <div className="flex shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Edit activity"
              onClick={() => onEditActivity(activity.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Archive activity"
              onClick={() => onArchiveActivity(activity)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
