"use client";

import { useState, useEffect, useCallback } from "react";
import { Tables } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type ActivityGroup = Tables<"activity_groups">;
type Activity = Tables<"activities">;

interface ActivitiesListProps {
  userId: string;
}

export default function ActivitiesList({ userId }: ActivitiesListProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<ActivityGroup[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [groupsData, activitiesData] = await Promise.all([
        supabase
          .from("activity_groups")
          .select("*")
          .eq("user_id", userId)
          .eq("is_archived", false)
          .order("created_at", { ascending: true }),
        supabase
          .from("activities")
          .select("*")
          .eq("user_id", userId)
          .eq("is_archived", false)
          .order("created_at", { ascending: true }),
      ]);

      if (groupsData.error) throw groupsData.error;
      if (activitiesData.error) throw activitiesData.error;

      setGroups(groupsData.data || []);
      setActivities(activitiesData.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getActivitiesCount = (groupId: string) => {
    return activities.filter((a) => a.group_id === groupId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Activity Groups</h1>
            <p className="text-muted-foreground">
              Organize your activities into groups
            </p>
          </div>
          <Button size="icon" onClick={() => router.push("/activities/new")}>
            <Plus />
          </Button>
        </div>

        {groups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No activity groups yet. Create your first group to get started!
              </p>
              <Button onClick={() => router.push("/activities/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/activities/${group.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: group.color || "#000" }}
                    />
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {getActivitiesCount(group.id)}{" "}
                    {getActivitiesCount(group.id) === 1
                      ? "activity"
                      : "activities"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
