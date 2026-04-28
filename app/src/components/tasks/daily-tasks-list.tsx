import { useMemo, useState } from "react";
import type { Activity, ActivityGroup } from "@/lib/db/types";
import ActivityTaskItem from "./activity-task-item";
import ActivityTimelineItem from "./activity-timeline-item";
import OneTimeTaskItem from "./one-time-task-item";
import ActiveActivityPill from "./active-activity-pill";
import AssignActivityDialog from "./assign-activity-dialog";
import FooterActionsBar from "./footer-actions-bar";
import { useDailyTasks } from "./hooks/use-daily-tasks";
import ManualTimeEntryDialog from "./manual-time-entry-dialog";
import { Palmtree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SessionDetailsDialog from "@/components/activities/session-details-dialog";
import { FormSelectField } from "@/components/forms";

export type DailyTasksState = ReturnType<typeof useDailyTasks>;

interface DailyTasksListProps {
  activities: Activity[];
  groups: ActivityGroup[];
  daily: DailyTasksState;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  entryDates: Set<string>;
  bookmarkedDates: Set<string>;
  loadJournalMeta: () => Promise<void>;
  onTasksDataChanged?: () => void;
}

export default function DailyTasksList({
  activities,
  groups,
  daily,
  currentDate,
  onDateChange,
  entryDates,
  bookmarkedDates,
  loadJournalMeta,
  onTasksDataChanged,
}: DailyTasksListProps) {
  const [assignPeriodId, setAssignPeriodId] = useState<string | null>(null);
  const [assignIntervalMs, setAssignIntervalMs] = useState(0);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<{
    groupId: string;
    sessionId: string;
  } | null>(null);
  const [manualEntryActivityId, setManualEntryActivityId] = useState<
    string | null
  >(null);
  const [memoFilter, setMemoFilter] = useState("all");

  const {
    isToday,
    loading,
    activityStreaks,
    dailyActivities,
    getGroup,
    timelineSessions,
    currentActivityId,
    taskCounts,
    pausedTaskIds,
    isBreakDay,
    oneTimeTasks,
    createOneTimeTask,
    toggleOneTimeTask,
    deleteOneTimeTask,
    updateOneTimeTask,
    incrementTask,
    incrementNeverSlip,
    resetNeverTaskCount,
    toggleBreakDay,
    handleStartActivity,
    handleStopActivity,
    runningSession,
    currentActivityElapsedMs,
    loadActivityPeriods,
    calculateActivityTime,
    calculateActivityTotalTime,
    addManualActivityPeriod,
    formatTimerDisplay,
  } = daily;
  const pausedTaskIdSet = new Set(pausedTaskIds);
  const manualEntryActivity = manualEntryActivityId
    ? (activities.find((item) => item.id === manualEntryActivityId) ?? null)
    : null;
  const manualEntryGroup = manualEntryActivity
    ? getGroup(manualEntryActivity)
    : undefined;
  const activeGroups = useMemo(
    () => groups.filter((group) => !group.deleted_at && !group.is_archived),
    [groups]
  );
  const groupOptions = useMemo(
    () =>
      activeGroups.map((group) => ({
        value: group.id,
        label: group.name,
        emoji: group.emoji,
        color: group.color,
      })),
    [activeGroups]
  );
  const memoFilterOptions = useMemo(
    () => [
      { value: "all", label: "All projects" },
      { value: "no-project", label: "Uncategorized" },
      ...activeGroups.map((group) => ({
        value: `group:${group.id}`,
        label: (
          <span className="flex items-center gap-2">
            {group.emoji ? (
              <span className="shrink-0 text-sm" aria-hidden>
                {group.emoji}
              </span>
            ) : null}
            <span className="truncate">{group.name}</span>
          </span>
        ),
      })),
    ],
    [activeGroups]
  );
  const effectiveMemoFilter = useMemo(() => {
    if (memoFilter === "all" || memoFilter === "no-project") {
      return memoFilter;
    }
    if (!memoFilter.startsWith("group:")) {
      return "all";
    }
    const groupId = memoFilter.replace("group:", "");
    return activeGroups.some((group) => group.id === groupId)
      ? memoFilter
      : "all";
  }, [activeGroups, memoFilter]);
  const filteredMemos = useMemo(() => {
    if (effectiveMemoFilter === "all") return oneTimeTasks;
    if (effectiveMemoFilter === "no-project") {
      return oneTimeTasks.filter((task) => !task.group_id);
    }
    if (!effectiveMemoFilter.startsWith("group:")) return oneTimeTasks;
    const groupId = effectiveMemoFilter.replace("group:", "");
    return oneTimeTasks.filter((task) => task.group_id === groupId);
  }, [effectiveMemoFilter, oneTimeTasks]);

  const openAssignDialog = (periodId: string, intervalMs: number) => {
    setAssignPeriodId(periodId);
    setAssignIntervalMs(intervalMs);
    setAssignDialogOpen(true);
  };

  const handleAssignSuccess = () => {
    void loadActivityPeriods();
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <p className="mr-auto text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Memos
          </p>
          <FormSelectField
            id="memo-filter"
            label="Filter memos by project"
            labelClassName="sr-only"
            value={effectiveMemoFilter}
            onValueChange={setMemoFilter}
            options={memoFilterOptions}
            containerClassName="w-44 space-y-0"
            triggerClassName="h-8 text-xs rounded-full"
          />
        </div>
        {filteredMemos.length > 0 ? (
          filteredMemos.map((task) => (
            <OneTimeTaskItem
              key={task.id}
              task={task}
              isToday={isToday}
              groupOptions={groupOptions}
              onToggle={toggleOneTimeTask}
              onDelete={deleteOneTimeTask}
              onUpdate={updateOneTimeTask}
            />
          ))
        ) : (
          <p className="px-1 text-xs text-muted-foreground">
            No memos for this filter.
          </p>
        )}
      </div>

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        For Today
      </p>

      <div className="flex-1 space-y-2">
        {loading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        )}
        {!loading && dailyActivities.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No daily activities yet. Create some activities to track!
          </p>
        )}
        {!loading &&
          dailyActivities.map((activity) => (
            <ActivityTaskItem
              key={activity.id}
              activity={activity}
              group={getGroup(activity)}
              count={taskCounts[activity.id] || 0}
              streak={activityStreaks[activity.id] || 0}
              timeSpent={calculateActivityTime(activity.id)}
              isPaused={pausedTaskIdSet.has(activity.id)}
              isBreakDay={isBreakDay}
              isCurrentActivity={currentActivityId === activity.id}
              isToday={isToday}
              onIncrement={incrementTask}
              onNeverIncrement={() => incrementNeverSlip(activity.id)}
              onNeverReset={() => resetNeverTaskCount(activity.id)}
              onStartActivity={handleStartActivity}
              onStopActivity={handleStopActivity}
              onManualEntry={setManualEntryActivityId}
            />
          ))}
      </div>

      <div className="mt-4 flex flex-col items-center justify-center gap-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void toggleBreakDay();
          }}
          disabled={!isToday}
          className={cn(
            "inline-flex gap-1.5 rounded-full border-border bg-background px-4 py-1.5 text-xs font-medium disabled:cursor-default disabled:opacity-70",
            isBreakDay
              ? "text-amber-500"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={isBreakDay ? "Unset break day" : "Mark this day as break day"}
        >
          <Palmtree className="h-3.5 w-3.5" />
          {isBreakDay ? "Break Day Active" : "Mark as Break Day"}
        </Button>
        {!isBreakDay && (
          <p className="text-center text-[11px] text-muted-foreground">
            Incomplete tasks won&apos;t affect streaks.
          </p>
        )}
      </div>

      {(currentActivityId || timelineSessions.length > 0) && (
        <div className="mt-6 space-y-2">
          <div className="ml-1 mr-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Timeline
            </p>
            <span className="text-xs text-muted-foreground">
              {formatTimerDisplay(
                timelineSessions.reduce(
                  (total, session) => total + session.intervalMs,
                  0
                )
              )}
            </span>
          </div>
          <ActiveActivityPill
            currentActivityId={currentActivityId}
            activities={activities}
            groups={groups}
            elapsedMs={currentActivityElapsedMs}
            onStop={handleStopActivity}
            onEdit={
              runningSession
                ? () =>
                    setEditingSession({
                      groupId: runningSession.groupId,
                      sessionId: runningSession.sessionId,
                    })
                : undefined
            }
          />
          {timelineSessions.map((session) => {
            const isUnknown = !session.groupId;
            return (
              <ActivityTimelineItem
                key={session.id}
                activityName={session.name}
                groupColor={session.groupColor}
                intervalMs={session.intervalMs}
                activityId={session.activityId || ""}
                onClick={
                  isUnknown
                    ? () => openAssignDialog(session.id, session.intervalMs)
                    : () =>
                        setEditingSession({
                          groupId: session.groupId,
                          sessionId: session.id,
                        })
                }
                onStartActivity={
                  isToday && !isUnknown ? handleStartActivity : undefined
                }
              />
            );
          })}
        </div>
      )}

      <FooterActionsBar
        currentDate={currentDate}
        onDateChange={onDateChange}
        entryDates={entryDates}
        bookmarkedDates={bookmarkedDates}
        loadJournalMeta={loadJournalMeta}
        currentActivityId={currentActivityId}
        activities={activities}
        calculateActivityTotalTime={calculateActivityTotalTime}
        onStartActivity={handleStartActivity}
        onStopActivity={handleStopActivity}
        onAddManualActivityPeriod={addManualActivityPeriod}
        onAddQuickMemo={createOneTimeTask}
        groupOptions={groupOptions}
        onTasksDataChanged={onTasksDataChanged}
      />

      {assignPeriodId && (
        <AssignActivityDialog
          periodId={assignPeriodId}
          intervalMs={assignIntervalMs}
          open={assignDialogOpen}
          onOpenChange={(open) => {
            setAssignDialogOpen(open);
            if (!open) setAssignPeriodId(null);
          }}
          onSuccess={handleAssignSuccess}
        />
      )}

      {editingSession && (
        <SessionDetailsDialog
          groupId={editingSession.groupId}
          sessionId={editingSession.sessionId}
          open={editingSession !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSession(null);
            }
          }}
          onSessionUpdated={() => {
            void loadActivityPeriods();
          }}
        />
      )}

      <ManualTimeEntryDialog
        open={manualEntryActivityId !== null}
        activity={manualEntryActivity}
        group={manualEntryGroup}
        initialDate={currentDate}
        onOpenChange={(open) => {
          if (!open) {
            setManualEntryActivityId(null);
          }
        }}
        onSave={addManualActivityPeriod}
      />
    </div>
  );
}
