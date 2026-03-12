import { useNavigate, useLocation } from "react-router-dom";
import { BarChart2 } from "lucide-react";

export default function ActivityNavMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="pointer-events-none fixed bottom-16 left-0 right-0 z-40 flex justify-center pb-2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background p-1 shadow-lg">
        <button
          onClick={() => navigate("/activities/stats")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            pathname === "/activities/stats"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          Stats
        </button>
      </div>
    </div>
  );
}
