import { useState, useCallback } from "react";
import { db, now, newId, todayStr } from "@/lib/db";
import type { OneTimeTask } from "@/lib/db/types";

export function useOneTimeTasks(dateString: string) {
  const [oneTimeTasks, setOneTimeTasks] = useState<OneTimeTask[]>([]);

  const loadOneTimeTasks = useCallback(async () => {
    try {
      const today = todayStr();

      if (dateString === today) {
        const [incompleteTasks, completedTodayTasks] = await Promise.all([
          db.oneTimeTasks
            .filter((task) => !task.deleted_at && !task.is_completed)
            .toArray(),
          db.oneTimeTasks
            .where("date")
            .equals(today)
            .filter((task) => !task.deleted_at && !!task.is_completed)
            .toArray(),
        ]);

        const tasks = [...incompleteTasks, ...completedTodayTasks].sort(
          (left, right) =>
            new Date(left.created_at).getTime() -
            new Date(right.created_at).getTime()
        );

        setOneTimeTasks(tasks);
        return;
      }

      const tasks = await db.oneTimeTasks
        .where("date")
        .equals(dateString)
        .filter((task) => !task.deleted_at && !!task.is_completed)
        .sortBy("created_at");

      setOneTimeTasks(tasks);
    } catch (error) {
      console.error("Error loading one-time tasks:", error);
    }
  }, [dateString]);

  const createOneTimeTask = useCallback(
    async (title: string): Promise<boolean> => {
      if (!title.trim()) return false;
      try {
        const n = now();
        const task: OneTimeTask = {
          id: newId(),
          date: null,
          title: title.trim(),
          is_completed: false,
          order_index: null,
          created_at: n,
          updated_at: n,
          synced_at: null,
          deleted_at: null,
        };
        await db.oneTimeTasks.add(task);
        setOneTimeTasks((prev) => [...prev, task]);
        return true;
      } catch (error) {
        console.error("Error creating one-time task:", error);
        return false;
      }
    },
    []
  );

  const toggleOneTimeTask = useCallback(async (task: OneTimeTask) => {
    const newVal = !task.is_completed;
    const completedDate = newVal ? todayStr() : null;
    setOneTimeTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, is_completed: newVal, date: completedDate }
          : t
      )
    );
    await db.oneTimeTasks.update(task.id, {
      is_completed: newVal,
      date: completedDate,
      updated_at: now(),
    });
  }, []);

  const deleteOneTimeTask = useCallback(async (taskId: string) => {
    setOneTimeTasks((prev) => prev.filter((t) => t.id !== taskId));
    await db.oneTimeTasks.delete(taskId);
  }, []);

  return {
    oneTimeTasks,
    loadOneTimeTasks,
    createOneTimeTask,
    toggleOneTimeTask,
    deleteOneTimeTask,
  };
}
