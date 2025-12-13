import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DailyTasks from "./daily-tasks";
import { type User } from "@supabase/supabase-js";
import { Suspense } from "react";

async function UserDetails() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;

  if (error || !uid) {
    redirect("/auth/login");
  }

  console.log(uid);

  const { data: userRow, error: rowError } = await supabase
    .from("users")
    .select("*")
    .eq("id", uid)
    .single();

  console.log(userRow, "userrow");
  return <div></div>;

  const user = userRow as User;

  return <DailyTasks user={user} />;
}

export default async function Home() {
  return (
    <main className="flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Suspense fallback="Loading user data...">
            <UserDetails />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
