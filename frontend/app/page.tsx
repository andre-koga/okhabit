import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, Folder, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

async function DashboardOverview() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;

  if (error || !uid) {
    redirect("/auth/login");
  }

  // Fetch summary data
  const [groupsData, activitiesData, todayEntries] = await Promise.all([
    supabase.from("activity_groups").select("*").eq("user_id", uid),
    supabase.from("activities").select("*").eq("user_id", uid),
    supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", uid)
      .gte("date", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
      .lte("date", new Date(new Date().setHours(23, 59, 59, 999)).toISOString())
      .single(),
  ]);

  const groupsCount = groupsData.data?.length || 0;
  const activitiesCount = activitiesData.data?.length || 0;
  const completedToday = todayEntries.data?.completed_tasks?.length || 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">OKHabit</h1>
        <p className="text-muted-foreground">Track your habits, build routines</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activitiesCount}</div>
            <p className="text-xs text-muted-foreground">{groupsCount} groups</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Link href="/tasks">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <ListTodo className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Daily Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Check off your habits for today
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/activities">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Folder className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Manage Activities</h3>
                <p className="text-sm text-muted-foreground">
                  Create and organize your habits
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/timer">
          <Card className="hover:bg-accent transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Time Tracker</h3>
                <p className="text-sm text-muted-foreground">
                  Track time spent on activities
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default async function Home() {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <DashboardOverview />
      </Suspense>
    </main>
  );
}
