import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArchiveRestore, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PATTERN_OPTIONS } from "@/lib/colors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { db, now } from "@/lib/db";
import type { Activity, ActivityGroup } from "@/lib/db/types";
import {
  stopCurrentActivity,
  formatRoutineDisplay,
} from "@/lib/activity-utils";

export default function ArchivedItems() {
  const [archivedGroups, setArchivedGroups] = useState<ActivityGroup[]>([]);
  const [archivedActivities, setArchivedActivities] = useState<Activity[]>([]);
  const [allGroups, setAllGroups] = useState<ActivityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "activity" | "group" | null;
    id: string | null;
  }>({ open: false, type: null, id: null });

  const loadArchivedItems = useCallback(async () => {
    try {
      setLoading(true);
      const [archivedG, archivedA, allG] = await Promise.all([
        db.activityGroups
          .filter((g) => !!g.is_archived && !g.deleted_at)
          .sortBy("created_at"),
        db.activities
          .filter((a) => !!a.is_archived && !a.deleted_at)
          .sortBy("created_at"),
        db.activityGroups.filter((g) => !g.deleted_at).sortBy("created_at"),
      ]);
      setArchivedGroups(archivedG);
      setArchivedActivities(archivedA);
      setAllGroups(allG);
    } catch (error) {
      console.error("Error loading archived items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArchivedItems();
  }, [loadArchivedItems]);

  const handleUnarchiveGroup = async (id: string) => {
    try {
      const n = now();
      await db.activityGroups.update(id, { is_archived: false, updated_at: n });
      const activities = await db.activities
        .filter((a) => a.group_id === id && !a.deleted_at)
        .toArray();
      await Promise.all(
        activities.map((a) =>
          db.activities.update(a.id, { is_archived: false, updated_at: n }),
        ),
      );
      loadArchivedItems();
    } catch (error) {
      console.error("Error unarchiving group:", error);
    }
  };

  const handleUnarchiveActivity = async (id: string) => {
    try {
      const activity = archivedActivities.find((a) => a.id === id);
      if (!activity) return;
      const n = now();
      const group = allGroups.find((g) => g.id === activity.group_id);
      if (group?.is_archived) {
        await db.activityGroups.update(group.id, {
          is_archived: false,
          updated_at: n,
        });
      }
      await db.activities.update(id, { is_archived: false, updated_at: n });
      loadArchivedItems();
    } catch (error) {
      console.error("Error unarchiving activity:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return;
    try {
      if (deleteDialog.type === "group") {
        await stopCurrentActivity({ groupId: deleteDialog.id });
        const activities = await db.activities
          .filter((a) => a.group_id === deleteDialog.id!)
          .toArray();
        await db.activities.bulkDelete(activities.map((a) => a.id));
        await db.activityGroups.delete(deleteDialog.id);
      } else {
        await stopCurrentActivity({ activityId: deleteDialog.id });
        await db.activities.delete(deleteDialog.id);
      }
      setDeleteDialog({ open: false, type: null, id: null });
      loadArchivedItems();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const getGroupName = (groupId: string) =>
    allGroups.find((g) => g.id === groupId)?.name || "Unknown";

  const getGroupColor = (groupId: string) =>
    allGroups.find((g) => g.id === groupId)?.color || "#6b7280";

  const getPatternLabel = (pattern: string | null) =>
    PATTERN_OPTIONS.find((p) => p.value === pattern)?.name || "Solid";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading archived items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Archived Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {archivedGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No archived groups.
            </p>
          ) : (
            <div className="space-y-2">
              {archivedGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color || "#6b7280" }}
                    />
                    <span className="font-medium">{group.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnarchiveGroup(group.id)}
                      title="Unarchive group"
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          type: "group",
                          id: group.id,
                        })
                      }
                      title="Permanently delete group"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archived Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {archivedActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No archived activities.
            </p>
          ) : (
            <div className="space-y-2">
              {archivedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.name}</span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: getGroupColor(activity.group_id),
                        }}
                      >
                        {getGroupName(activity.group_id)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Pattern: {getPatternLabel(activity.pattern)} • Routine:{" "}
                      {formatRoutineDisplay(activity.routine)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnarchiveActivity(activity.id)}
                      title="Unarchive activity"
                    >
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          type: "activity",
                          id: activity.id,
                        })
                      }
                      title="Permanently delete activity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Permanently Delete{" "}
              {deleteDialog.type === "group" ? "Group" : "Activity"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {deleteDialog.type === "group"
                ? "group and all activities in it"
                : "activity"}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
