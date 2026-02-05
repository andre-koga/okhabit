"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { Sun, Moon } from "lucide-react";

type Activity = Tables<"activities">;
type DailyEntry = Tables<"daily_entries">;
type ActivityPeriod = Tables<"activity_periods">;

interface MinuteData {
  activity_id: string;
  color: string;
}

interface PixelGridProps {
  userId: string;
}

export default function PixelGrid({ userId }: PixelGridProps) {
  const [isAwake, setIsAwake] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null);
  const [activityPeriods, setActivityPeriods] = useState<
    (ActivityPeriod & { color: string })[]
  >([]);
  const [currentPeriod, setCurrentPeriod] = useState<ActivityPeriod | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  const supabase = createClient();

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load activities and daily entry
  useEffect(() => {
    loadActivities();
    loadTodayEntry();
  }, [userId]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const loadTodayEntry = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("date", today.toISOString())
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setDailyEntry(data);
        setIsAwake(data.is_awake || false);

        // Load current activity if awake
        if (data.current_activity_id) {
          const { data: activity } = await supabase
            .from("activities")
            .select("*")
            .eq("id", data.current_activity_id)
            .single();
          setCurrentActivity(activity);
        }

        // Load activity periods for today
        await loadActivityPeriods(data.id);
      }
    } catch (error) {
      console.error("Error loading today's entry:", error);
    }
  };

  const loadActivityPeriods = async (dailyEntryId: string) => {
    try {
      const { data, error } = await supabase
        .from("activity_periods")
        .select(
          `
          *,
          activities!inner(color)
        `,
        )
        .eq("daily_entry_id", dailyEntryId)
        .order("start_time");

      if (error) throw error;

      const periodsWithColor = (data || []).map((period: any) => ({
        ...period,
        color: period.activities.color,
      }));

      setActivityPeriods(periodsWithColor);

      // Find the current open period (end_time is null)
      const openPeriod = periodsWithColor.find((p) => !p.end_time);
      setCurrentPeriod(openPeriod || null);
    } catch (error) {
      console.error("Error loading activity periods:", error);
    }
  };

  const handleWakeUp = async () => {
    try {
      const now = new Date();

      // Create today's entry
      const { data: newEntry, error: entryError } = await supabase
        .from("daily_entries")
        .insert({
          user_id: userId,
          date: now.toISOString(),
          wake_time: now.toISOString(),
          is_awake: true,
          current_activity_id: activities[0]?.id || null,
        })
        .select()
        .single();

      if (entryError) throw entryError;

      // Create the first activity period
      const { data: newPeriod, error: periodError } = await supabase
        .from("activity_periods")
        .insert({
          user_id: userId,
          daily_entry_id: newEntry.id,
          activity_id: activities[0].id,
          start_time: now.toISOString(),
          end_time: null,
        })
        .select()
        .single();

      if (periodError) throw periodError;

      setDailyEntry(newEntry);
      setIsAwake(true);
      setCurrentActivity(activities[0] || null);
      setCurrentPeriod(newPeriod);
      await loadActivityPeriods(newEntry.id);
    } catch (error) {
      console.error("Error waking up:", error);
    }
  };

  const handleGoToSleep = async () => {
    if (!dailyEntry || !currentPeriod) return;

    try {
      const now = new Date();

      // Close the current activity period
      const { error: periodError } = await supabase
        .from("activity_periods")
        .update({ end_time: now.toISOString() })
        .eq("id", currentPeriod.id);

      if (periodError) throw periodError;

      // Update daily entry
      const { error } = await supabase
        .from("daily_entries")
        .update({
          sleep_time: now.toISOString(),
          is_awake: false,
          current_activity_id: null,
        })
        .eq("id", dailyEntry.id);

      if (error) throw error;

      setIsAwake(false);
      setCurrentActivity(null);
      setCurrentPeriod(null);
      await loadActivityPeriods(dailyEntry.id);
    } catch (error) {
      console.error("Error going to sleep:", error);
    }
  };

  const switchActivity = async (activity: Activity) => {
    if (!dailyEntry || !isAwake || !currentPeriod) return;
    if (activity.id === currentActivity?.id) return; // Same activity

    try {
      const now = new Date();

      // Close the current period
      const { error: closeError } = await supabase
        .from("activity_periods")
        .update({ end_time: now.toISOString() })
        .eq("id", currentPeriod.id);

      if (closeError) throw closeError;

      // Create new period
      const { data: newPeriod, error: periodError } = await supabase
        .from("activity_periods")
        .insert({
          user_id: userId,
          daily_entry_id: dailyEntry.id,
          activity_id: activity.id,
          start_time: now.toISOString(),
          end_time: null,
        })
        .select()
        .single();

      if (periodError) throw periodError;

      // Update current activity
      const { error } = await supabase
        .from("daily_entries")
        .update({ current_activity_id: activity.id })
        .eq("id", dailyEntry.id);

      if (error) throw error;

      setCurrentActivity(activity);
      setCurrentPeriod(newPeriod);
      await loadActivityPeriods(dailyEntry.id);
    } catch (error) {
      console.error("Error switching activity:", error);
    }
  };

  // Calculate which activity (if any) was active at a specific time
  const getActivityAtTime = (
    hour: number,
    minute: number,
  ): MinuteData | null => {
    if (!dailyEntry?.wake_time) return null;

    // Create a date for this specific minute
    const targetDate = new Date(dailyEntry.date!);
    targetDate.setHours(hour, minute, 0, 0);
    const targetTime = targetDate.getTime();

    // Check if this time is within wake/sleep bounds
    const wakeTime = new Date(dailyEntry.wake_time).getTime();
    const sleepTime = dailyEntry.sleep_time
      ? new Date(dailyEntry.sleep_time).getTime()
      : Date.now();

    if (targetTime < wakeTime || targetTime > sleepTime) {
      return null;
    }

    // Find which period contains this minute
    for (const period of activityPeriods) {
      const startTime = new Date(period.start_time).getTime();
      const endTime = period.end_time
        ? new Date(period.end_time).getTime()
        : Date.now();

      if (targetTime >= startTime && targetTime < endTime) {
        return {
          activity_id: period.activity_id,
          color: period.color || "#cccccc",
        };
      }
    }

    return null;
  };

  // Get color for a specific grid cell
  const getCellColor = (hour: number, minute: number): string => {
    const minuteData = getActivityAtTime(hour, minute);
    if (minuteData) {
      return minuteData.color;
    }

    // Highlight current minute if awake
    const now = currentTime;
    if (
      isAwake &&
      hour === now.getHours() &&
      minute === now.getMinutes() &&
      currentActivity
    ) {
      return currentActivity.color || "#cccccc";
    }

    return "transparent";
  };

  // Check if this is the current minute
  const isCurrentMinute = (hour: number, minute: number): boolean => {
    if (!isAwake) return false;
    const now = currentTime;
    return hour === now.getHours() && minute === now.getMinutes();
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header with Wake Up / Sleep button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {currentTime.toLocaleDateString()}
          </h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {!isAwake ? (
          <Button
            size="lg"
            onClick={handleWakeUp}
            disabled={activities.length === 0}
            className="gap-2"
          >
            <Sun className="h-5 w-5" />
            Wake Up
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleGoToSleep}
            variant="destructive"
            className="gap-2"
          >
            <Moon className="h-5 w-5" />
            Go to Sleep
          </Button>
        )}
      </div>

      {/* Current Activity Display */}
      {isAwake && currentActivity && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentActivity.color || "#cccccc" }}
              />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Current Activity
                </p>
                <p className="font-semibold text-lg">{currentActivity.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 24x60 Pixel Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-1 overflow-x-auto">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="flex gap-[1px]">
                {/* Hour label */}
                <div className="w-8 text-xs text-muted-foreground flex items-center justify-end pr-1 flex-shrink-0">
                  {hour}
                </div>
                {/* Minutes */}
                {Array.from({ length: 60 }, (_, minute) => (
                  <div
                    key={`${hour}-${minute}`}
                    className={`w-2 h-2 border border-border/20 flex-shrink-0 ${
                      isCurrentMinute(hour, minute)
                        ? "ring-2 ring-primary ring-offset-1"
                        : ""
                    }`}
                    style={{
                      backgroundColor: getCellColor(hour, minute),
                    }}
                    title={`${hour}:${minute.toString().padStart(2, "0")}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Switcher */}
      {isAwake && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Switch Activity</h3>
            <div className="grid grid-cols-2 gap-2">
              {activities.map((activity) => (
                <Button
                  key={activity.id}
                  onClick={() => switchActivity(activity)}
                  variant={
                    currentActivity?.id === activity.id ? "default" : "outline"
                  }
                  className="gap-2 justify-start"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activity.color || "#cccccc" }}
                  />
                  <span className="truncate">{activity.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup message if no activities */}
      {activities.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You need to create some activities first before you can start
              tracking your day!
            </p>
            <Button asChild>
              <a href="/activities">Create Activities</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
