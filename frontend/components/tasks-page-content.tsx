"use client";

import { useState, useEffect, useCallback } from "react";
import { Tables } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import DailyTasksList from "@/components/daily-tasks-list";

type Activity = Tables<"activities">;

interface TasksPageContentProps {
  userId: string;
}

export default function TasksPageContent({ userId }: TasksPageContentProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

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
        onRefresh={loadActivities}
      />
    </div>
  );
}
