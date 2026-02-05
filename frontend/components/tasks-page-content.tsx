"use client";

import { useState, useEffect, useCallback } from "react";
import { Tables } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import DailyTasksList from "@/components/daily-tasks-list";

type Activity = Tables<"activities">;
type ActivityGroup = Tables<"activity_groups">;

interface TasksPageContentProps {
  userId: string;
}

export default function TasksPageContent({ userId }: TasksPageContentProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groups, setGroups] = useState<ActivityGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [activitiesRes, groupsRes] = await Promise.all([
        supabase
          .from("activities")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true }),
        supabase.from("activity_groups").select("*").eq("user_id", userId),
      ]);

      if (activitiesRes.error) throw activitiesRes.error;
      if (groupsRes.error) throw groupsRes.error;

      setActivities(activitiesRes.data || []);
      setGroups(groupsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DailyTasksList
        userId={userId}
        activities={activities}
        groups={groups}
        onRefresh={loadData}
      />
    </div>
  );
}
