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

  // Use local date, NOT toISOString() which is UTC and can show yesterday
  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const canEdit = (entryDate: string) => {
    const todayStr = getLocalDateString();
    const today = new Date(todayStr + "T00:00:00");
    const entry = new Date(entryDate + "T00:00:00");
    const diffTime = today.getTime() - entry.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
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

  const getTodayDate = () => getLocalDateString();

  // Build an ordered list of the past 7 days (today first)
  const last7Days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(getLocalDateString(d));
  }

  const entryByDate = new Map(entries.map((e) => [e.entry_date, e]));

  // Entries older than 7 days
  const last7Set = new Set(last7Days);
  const olderEntries = entries.filter((e) => !last7Set.has(e.entry_date!));

  return (
    <div className="space-y-3">
      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading your journal entries...
        </div>
      )}

      {!loading && (
        <>
          {/* Past 7 days in order */}
          {last7Days.map((dateStr) => {
            const entry = entryByDate.get(dateStr);
            const label = formatDate(dateStr);

            if (!entry) {
              // Empty slot — compact add button
              return (
                <button
                  key={dateStr}
                  onClick={() => router.push(`/journal/${dateStr}`)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                >
                  <span>{label}</span>
                  <Plus className="h-4 w-4 shrink-0" />
                </button>
              );
            }

            // Existing entry card
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
                        <div className="flex relative">
                          <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-2xl bg-background">
                            {entry.day_emoji || "📅"}
                          </div>
                          <div className="w-5 h-5 absolute -right-1 bottom-0 text-[16px] p-0 m-0 leading-none">
                            {qualityEmoji}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{label}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              entry.entry_date! + "T00:00:00",
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
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

          {/* Older entries */}
          {olderEntries.map((entry) => {
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
                        <div className="flex relative">
                          <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-2xl bg-background">
                            {entry.day_emoji || "📅"}
                          </div>
                          <div className="w-5 h-5 absolute -right-1 bottom-0 text-[16px] p-0 m-0 leading-none">
                            {qualityEmoji}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {formatDate(entry.entry_date!)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(
                              entry.entry_date! + "T00:00:00",
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
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
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {entries.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No journal entries yet. Write your first one above!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
