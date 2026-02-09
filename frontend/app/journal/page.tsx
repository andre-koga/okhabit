import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JournalList from "@/components/journal-list";

export default async function JournalPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;

  if (error || !uid) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your daily experiences and track your well-being
          </p>
        </div>
        <JournalList userId={uid} />
      </div>
    </div>
  );
}
