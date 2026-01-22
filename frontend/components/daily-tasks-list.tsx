"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tables, TablesInsert } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type Activity = Tables<"activities">;
type DailyEntry = Tables<"daily_entries">;

interface DailyTasksListProps {
  userId: string;
  activities: Activity[];
  onRefresh: () => void;
}

export default function DailyTasksList({
  userId,
  activities,
  onRefresh,
}: DailyTasksListProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const dateString = currentDate.toISOString().split("T")[0];

  useEffect(() => {
    loadDailyEntry();
  }, [currentDate, userId]);

  const loadDailyEntry = async () => {
    try {
      setLoading(true);
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startOfDay.toISOString())
        .lte("date", endOfDay.toISOString())
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setDailyEntry(data);
      setCompletedTasks(data?.completed_tasks || []);
    } catch (error) {
      console.error("Error loading daily entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (activityId: string) => {
    try {
      const newCompletedTasks = completedTasks.includes(activityId)
        ? completedTasks.filter((id) => id !== activityId)
        : [...completedTasks, activityId];

      setCompletedTasks(newCompletedTasks);

      if (dailyEntry) {
        // Update existing entry
        const { error } = await supabase
          .from("daily_entries")
          .update({ completed_tasks: newCompletedTasks })
          .eq("id", dailyEntry.id);

        if (error) throw error;
      } else {
        // Create new entry
        const insertPayload: TablesInsert<"daily_entries"> = {
          user_id: userId,
          date: new Date(currentDate).toISOString(),
          completed_tasks: newCompletedTasks,
        };

        const { data, error } = await supabase
          .from("daily_entries")
          .insert(insertPayload)
          .select()
          .single();

        if (error) throw error;
        setDailyEntry(data);
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      // Revert on error
      loadDailyEntry();
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = dateString === new Date().toISOString().split("T")[0];

  // Filter activities that should be shown for the current date
  const shouldShowActivity = (activity: Activity) => {
    const routine = activity.routine || "daily";

    if (routine === "daily") return true;

    if (routine.startsWith("weekly:")) {
      const days = routine.split(":")[1].split(",").map(Number);
      const currentDay = currentDate.getDay();
      return days.includes(currentDay);
    }

    if (routine.startsWith("monthly:")) {
      const day = parseInt(routine.split(":")[1]);
      return currentDate.getDate() === day;
    }

    if (routine.startsWith("custom:")) {
      const parts = routine.split(":");
      const interval = parseInt(parts[1]);
      const unit = parts[2];

      // For custom routines, we'd need a reference date (e.g., activity creation date)
      // For now, we'll show them daily as a fallback
      // TODO: Implement proper custom interval logic with reference dates
      return true;
    }

    return routine === "daily" || !routine;
  };

  const dailyActivities = activities.filter(shouldShowActivity);

  const completionRate =
    dailyActivities.length > 0
      ? Math.round((completedTasks.length / dailyActivities.length) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Daily Tasks
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={isToday ? "default" : "outline"}
              onClick={goToToday}
            >
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={() => changeDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {dailyActivities.length > 0 && (
            <p className="text-muted-foreground">
              {completedTasks.length} / {dailyActivities.length} (
              {completionRate}
              %)
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Loading...
          </p>
        )}
        {!loading && dailyActivities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No daily activities yet. Create some activities to track!
          </p>
        )}
        {!loading &&
          dailyActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 border rounded-md hover:bg-accent"
            >
              <Checkbox
                id={activity.id}
                checked={completedTasks.includes(activity.id)}
                onCheckedChange={() => toggleTask(activity.id)}
              />
              <label
                htmlFor={activity.id}
                className="flex items-center gap-2 flex-1 cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activity.color || "#10b981" }}
                />
                <span
                  className={
                    completedTasks.includes(activity.id)
                      ? "line-through text-muted-foreground"
                      : ""
                  }
                >
                  {activity.name}
                </span>
              </label>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
