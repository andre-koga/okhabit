"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { TablesInsert } from "@/lib/supabase/types";
import { useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";

export default function DailyTasks({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const retrieveTasks = useCallback(async () => {
    try {
      setLoading(true);

      const supabase = createClient();

      const { data, error, status } = await supabase
        .from("daily_entries")
        .select(`id, date, completed_tasks`)
        .eq("user_id", userId);

      if (error && status !== 406) throw error;

      setTasks(data);
    } catch (error) {
      console.log("Error loading user data! ", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    retrieveTasks();
  }, [retrieveTasks]);

  const addTask = async () => {
    try {
      const supabase = createClient();

      const insertPayload: TablesInsert<"daily_entries"> = {
        completed_tasks: [],
        date: new Date().toISOString(),
        user_id: userId,
        id: v4(),
      };

      const { error } = await supabase
        .from("daily_entries")
        .upsert(insertPayload)
        .eq("dae", "");

      if (error) throw error;

      retrieveTasks();
    } catch (error) {
      console.log("Error inserting new task! ", error);
    }
  };

  return (
    <div>
      <p>these are your tasks for today</p>
      <Button onClick={retrieveTasks}>Load Tasks</Button>
      <Button onClick={addTask}>Add Task</Button>
      {loading && <p>Loading…</p>}
      {tasks && <pre>{JSON.stringify(tasks, null, 2)}</pre>}
    </div>
  );
}
