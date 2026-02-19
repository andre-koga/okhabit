"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Tables } from "@/lib/supabase/types";

type JournalEntry = Tables<"journal_entries">;

interface JournalCalendarProps {
  entries: JournalEntry[];
}

const QUALITY_COLORS: Record<number, string> = {
  1: "bg-red-400",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-green-400",
  5: "bg-blue-400",
};

export default function JournalCalendar({ entries }: JournalCalendarProps) {
  const router = useRouter();

  const entryByDate = new Map(entries.map((e) => [e.entry_date, e]));

  const handleDayClick = (day: Date) => {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    const ds = `${y}-${m}-${d}`;
    router.push(`/journal/${ds}`);
  };

  return (
    <div className="flex flex-col items-center">
      <Calendar
        mode="single"
        className="w-full"
        components={{
          DayButton: ({ day, ...buttonProps }) => {
            const y = day.date.getFullYear();
            const m = String(day.date.getMonth() + 1).padStart(2, "0");
            const d = String(day.date.getDate()).padStart(2, "0");
            const ds = `${y}-${m}-${d}`;
            const entry = entryByDate.get(ds);
            const dotColor = entry?.day_quality
              ? QUALITY_COLORS[entry.day_quality]
              : null;

            return (
              <button
                {...buttonProps}
                onClick={() => handleDayClick(day.date)}
                className="w-full h-14 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-accent transition-colors"
              >
                <span className="text-sm leading-none">
                  {entry?.day_emoji || day.date.getDate()}
                </span>
                {dotColor && (
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                )}
              </button>
            );
          },
        }}
      />

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground flex-wrap justify-center">
        {Object.entries(QUALITY_COLORS).map(([q, color]) => {
          const labels: Record<string, string> = {
            "1": "Bad",
            "2": "Poor",
            "3": "Okay",
            "4": "Good",
            "5": "Great",
          };
          return (
            <div key={q} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span>{labels[q]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
