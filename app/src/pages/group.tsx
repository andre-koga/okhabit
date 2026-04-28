import { useState, useEffect } from "react";
import type { ActivityGroup } from "@/lib/db/types";
import { db, now } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { getActivityDisplayName } from "@/lib/activity";
import { DEFAULT_GROUP_COLOR } from "@/lib/color-utils";
import GroupActivitiesHeader from "@/components/activities/group-activities-header";
import GroupActivitiesList from "@/components/activities/group-activities-list";
import GroupActivitiesTimeline from "@/components/activities/group-activities-timeline";
import { ActivityDialogForm } from "@/components/activities/activity-dialog-form";
import { ArchiveActivityDialog } from "@/components/activities/archive-activity-dialog";
import { EditGroupDialog } from "@/components/activities/edit-group-dialog";
import { useGroupActivitiesData } from "@/components/activities/hooks/use-group-activities-data";
import { FloatingBackButton } from "@/components/ui/floating-back-button";
import { logError } from "@/lib/error-utils";
import { useGroupPage } from "@/hooks/use-group-page";

export default function GroupPage() {
  const { group, loading } = useGroupPage();

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading...</div>;
  }
  if (!group) return null;

  return <GroupPageBody key={group.id} group={group} />;
}

function GroupPageBody({ group }: { group: ActivityGroup }) {
  const navigate = useNavigate();
  const [groupDetails, setGroupDetails] = useState(group);
  const [isArchived, setIsArchived] = useState(group.is_archived ?? false);
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const { activities, loading, loadActivities } = useGroupActivitiesData(group);
  const [archiveDialog, setArchiveDialog] = useState<{
    open: boolean;
    activityId: string | null;
    activityName: string | null;
  }>({ open: false, activityId: null, activityName: null });
  const [editActivityId, setEditActivityId] = useState<string | null>(null);

  useEffect(() => {
    setGroupDetails(group);
  }, [group]);

  useEffect(() => {
    setIsArchived(group.is_archived ?? false);
  }, [group.is_archived]);

  const handleArchiveGroup = async () => {
    try {
      const newArchiveStatus = !isArchived;
      setIsArchived(newArchiveStatus);
      const n = now();
      await db.activityGroups.update(groupDetails.id, {
        is_archived: newArchiveStatus,
        updated_at: n,
      });
      const groupActivities = await db.activities
        .filter(
          (activity) => activity.group_id === groupDetails.id && !activity.deleted_at
        )
        .toArray();
      await Promise.all(
        groupActivities.map((activity) =>
          db.activities.update(activity.id, {
            is_archived: newArchiveStatus,
            updated_at: n,
          })
        )
      );
      setGroupDetails((prev) => ({ ...prev, is_archived: newArchiveStatus }));
      void loadActivities();
    } catch (error) {
      logError("Error archiving group", error);
      setIsArchived(!isArchived);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-scroll pb-20">
      <GroupActivitiesHeader
        group={groupDetails}
        isArchived={isArchived}
        activityCount={activities.length}
        onEditGroup={() => setEditGroupDialogOpen(true)}
        onToggleArchiveGroup={handleArchiveGroup}
      />

      <div className="px-4 pt-6">
        <GroupActivitiesList
          activities={activities}
          group={groupDetails}
          onEditActivity={(activityId) => setEditActivityId(activityId)}
          onArchiveActivity={(activity) =>
            setArchiveDialog({
              open: true,
              activityId: activity.id,
              activityName: getActivityDisplayName(activity, groupDetails),
            })
          }
        />
      </div>

      <div className="mt-8 pt-6">
        <GroupActivitiesTimeline
          groupId={groupDetails.id}
          groupName={groupDetails.name}
          groupColor={groupDetails.color || DEFAULT_GROUP_COLOR}
        />
      </div>

      <FloatingBackButton onClick={() => navigate("/")} title="Back to home" />

      <ArchiveActivityDialog
        open={archiveDialog.open}
        activityId={archiveDialog.activityId}
        activityName={archiveDialog.activityName}
        onOpenChange={(open) =>
          !open &&
          setArchiveDialog({
            open: false,
            activityId: null,
            activityName: null,
          })
        }
        onArchived={loadActivities}
      />

      <EditGroupDialog
        open={editGroupDialogOpen}
        onOpenChange={setEditGroupDialogOpen}
        group={groupDetails}
        onUpdated={(updatedGroup) => {
          setGroupDetails(updatedGroup);
        }}
        onArchived={() => {
          setIsArchived(true);
          setGroupDetails((prev) => ({ ...prev, is_archived: true }));
          void loadActivities();
        }}
      />

      <ActivityDialogForm
        open={editActivityId !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEditActivityId(null);
        }}
        group={groupDetails}
        activity={activities.find((activity) => activity.id === editActivityId)}
        onSaved={() => {
          void loadActivities();
        }}
        onArchived={() => {
          void loadActivities();
        }}
      />
    </div>
  );
}
