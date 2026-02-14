"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { Tables } from "@/lib/supabase/types";

type JournalEntry = Tables<"journal_entries">;

interface JournalListProps {
  userId: string;
}

const QUALITY_EMOJIS = ["😞", "😕", "😐", "😊", "🤩"];

export default function JournalList({ userId }: JournalListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadEntries();
  }, [userId]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error loading journal entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = (entryDate: string) => {
    const today = new Date();
    const entry = new Date(entryDate);
    const diffTime = today.getTime() - entry.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const hasTodayEntry = entries.some(
    (entry) => entry.entry_date === getTodayDate(),
  );

  return (
    <div className="space-y-4">
      {!hasTodayEntry && (
        <Card className="border-dashed border-2 hover:bg-accent cursor-pointer transition-colors">
          <CardContent className="p-6">
            <button
              onClick={() => router.push(`/journal/${getTodayDate()}`)}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-5 w-5" />
              <span className="text-lg">Write today's entry</span>
            </button>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading your journal entries...
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">No journal entries yet.</p>
          <Button onClick={() => router.push(`/journal/${getTodayDate()}`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Entry
          </Button>
        </div>
      )}

      {!loading &&
        entries.map((entry) => {
          const editable = canEdit(entry.entry_date!);
          const quality = entry.day_quality || 3;
          const qualityEmoji = QUALITY_EMOJIS[quality - 1];
          const textExcerpt = entry.text_content
            ? entry.text_content.length > 150
              ? entry.text_content.substring(0, 150) + "..."
              : entry.text_content
            : "No notes";

          return (
            <Card
              key={entry.id}
              className="hover:bg-accent transition-colors cursor-pointer"
              onClick={() => router.push(`/journal/${entry.entry_date}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{qualityEmoji}</span>
                      {entry.day_emoji && (
                        <span className="text-xl">{entry.day_emoji}</span>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-lg">
                          {formatDate(entry.entry_date!)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.entry_date!).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>
                    </div>
                    {entry.title && (
                      <p className="font-medium text-base mb-1">
                        {entry.title}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {textExcerpt}
                    </p>
                    {(entry.photo_urls || entry.video_url) && (
                      <div className="flex gap-2 mt-2">
                        {entry.photo_urls && (
                          <span className="text-xs bg-secondary px-2 py-1 rounded">
                            📷 {entry.photo_urls.length} photo
                            {entry.photo_urls.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {entry.video_url && (
                          <span className="text-xs bg-secondary px-2 py-1 rounded">
                            🎥 Video
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {editable && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/journal/${entry.entry_date}?edit=true`);
                      }}
                      title="Edit entry"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
