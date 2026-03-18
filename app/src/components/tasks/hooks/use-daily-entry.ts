/**
 * SRP: Manages daily-entry state and persistence for counts, paused tasks, and break-day flags.
 */
import { useState, useCallback } from "react";
import { db, now, newId } from "@/lib/db";
import { getOrCreateDailyEntry as getOrCreateDailyEntryDb } from "@/lib/db/daily-entry";
import type { DailyEntry } from "@/lib/db/types";

function normalizeTaskCounts(entry: DailyEntry | null): Record<string, number> {
  return (entry?.task_counts as Record<string, number>) || {};
}

function normalizePausedTaskIds(entry: DailyEntry | null): string[] {
  return Array.isArray(entry?.paused_task_ids) ? entry.paused_task_ids : [];
}

function normalizeBreakDay(entry: DailyEntry | null): boolean {
  return Boolean(entry?.is_break_day);
}

export function useDailyEntry(dateString: string) {
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [pausedTaskIds, setPausedTaskIds] = useState<string[]>([]);
  const [isBreakDay, setIsBreakDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(
    null
  );
  const [currentMemoId, setCurrentMemoId] = useState<string | null>(null);

  const loadDailyEntry = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      try {
        if (!silent) setLoading(true);
        const entry = await db.dailyEntries
          .where("date")
          .equals(dateString)
          .filter((e) => !e.deleted_at)
          .first();
        setDailyEntry(entry || null);
        setTaskCounts(normalizeTaskCounts(entry ?? null));
        setPausedTaskIds(normalizePausedTaskIds(entry ?? null));
        setIsBreakDay(normalizeBreakDay(entry ?? null));
        setCurrentActivityId(entry?.current_activity_id || null);
        setCurrentMemoId(entry?.current_memo_id || null);
      } catch (error) {
        console.error("Error loading daily entry:", error);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [dateString]
  );

  const getOrCreateDailyEntry = useCallback(async (): Promise<DailyEntry> => {
    const entry = await getOrCreateDailyEntryDb(dateString);
    setDailyEntry(entry);
    setTaskCounts(normalizeTaskCounts(entry));
    setPausedTaskIds(normalizePausedTaskIds(entry));
    setIsBreakDay(normalizeBreakDay(entry));
    return entry;
  }, [dateString]);

  const incrementTask = useCallback(
    async (activityId: string, target: number) => {
      let newCounts: Record<string, number> = {};
      let newPausedTaskIds: string[] = [];
      setTaskCounts((prev) => {
        const current = prev[activityId] || 0;
        const next = current >= target ? 0 : current + 1;
        newCounts = { ...prev };
        if (next === 0) {
          delete newCounts[activityId];
        } else {
          newCounts[activityId] = next;
        }
        return newCounts;
      });
      setPausedTaskIds((prev) => {
        newPausedTaskIds = prev.filter((id) => id !== activityId);
        return newPausedTaskIds;
      });

      try {
        const entry = await db.dailyEntries
          .where("date")
          .equals(dateString)
          .filter((e) => !e.deleted_at)
          .first();
        if (entry) {
          await db.dailyEntries.update(entry.id, {
            task_counts: newCounts,
            paused_task_ids: newPausedTaskIds,
            updated_at: now(),
          });
          setDailyEntry({
            ...entry,
            task_counts: newCounts,
            paused_task_ids: newPausedTaskIds,
            updated_at: now(),
          });
        } else {
          const n = now();
          const newDbEntry: DailyEntry = {
            id: newId(),
            date: dateString,
            task_counts: newCounts,
            paused_task_ids: newPausedTaskIds,
            is_break_day: false,
            current_activity_id: null,
            current_memo_id: null,
            created_at: n,
            updated_at: n,
            synced_at: null,
            deleted_at: null,
          };
          await db.dailyEntries.add(newDbEntry);
          setDailyEntry(newDbEntry);
        }
      } catch (err) {
        console.error("Error persisting task count:", err);
        loadDailyEntry();
      }
    },
    [dateString, loadDailyEntry]
  );

  const toggleTaskPaused = useCallback(
    async (activityId: string) => {
      let nextPausedTaskIds: string[] = [];
      setPausedTaskIds((prev) => {
        nextPausedTaskIds = prev.includes(activityId)
          ? prev.filter((id) => id !== activityId)
          : [...prev, activityId];
        return nextPausedTaskIds;
      });

      try {
        const entry = await db.dailyEntries
          .where("date")
          .equals(dateString)
          .filter((e) => !e.deleted_at)
          .first();

        if (entry) {
          await db.dailyEntries.update(entry.id, {
            paused_task_ids: nextPausedTaskIds,
            updated_at: now(),
          });
          setDailyEntry({
            ...entry,
            paused_task_ids: nextPausedTaskIds,
            updated_at: now(),
          });
          return;
        }

        const n = now();
        const newDbEntry: DailyEntry = {
          id: newId(),
          date: dateString,
          task_counts: {},
          paused_task_ids: nextPausedTaskIds,
          is_break_day: false,
          current_activity_id: null,
          current_memo_id: null,
          created_at: n,
          updated_at: n,
          synced_at: null,
          deleted_at: null,
        };
        await db.dailyEntries.add(newDbEntry);
        setDailyEntry(newDbEntry);
      } catch (error) {
        console.error("Error toggling paused task:", error);
        loadDailyEntry();
      }
    },
    [dateString, loadDailyEntry]
  );

  const toggleBreakDay = useCallback(async () => {
    const nextIsBreakDay = !isBreakDay;
    setIsBreakDay(nextIsBreakDay);

    try {
      const entry = await db.dailyEntries
        .where("date")
        .equals(dateString)
        .filter((e) => !e.deleted_at)
        .first();

      if (entry) {
        await db.dailyEntries.update(entry.id, {
          is_break_day: nextIsBreakDay,
          updated_at: now(),
        });
        setDailyEntry({
          ...entry,
          is_break_day: nextIsBreakDay,
          updated_at: now(),
        });
        return;
      }

      const n = now();
      const newDbEntry: DailyEntry = {
        id: newId(),
        date: dateString,
        task_counts: {},
        paused_task_ids: [],
        is_break_day: nextIsBreakDay,
        current_activity_id: null,
        current_memo_id: null,
        created_at: n,
        updated_at: n,
        synced_at: null,
        deleted_at: null,
      };
      await db.dailyEntries.add(newDbEntry);
      setDailyEntry(newDbEntry);
    } catch (error) {
      console.error("Error toggling break day:", error);
      loadDailyEntry();
    }
  }, [dateString, isBreakDay, loadDailyEntry]);

  return {
    dailyEntry,
    taskCounts,
    pausedTaskIds,
    isBreakDay,
    loading,
    currentActivityId,
    setCurrentActivityId,
    currentMemoId,
    setCurrentMemoId,
    loadDailyEntry,
    getOrCreateDailyEntry,
    incrementTask,
    toggleTaskPaused,
    toggleBreakDay,
  };
}
