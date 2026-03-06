import { useState, useCallback } from "react";
import { db, now, newId } from "@/lib/db";
import type { OneTimeTask } from "@/lib/db/types";

export function useOneTimeTasks(dateString: string) {
    const [oneTimeTasks, setOneTimeTasks] = useState<OneTimeTask[]>([]);

    const loadOneTimeTasks = useCallback(async () => {
        try {
            const tasks = await db.oneTimeTasks
                .where("date")
                .equals(dateString)
                .filter((t) => !t.deleted_at)
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
                    date: dateString,
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
        [dateString],
    );

    const toggleOneTimeTask = useCallback(async (task: OneTimeTask) => {
        const newVal = !task.is_completed;
        setOneTimeTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, is_completed: newVal } : t)),
        );
        await db.oneTimeTasks.update(task.id, {
            is_completed: newVal,
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
