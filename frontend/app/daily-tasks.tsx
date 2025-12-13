import { createClient } from "@/lib/supabase/server";
import { Suspense, useCallback } from "react";
import { type User } from "@supabase/supabase-js";

export default function DailyTasks({ user }: { user: User | null }) {
  const retrieveTasks = useCallback(async () => {
    try {
      const supabase = await createClient();

      const { data, error, status } = await supabase
        .from("daily_entries")
        .select(`id, day_start_at, completed_tasks`)
        .eq("user_id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      return data;
    } catch (error) {
      console.log("Error loading user data");
    }
  }, [user]);

  return (
    <div>
      <p>these are your tasks for today</p>
      <Suspense>{retrieveTasks().then()}</Suspense>
      {/* <Button onClick={AddDailyTask()} /> */}
    </div>
  );
}
