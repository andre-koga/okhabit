import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HabitTrackerDashboard from "@/components/habit-tracker-dashboard";
import { Suspense } from "react";

async function Dashboard() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const uid = data.claims.sub;

  return <HabitTrackerDashboard userId={uid} />;
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </div>
  );
}
