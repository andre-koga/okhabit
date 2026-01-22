import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import TasksPageContent from "@/components/tasks-page-content";

async function TasksContent() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;

  if (error || !uid) {
    redirect("/auth/login");
  }

  return <TasksPageContent userId={uid} />;
}

export default async function TasksPage() {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        }
      >
        <TasksContent />
      </Suspense>
    </main>
  );
}
