import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JournalForm from "@/components/journal-form";

interface JournalPageProps {
  params: Promise<{
    date: string;
  }>;
  searchParams: Promise<{
    edit?: string;
  }>;
}

export default async function JournalPage({
  params,
  searchParams,
}: JournalPageProps) {
  const { date } = await params;
  const { edit } = await searchParams;
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

  // Calculate if this entry can be edited (within last 7 days)
  const today = new Date();
  const entryDate = new Date(date);
  const diffTime = today.getTime() - entryDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const canEdit = diffDays <= 7;

  // Fetch existing journal entry for this date
  const { data: journalEntry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", uid)
    .eq("entry_date", date)
    .single();

  // Determine initial mode: edit if ?edit=true, view if entry exists and can't edit, otherwise edit
  const initialMode =
    edit === "true" || !journalEntry || canEdit ? "edit" : "view";

  return (
    <div className="min-h-screen p-8 pb-24">
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
        <JournalForm
          userId={uid}
          date={date}
          existingEntry={journalEntry}
          canEdit={canEdit}
          initialMode={initialMode}
        />
      </div>
    </div>
  );
}
