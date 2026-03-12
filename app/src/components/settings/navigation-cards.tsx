import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, ArrowUpDown } from "lucide-react";

export function ArchiveCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Archive className="h-4 w-4" />
          Archive
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          View and manage your archived activity groups and activities.
        </p>
        <Link to="/settings/archived">
          <Button variant="outline" className="flex w-full items-center gap-2">
            <Archive className="h-4 w-4" />
            View Archived Items
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function TaskOrderCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <ArrowUpDown className="h-4 w-4" />
          Task Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose the display order for scheduled tasks shown on the home page.
        </p>
        <Link to="/settings/task-order">
          <Button variant="outline" className="flex w-full items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Reorder Daily Tasks
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
