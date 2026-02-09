"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tables, TablesInsert } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, ChevronLeft, ChevronRight, Play } from "lucide-react";

type Activity = Tables<"activities">;
type ActivityGroup = Tables<"activity_groups">;
type DailyEntry = Tables<"daily_entries">;
type ActivityPeriod = Tables<"activity_periods">;

interface DailyTasksListProps {
  userId: string;
  activities: Activity[];
  groups: ActivityGroup[];
  onRefresh: () => void;
}

export default function DailyTasksList({
  userId,
  activities,
  groups,
  onRefresh,
}: DailyTasksListProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activityPeriods, setActivityPeriods] = useState<ActivityPeriod[]>([]);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(
    null,
  );

  const supabase = createClient();

  const dateString = currentDate.toISOString().split("T")[0];

  useEffect(() => {
    loadDailyEntry();
    loadActivityPeriods();
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
        .maybeSingle();

      if (error) {
        throw error;
      }

      setDailyEntry(data);
      setCompletedTasks(data?.completed_tasks || []);
      setCurrentActivityId(data?.current_activity_id || null);
    } catch (error) {
      console.error("Error loading daily entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityPeriods = async () => {
    try {
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // First get the daily entry for this date
      const { data: dayEntry } = await supabase
        .from("daily_entries")
        .select("id")
        .eq("user_id", userId)
        .gte("date", startOfDay.toISOString())
        .lte("date", endOfDay.toISOString())
        .maybeSingle();

      if (!dayEntry) {
        setActivityPeriods([]);
        return;
      }

      const { data, error } = await supabase
        .from("activity_periods")
        .select("*")
        .eq("daily_entry_id", dayEntry.id)
        .order("start_time");

      if (error) throw error;
      setActivityPeriods(data || []);
    } catch (error) {
      console.error("Error loading activity periods:", error);
    }
  };

  const calculateActivityTime = (activityId: string): number => {
    const periods = activityPeriods.filter((p) => p.activity_id === activityId);

    return periods.reduce((total, period) => {
      const start = new Date(period.start_time).getTime();
      const end = period.end_time
        ? new Date(period.end_time).getTime()
        : Date.now();
      return total + (end - start);
    }, 0);
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleStartActivity = async (activityId: string) => {
    if (!dailyEntry) {
      alert("Please wake up first from the home page.");
      return;
    }

    if (currentActivityId === activityId) {
      return; // Already on this activity
    }

    try {
      const now = new Date();

      // Find and close the current activity period
      if (currentActivityId) {
        const { data: currentPeriod } = await supabase
          .from("activity_periods")
          .select("*")
          .eq("daily_entry_id", dailyEntry.id)
          .is("end_time", null)
          .maybeSingle();

        if (currentPeriod) {
          await supabase
            .from("activity_periods")
            .update({ end_time: now.toISOString() })
            .eq("id", currentPeriod.id);
        }
      }

      // Create new activity period
      await supabase.from("activity_periods").insert({
        user_id: userId,
        daily_entry_id: dailyEntry.id,
        activity_id: activityId,
        start_time: now.toISOString(),
        end_time: null,
      });

      // Update daily entry with new current activity
      await supabase
        .from("daily_entries")
        .update({ current_activity_id: activityId })
        .eq("id", dailyEntry.id);

      setCurrentActivityId(activityId);
      loadActivityPeriods();
    } catch (error) {
      console.error("Error switching activity:", error);
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

    if (routine === "anytime") return true;
    if (routine === "never") return true;
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

      if (!activity.created_at) return false;

      const creationDate = new Date(activity.created_at);
      creationDate.setHours(0, 0, 0, 0);

      const checkDate = new Date(currentDate);
      checkDate.setHours(0, 0, 0, 0);

      // Calculate difference based on unit
      if (unit === "days") {
        const daysDiff = Math.floor(
          (checkDate.getTime() - creationDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return daysDiff >= 0 && daysDiff % interval === 0;
      } else if (unit === "weeks") {
        const daysDiff = Math.floor(
          (checkDate.getTime() - creationDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const weeksDiff = Math.floor(daysDiff / 7);
        return (
          daysDiff >= 0 && weeksDiff % interval === 0 && daysDiff % 7 === 0
        );
      } else if (unit === "months") {
        // For months, check if it's the same day of month and the right month interval
        const monthsDiff =
          (checkDate.getFullYear() - creationDate.getFullYear()) * 12 +
          (checkDate.getMonth() - creationDate.getMonth());
        return (
          monthsDiff >= 0 &&
          monthsDiff % interval === 0 &&
          checkDate.getDate() === creationDate.getDate()
        );
      }

      return false;
    }

    return routine === "daily" || !routine;
  };

  const dailyActivities = activities.filter(shouldShowActivity);

  const getGroupColor = (activity: Activity): string => {
    const group = groups.find((g) => g.id === activity.group_id);
    return group?.color || "#cccccc";
  };

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
          dailyActivities.map((activity) => {
            const timeSpent = calculateActivityTime(activity.id);
            const isCurrentActivity = currentActivityId === activity.id;

            return (
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
                    style={{ backgroundColor: getGroupColor(activity) }}
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
                {timeSpent > 0 && (
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                    {formatTime(timeSpent)}
                  </span>
                )}
                <Button
                  size="sm"
                  variant={isCurrentActivity ? "default" : "ghost"}
                  onClick={() => handleStartActivity(activity.id)}
                  disabled={isCurrentActivity}
                  title={
                    isCurrentActivity
                      ? "Currently active"
                      : "Start this activity"
                  }
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
