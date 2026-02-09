import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JournalForm from "@/components/journal-form";

interface JournalPageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function JournalPage({ params }: JournalPageProps) {
  const { date } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;

  if (error || !uid) {
    redirect("/auth/login");
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    redirect("/");
  }

  // Fetch existing journal entry for this date
  const { data: journalEntry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", uid)
    .eq("entry_date", date)
    .single();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Daily Journal</h1>
          <p className="text-muted-foreground">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <JournalForm userId={uid} date={date} existingEntry={journalEntry} />
      </div>
    </div>
  );
}
