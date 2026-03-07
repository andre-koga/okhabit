import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { db, newId, now } from "@/lib/db";
import type {
  Activity,
  ActivityGroup,
  ActivityPeriod,
  DailyEntry,
} from "@/lib/db/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getOrCreateHiddenGroupDefaultActivity,
  isHiddenGroupDefaultActivity,
} from "@/lib/activity-utils";

const NONE_ACTIVITY_VALUE = "__none__";

interface SessionDetails {
  group: ActivityGroup;
  activity: Activity | null;
  period: ActivityPeriod;
  entry: DailyEntry | undefined;
}

function fromDateString(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeInput(isoTime: string | null): string {
  if (!isoTime) return "";
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function combineDateAndTime(date: Date, time: string): string {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  const nextDate = new Date(date);
  nextDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);
  return nextDate.toISOString();
}

function shiftDate(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function startOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function shiftTimeByMinutes(time: string, deltaMinutes: number): string {
  if (!time) return "";
  const [hours, minutes, seconds = 0] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const total = (hours * 60 + minutes + deltaMinutes + 24 * 60) % (24 * 60);
  const nextHours = String(Math.floor(total / 60)).padStart(2, "0");
  const nextMinutes = String(total % 60).padStart(2, "0");
  const nextSeconds = String(seconds).padStart(2, "0");
  return `${nextHours}:${nextMinutes}:${nextSeconds}`;
}

function timeToSeconds(time: string): number {
  if (!time) return 0;
  const [hours, minutes, seconds = 0] = time.split(":").map(Number);
  return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
}

export default function SessionDetailsPage() {
  const { groupId, sessionId } = useParams<{
    groupId: string;
    sessionId: string;
  }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [groupActivities, setGroupActivities] = useState<Activity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!groupId || !sessionId) {
        navigate("/");
        return;
      }

      const [group, period] = await Promise.all([
        db.activityGroups.get(groupId),
        db.activityPeriods.get(sessionId),
      ]);

      if (!group || group.deleted_at || !period || period.deleted_at) {
        navigate(`/activities/${groupId}`);
        return;
      }

      const activity = await db.activities.get(period.activity_id);
      if (activity && !activity.deleted_at && activity.group_id !== group.id) {
        navigate(`/activities/${groupId}`);
        return;
      }

      const [entry, activities] = await Promise.all([
        db.dailyEntries.get(period.daily_entry_id),
        db.activities
          .filter((item) => item.group_id === group.id && !item.deleted_at)
          .sortBy("created_at"),
      ]);

      const initialDate = entry?.date
        ? fromDateString(entry.date)
        : new Date(period.start_time);

      setDetails({
        group,
        activity:
          activity &&
          !activity.deleted_at &&
          !isHiddenGroupDefaultActivity(activity)
            ? activity
            : null,
        period,
        entry,
      });
      setGroupActivities(
        activities.filter((item) => !isHiddenGroupDefaultActivity(item)),
      );
      setSelectedActivityId(
        activity &&
          !activity.deleted_at &&
          !isHiddenGroupDefaultActivity(activity)
          ? activity.id
          : NONE_ACTIVITY_VALUE,
      );
      setSelectedDate(initialDate);
      setStartTime(formatTimeInput(period.start_time));
      setEndTime(formatTimeInput(period.end_time));
      setLoading(false);
    };

    void load();
  }, [groupId, sessionId, navigate]);

  const backPath = useMemo(() => {
    if (!groupId) return "/";
    return `/activities/${groupId}`;
  }, [groupId]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const isSelectedDateToday =
    startOfDay(selectedDate).getTime() === today.getTime();

  const handleDelete = async () => {
    if (!sessionId) return;
    try {
      await db.activityPeriods.update(sessionId, {
        deleted_at: now(),
        updated_at: now(),
      });
      navigate(backPath);
    } catch (deleteError) {
      console.error("Error deleting session:", deleteError);
    }
  };

  const handleSave = async () => {
    if (!sessionId || !details) return;

    if (!startTime) {
      setError("Please set a start time.");
      return;
    }

    const nextStartIso = combineDateAndTime(selectedDate, startTime);
    const nextEndIso = endTime
      ? combineDateAndTime(selectedDate, endTime)
      : null;

    if (
      nextEndIso &&
      new Date(nextEndIso).getTime() < new Date(nextStartIso).getTime()
    ) {
      setError("End time cannot be before start time.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const selectedDateString = toDateString(selectedDate);
      const existingEntry = await db.dailyEntries
        .where("date")
        .equals(selectedDateString)
        .filter((entry) => !entry.deleted_at)
        .first();

      let dailyEntryId = existingEntry?.id;
      if (!dailyEntryId) {
        const timestamp = now();
        const created: DailyEntry = {
          id: newId(),
          date: selectedDateString,
          task_counts: {},
          current_activity_id: null,
          created_at: timestamp,
          updated_at: timestamp,
          synced_at: null,
          deleted_at: null,
        };
        await db.dailyEntries.add(created);
        dailyEntryId = created.id;
      }

      const nextActivityId =
        selectedActivityId === NONE_ACTIVITY_VALUE
          ? (await getOrCreateHiddenGroupDefaultActivity(details.group)).id
          : selectedActivityId;

      await db.activityPeriods.update(sessionId, {
        activity_id: nextActivityId,
        daily_entry_id: dailyEntryId,
        start_time: nextStartIso,
        end_time: nextEndIso,
        updated_at: now(),
      });

      navigate(backPath);
    } catch (saveError) {
      console.error("Error saving session:", saveError);
      setError("Failed to save session. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading...</div>;
  }

  if (!details) return null;

  return (
    <div className="px-4 pt-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Session Details</h1>
          <button
            onClick={handleDelete}
            className="h-8 px-2 gap-1 flex items-center justify-center rounded-full bg-background border hover:bg-destructive/20 border-destructive hover:text-destructive-foreground transition-colors"
            title="Delete session"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="text-xs pt-0.5">Delete</span>
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">Group</span>
            <span className="text-sm font-medium">{details.group.name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">Activity</span>
            <Select
              value={selectedActivityId}
              onValueChange={setSelectedActivityId}
            >
              <SelectTrigger className="w-36 border-none text-base">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_ACTIVITY_VALUE}>None</SelectItem>
                {groupActivities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>
                    {activity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">Date</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setSelectedDate((current) => shiftDate(current, -1))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button className="px-2 py-1 w-36 rounded-md hover:bg-accent transition-colors">
                    {formatDate(selectedDate)}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl overflow-hidden data-[side=bottom]:translate-y-0 data-[side=top]:translate-y-0 data-[side=left]:translate-x-0 data-[side=right]:translate-x-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setSelectedDate(date);
                      setDatePickerOpen(false);
                    }}
                    disabled={{ after: today }}
                    captionLayout="dropdown"
                    fixedWeeks
                    className="w-full [--cell-size:3rem]"
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={isSelectedDateToday}
                onClick={() =>
                  setSelectedDate((current) => shiftDate(current, 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm text-muted-foreground">Start Time</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const newStartTime = shiftTimeByMinutes(startTime, -5);
                  setStartTime(newStartTime);
                  if (
                    endTime &&
                    timeToSeconds(endTime) < timeToSeconds(newStartTime)
                  ) {
                    setEndTime(newStartTime);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="time"
                step={1}
                value={startTime}
                onChange={(event) => {
                  const newStartTime = event.target.value;
                  setStartTime(newStartTime);
                  if (
                    endTime &&
                    timeToSeconds(endTime) < timeToSeconds(newStartTime)
                  ) {
                    setEndTime(newStartTime);
                  }
                }}
                className="h-9 border-0 shadow-none w-36 bg-transparent mx-0 px-0 focus-visible:ring-0 focus-visible:outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const newStartTime = shiftTimeByMinutes(startTime, 5);
                  setStartTime(newStartTime);
                  if (
                    endTime &&
                    timeToSeconds(endTime) < timeToSeconds(newStartTime)
                  ) {
                    setEndTime(newStartTime);
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">End Time</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const newEndTime = shiftTimeByMinutes(endTime, -5);
                  if (
                    startTime &&
                    timeToSeconds(newEndTime) < timeToSeconds(startTime)
                  ) {
                    setEndTime(startTime);
                  } else {
                    setEndTime(newEndTime);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="time"
                step={1}
                value={endTime}
                onChange={(event) => {
                  const newEndTime = event.target.value;
                  if (
                    startTime &&
                    timeToSeconds(newEndTime) < timeToSeconds(startTime)
                  ) {
                    setEndTime(startTime);
                  } else {
                    setEndTime(newEndTime);
                  }
                }}
                className="h-9 border-0 mx-0 px-0 w-36 shadow-none bg-transparent focus-visible:ring-0 focus-visible:outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const newEndTime = shiftTimeByMinutes(endTime, 5);
                  if (
                    startTime &&
                    timeToSeconds(newEndTime) < timeToSeconds(startTime)
                  ) {
                    setEndTime(startTime);
                  } else {
                    setEndTime(newEndTime);
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      </div>

      <button
        onClick={() => navigate(backPath)}
        className="fixed bottom-6 left-6 z-50 h-10 w-10 border border-border flex items-center justify-center rounded-full bg-background shadow-md text-muted-foreground hover:text-foreground transition-colors"
        title="Back"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full shadow-lg px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
