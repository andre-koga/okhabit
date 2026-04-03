import {
  FormDateField,
  FormDialog,
  FormDialogActions,
  FormField,
  FormSelectField,
  FormStack,
} from "@/components/forms";
import { getActivityDisplayName } from "@/lib/activity";
import { fromDateString, timeToSeconds, toDateString } from "@/lib/time-utils";
import { useSessionDetails } from "@/components/activities/hooks/use-session-details";
import { useCallback } from "react";

interface SessionDetailsDialogProps {
  groupId: string;
  sessionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionUpdated?: () => void;
}

export default function SessionDetailsDialog({
  groupId,
  sessionId,
  open,
  onOpenChange,
  onSessionUpdated,
}: SessionDetailsDialogProps) {
  const normalizeTimeWithPreservedSeconds = (
    nextTime: string,
    previousTime: string
  ) => {
    if (!nextTime) return "";
    const nextParts = nextTime.split(":");
    const previousSeconds = previousTime.split(":")[2] ?? "00";

    if (nextParts.length >= 3) {
      // Some mobile time pickers reopen with seconds snapped to 00.
      // Keep the previously stored seconds to avoid silent precision loss.
      if (nextParts[2] === "00" && previousSeconds !== "00") {
        return `${nextParts[0]}:${nextParts[1]}:${previousSeconds}`;
      }
      return nextTime;
    }
    return `${nextTime}:${previousSeconds}`;
  };

  const handleDone = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const {
    NONE_ACTIVITY_VALUE,
    loading,
    saving,
    error,
    details,
    isRunningSession,
    groupActivities,
    selectedActivityId,
    setSelectedActivityId,
    selectedDate,
    setSelectedDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    handleDelete,
    handleSave,
    today,
  } = useSessionDetails({
    groupId,
    sessionId: sessionId ?? undefined,
    onDone: handleDone,
    onUpdated: onSessionUpdated,
  });

  if (!sessionId) return null;

  const handleStartTimeChange = (newStartTime: string) => {
    const normalizedStartTime = normalizeTimeWithPreservedSeconds(
      newStartTime,
      startTime
    );
    setStartTime(normalizedStartTime);
    if (
      endTime &&
      timeToSeconds(endTime) < timeToSeconds(normalizedStartTime)
    ) {
      setEndTime(normalizedStartTime);
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    const normalizedEndTime = normalizeTimeWithPreservedSeconds(
      newEndTime,
      endTime
    );
    if (
      startTime &&
      timeToSeconds(normalizedEndTime) < timeToSeconds(startTime)
    ) {
      setEndTime(startTime);
      return;
    }
    setEndTime(normalizedEndTime);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Session Details"
      contentClassName="max-h-[90vh] overflow-y-auto sm:max-w-xl"
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !details ? (
        <p className="text-sm text-muted-foreground">Session not found.</p>
      ) : (
        <FormStack>
          <FormSelectField
            id="session-group"
            label="Group"
            value={details.group.id}
            onValueChange={() => undefined}
            options={[{ value: details.group.id, label: details.group.name }]}
            disabled
          />
          <FormSelectField
            id="session-activity"
            label="Activity"
            value={selectedActivityId}
            onValueChange={setSelectedActivityId}
            options={[
              { value: NONE_ACTIVITY_VALUE, label: "None" },
              ...groupActivities.map((activity) => ({
                value: activity.id,
                label: getActivityDisplayName(activity, details.group),
              })),
            ]}
          />
          <FormDateField
            id="session-date"
            label="Date"
            value={toDateString(selectedDate)}
            max={toDateString(today)}
            readOnly={isRunningSession}
            onChange={(event) => {
              if (isRunningSession || !event.target.value) return;
              setSelectedDate(fromDateString(event.target.value));
            }}
          />
          <FormField
            id="session-start-time"
            label="Start time"
            type="time"
            step={1}
            value={startTime}
            onChange={(event) => handleStartTimeChange(event.target.value)}
          />
          {isRunningSession ? (
            <FormField
              id="session-end-time-running"
              label="End time"
              value="Still running"
              readOnly
            />
          ) : (
            <FormField
              id="session-end-time"
              label="End time"
              type="time"
              step={1}
              value={endTime}
              onChange={(event) => handleEndTimeChange(event.target.value)}
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <FormDialogActions
            onConfirm={handleSave}
            confirmLabel={saving ? "Saving..." : "Save"}
            confirmDisabled={saving}
            secondaryAction={{
              label: "Delete",
              onClick: handleDelete,
              destructive: true,
            }}
          />
        </FormStack>
      )}
    </FormDialog>
  );
}
