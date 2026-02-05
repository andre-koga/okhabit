import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Moon, Sun, User, Clock } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { UserPreferencesForm } from "@/components/user-preferences-form";

async function SettingsContent() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;

  if (error || !uid) {
    redirect("/auth/login");
  }

  const email = data.claims?.email as string;

  // Load user preferences - create user if doesn't exist
  let userData = null;
  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("typical_wake_time, typical_sleep_time")
    .eq("id", uid)
    .maybeSingle();

  if (existingUser) {
    userData = existingUser;
  } else if (!existingUser && !userError) {
    // User doesn't exist in public.users, create them
    const { data: newUser } = await supabase
      .from("users")
      .insert({
        id: uid,
        email: email,
      })
      .select("typical_wake_time, typical_sleep_time")
      .single();
    userData = newUser;
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Daily Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserPreferencesForm
            userId={uid}
            initialWakeTime={userData?.typical_wake_time ?? "07:00:00"}
            initialSleepTime={userData?.typical_sleep_time ?? "23:00:00"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <ThemeSwitcher />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/auth/sign-out" method="post">
            <Button
              type="submit"
              variant="destructive"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>OKHabit v1.0.0</p>
        <p className="mt-1">Built with Next.js & Supabase</p>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </main>
  );
}
