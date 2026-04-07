import { useParams } from "react-router-dom";

export default function ActivityStatsPage() {
  const { activityId } = useParams<{ activityId: string }>();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <p className="mb-4 text-4xl">📈</p>
      <h1 className="mb-2 text-2xl font-bold">Activity Stats</h1>
      <p className="text-muted-foreground">
        Coming soon - detailed insights for activity {activityId ?? "unknown"}.
      </p>
    </div>
  );
}
