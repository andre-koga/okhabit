"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TablesInsert } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import { COLOR_PALETTE } from "@/lib/colors";

interface NewGroupFormProps {
  userId: string;
}

export default function NewGroupForm({ userId }: NewGroupFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    color: COLOR_PALETTE[0].value,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Group name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const insertPayload: TablesInsert<"activity_groups"> = {
        user_id: userId,
        name: formData.name.trim(),
        color: formData.color,
        is_archived: false,
      };

      const { error: insertError } = await supabase
        .from("activity_groups")
        .insert(insertPayload);

      if (insertError) throw insertError;

      // Redirect back to activities page
      router.push("/activities");
      router.refresh();
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Failed to create group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Activity Group</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Work, Health, Personal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, color: color.value })
                      }
                      className={`h-6 rounded-md border-2 transition-all ${
                        formData.color === color.value
                          ? "border-primary scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      <span className="sr-only">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
