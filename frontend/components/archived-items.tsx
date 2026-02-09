"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { ArchiveRestore, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PATTERN_OPTIONS } from "@/lib/colors";

type Activity = Tables<"activities">;
type ActivityGroup = Tables<"activity_groups">;

interface ArchivedItemsProps {
  userId: string;
}

export default function ArchivedItems({ userId }: ArchivedItemsProps) {
  const [archivedGroups, setArchivedGroups] = useState<ActivityGroup[]>([]);
  const [archivedActivities, setArchivedActivities] = useState<Activity[]>([]);
  const [allGroups, setAllGroups] = useState<ActivityGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadArchivedItems = useCallback(async () => {
    try {
      setLoading(true);

      const [groupsData, activitiesData, allGroupsData] = await Promise.all([
        supabase
          .from("activity_groups")
          .select("*")
          .eq("user_id", userId)
          .eq("is_archived", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("activities")
          .select("*")
          .eq("user_id", userId)
          .eq("is_archived", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("activity_groups")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),
      ]);

      if (groupsData.error) throw groupsData.error;
      if (activitiesData.error) throw activitiesData.error;
      if (allGroupsData.error) throw allGroupsData.error;

      setArchivedGroups(groupsData.data || []);
      setArchivedActivities(activitiesData.data || []);
      setAllGroups(allGroupsData.data || []);
    } catch (error) {
      console.error("Error loading archived items:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadArchivedItems();
  }, [loadArchivedItems]);

  const handleUnarchiveGroup = async (id: string) => {
    try {
      // Unarchive the group
      const { error: groupError } = await supabase
        .from("activity_groups")
        .update({ is_archived: false })
        .eq("id", id);

      if (groupError) throw groupError;

      // Unarchive all activities in this group
      const { error: activitiesError } = await supabase
        .from("activities")
        .update({ is_archived: false })
        .eq("group_id", id);

      if (activitiesError) throw activitiesError;

      loadArchivedItems();
    } catch (error) {
      console.error("Error unarchiving group:", error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    const group = archivedGroups.find((g) => g.id === id);
    if (group?.name === "System") {
      alert("System group cannot be deleted.");
      return;
    }

    if (
      !confirm(
        "Permanently delete this group? This action cannot be undone. All activities in this group will also be deleted.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("activity_groups")
        .delete()
        .eq("id", id);

      if (error) throw error;
      loadArchivedItems();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleUnarchiveActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ is_archived: false })
        .eq("id", id);

      if (error) throw error;
      loadArchivedItems();
    } catch (error) {
      console.error("Error unarchiving activity:", error);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const activity = archivedActivities.find((a) => a.id === id);
    const group = allGroups.find((g) => g.id === activity?.group_id);

    if (group?.name === "System") {
      alert("System activities cannot be deleted.");
      return;
    }

    if (
      !confirm(
        "Permanently delete this activity? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("activities").delete().eq("id", id);

      if (error) throw error;
      loadArchivedItems();
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const getGroupName = (groupId: string) => {
    const group = allGroups.find((g) => g.id === groupId);
    return group?.name || "Unknown";
  };

  const getGroupColor = (groupId: string) => {
    const group = allGroups.find((g) => g.id === groupId);
    return group?.color || "#6b7280";
  };

  const getPatternLabel = (pattern: string | null) => {
    const patternOption = PATTERN_OPTIONS.find((p) => p.value === pattern);
    return patternOption?.name || "Solid";
  };

  const formatRoutineDisplay = (routine: string | null) => {
    if (!routine) return "daily";

    if (routine === "anytime") return "anytime";
    if (routine === "never") return "never";

    if (routine.startsWith("weekly:")) {
      const days = routine.split(":")[1].split(",").map(Number);
      const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      return `weekly: ${days.map((d) => dayNames[d]).join(", ")}`;
    } else if (routine.startsWith("monthly:")) {
      const day = routine.split(":")[1];
      return `monthly: day ${day}`;
    } else if (routine.startsWith("custom:")) {
      const parts = routine.split(":");
      return `every ${parts[1]} ${parts[2]}`;
    }

    return routine;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading archived items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Archived Groups */}
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
                    {group.name === "System" && (
                      <Badge variant="secondary" className="text-xs">
                        System
                      </Badge>
                    )}
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
                      onClick={() => handleDeleteGroup(group.id)}
                      disabled={group.name === "System"}
                      title={
                        group.name === "System"
                          ? "System group cannot be deleted"
                          : "Permanently delete group"
                      }
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

      {/* Archived Activities */}
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
              {archivedActivities.map((activity) => {
                const groupName = getGroupName(activity.group_id);
                const isSystem = groupName === "System";

                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.name}</span>
                        {isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: getGroupColor(activity.group_id),
                          }}
                        >
                          {groupName}
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
                        onClick={() => handleDeleteActivity(activity.id)}
                        disabled={isSystem}
                        title={
                          isSystem
                            ? "System activities cannot be deleted"
                            : "Permanently delete activity"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
