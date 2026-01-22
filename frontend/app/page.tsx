import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HabitTrackerDashboard from "@/components/habit-tracker-dashboard";
import { Suspense } from "react";

async function Dashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;

  if (error || !uid) {
    redirect("/auth/login");
  }

  return <HabitTrackerDashboard userId={uid} />;
}

export default async function Home() {
  return (
    <main className="flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-7xl p-5 w-full">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  Loading your dashboard...
                </p>
              </div>
            }
          >
            <Dashboard />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
