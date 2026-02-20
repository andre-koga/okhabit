"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tables, TablesInsert } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  X,
} from "lucide-react";

type Activity = Tables<"activities">;
type ActivityGroup = Tables<"activity_groups">;
type DailyEntry = Tables<"daily_entries">;
type ActivityPeriod = Tables<"activity_periods">;
type OneTimeTask = Tables<"one_time_tasks">;

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
  const [, setTick] = useState(0); // Force re-render every second
  const [oneTimeTasks, setOneTimeTasks] = useState<OneTimeTask[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const supabase = createClient();

  const dateString = currentDate.toISOString().split("T")[0];

  useEffect(() => {
    loadDailyEntry();
    loadActivityPeriods();
    loadOneTimeTasks();
  }, [currentDate, userId]);

  // Update time every second when there's an active activity
  useEffect(() => {
    if (!currentActivityId) return;

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentActivityId]);

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

  const loadOneTimeTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("one_time_tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateString)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setOneTimeTasks(data || []);
    } catch (error) {
      console.error("Error loading one-time tasks:", error);
    }
  };

  const createOneTimeTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      setAddingTask(true);
      const { data, error } = await supabase
        .from("one_time_tasks")
        .insert({
          user_id: userId,
          date: dateString,
          title: newTaskTitle.trim(),
          is_completed: false,
        })
        .select()
        .single();
      if (error) throw error;
      setOneTimeTasks((prev) => [...prev, data]);
      setNewTaskTitle("");
      setShowAddTask(false);
    } catch (error) {
      console.error("Error creating one-time task:", error);
    } finally {
      setAddingTask(false);
    }
  };

  const toggleOneTimeTask = async (task: OneTimeTask) => {
    const newVal = !task.is_completed;
    setOneTimeTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_completed: newVal } : t)),
    );
    await supabase
      .from("one_time_tasks")
      .update({ is_completed: newVal })
      .eq("id", task.id);
  };

  const deleteOneTimeTask = async (taskId: string) => {
    setOneTimeTasks((prev) => prev.filter((t) => t.id !== taskId));
    await supabase.from("one_time_tasks").delete().eq("id", taskId);
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
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
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

  const completionRate = (() => {
    const nonNeverTasks = dailyActivities.filter((a) => a.routine !== "never");
    if (nonNeverTasks.length === 0) return 0;
    const completedNonNeverTasks = completedTasks.filter((taskId) => {
      const activity = dailyActivities.find((a) => a.id === taskId);
      return activity && activity.routine !== "never";
    }).length;
    return Math.round((completedNonNeverTasks / nonNeverTasks.length) * 100);
  })();

  const nonNeverTasksCount = dailyActivities.filter(
    (a) => a.routine !== "never",
  ).length;
  const completedNonNeverTasksCount = completedTasks.filter((taskId) => {
    const activity = dailyActivities.find((a) => a.id === taskId);
    return activity && activity.routine !== "never";
  }).length;

  return (
    <div className="flex flex-col h-full">
      {/* Date Navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <button className="font-semibold text-sm hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent">
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(d) => d && setCurrentDate(d)}
                disabled={(d) => d > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {!isToday && (
            <button
              onClick={goToToday}
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Go to today"
              title="Go to today"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent transition-colors disabled:opacity-30"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Completion summary */}
      {dailyActivities.length > 0 && (
        <p className="text-xs text-muted-foreground text-right mb-2">
          {completedNonNeverTasksCount} / {nonNeverTasksCount} ({completionRate}
          %)
        </p>
      )}
      <div className="space-y-2 mt-4 flex-1">
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
            const isNeverTask = activity.routine === "never";
            const isCompleted = completedTasks.includes(activity.id);

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 border rounded-md hover:bg-accent"
              >
                {isNeverTask ? (
                  <div
                    onClick={() => toggleTask(activity.id)}
                    className={`flex items-center justify-center w-4 h-4 rounded border border-destructive cursor-pointer ${
                      isCompleted ? "bg-destructive" : "bg-transparent"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleTask(activity.id);
                      }
                    }}
                  >
                    {isCompleted && (
                      <X className="h-3 w-3 text-destructive-foreground" />
                    )}
                  </div>
                ) : (
                  <Checkbox
                    id={activity.id}
                    checked={completedTasks.includes(activity.id)}
                    onCheckedChange={() => toggleTask(activity.id)}
                  />
                )}
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
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-mono">
                    {formatTime(timeSpent)}
                  </span>
                )}
                <Button
                  size="sm"
                  variant={isCurrentActivity ? "default" : "ghost"}
                  onClick={() => handleStartActivity(activity.id)}
                  title={
                    isCurrentActivity
                      ? "Stop this activity"
                      : "Start this activity"
                  }
                >
                  {isCurrentActivity ? (
                    <Square className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            );
          })}
      </div>

      {/* One-time Tasks */}
      {oneTimeTasks.length > 0 && (
        <div className="space-y-2 mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            One-time Tasks
          </p>
          {oneTimeTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 border rounded-md hover:bg-accent"
            >
              <Checkbox
                id={`ott-${task.id}`}
                checked={task.is_completed ?? false}
                onCheckedChange={() => toggleOneTimeTask(task)}
              />
              <label
                htmlFor={`ott-${task.id}`}
                className={`flex-1 text-sm cursor-pointer ${
                  task.is_completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </label>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => deleteOneTimeTask(task.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Quick-add overlay */}
      {showAddTask && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-24"
          onClick={() => setShowAddTask(false)}
        >
          <div
            className="bg-background border rounded-xl shadow-xl p-4 mx-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold mb-3">New one-time task</p>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createOneTimeTask();
                  if (e.key === "Escape") setShowAddTask(false);
                }}
                placeholder="Task title…"
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="sm"
                onClick={createOneTimeTask}
                disabled={addingTask || !newTaskTitle.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddTask((v) => !v)}
        className="fixed bottom-24 right-4 z-40 h-12 w-12 rounded-xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {showAddTask ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  );
}
