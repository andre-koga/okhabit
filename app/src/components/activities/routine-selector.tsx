import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface RoutineSelectorProps {
  routine: string;
  weeklyDays: number[];
  monthlyDay: number;
  customInterval: number | string;
  customUnit: "days" | "weeks" | "months";
  onRoutineChange: (routine: string) => void;
  onWeeklyDaysChange: (days: number[]) => void;
  onMonthlyDayChange: (day: number) => void;
  onCustomIntervalChange: (interval: number | string) => void;
  onCustomUnitChange: (unit: "days" | "weeks" | "months") => void;
}

export default function RoutineSelector({
  routine,
  weeklyDays,
  monthlyDay, // eslint-disable-line @typescript-eslint/no-unused-vars
  customInterval,
  customUnit,
  onRoutineChange,
  onWeeklyDaysChange,
  onMonthlyDayChange, // eslint-disable-line @typescript-eslint/no-unused-vars
  onCustomIntervalChange,
  onCustomUnitChange,
}: RoutineSelectorProps) {
  const toggleWeekday = (day: number) => {
    onWeeklyDaysChange(
      weeklyDays.includes(day)
        ? weeklyDays.filter((d) => d !== day)
        : [...weeklyDays, day]
    );
  };

  return (
    <div className="space-y-0">
      <Select value={routine} onValueChange={onRoutineChange}>
        <SelectTrigger className="!h-10 w-full rounded-full border-border bg-muted/40 px-4 text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="anytime">Anytime (no schedule)</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          {/* <SelectItem value="monthly">Monthly</SelectItem> */}
          <SelectItem value="custom">Custom</SelectItem>
          <SelectItem value="never">Never (avoid this)</SelectItem>
        </SelectContent>
      </Select>

      {routine === "weekly" && (
        <div className="pt-3">
          <div className="flex gap-2">
            {DAYS.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(index)}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                  weeklyDays.includes(index)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* {routine === "monthly" && (
        <div className="pt-3 space-y-2">
          <p className="text-xs font-semibold">Day of month:</p>
          <Input
            id="monthlyDay"
            type="number"
            min="1"
            max="31"
            value={monthlyDay}
            onChange={(e) => onMonthlyDayChange(parseInt(e.target.value) || 1)}
            className="w-24 h-10"
          />
        </div>
      )} */}

      {routine === "custom" && (
        <div className="pt-3">
          <div className="flex items-center gap-2">
            <span className="pl-2 text-base">Every</span>
            <input
              type="number"
              min="1"
              value={customInterval}
              onChange={(e) =>
                onCustomIntervalChange(
                  e.target.value === "" ? "" : parseInt(e.target.value)
                )
              }
              className="h-10 w-20 rounded-full border border-border bg-muted/40 px-4 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Select value={customUnit} onValueChange={onCustomUnitChange}>
              <SelectTrigger className="!h-10 flex-1 rounded-full border-border bg-muted/40 px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
