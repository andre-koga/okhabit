import { useNavigate } from "react-router-dom";
import { COLOR_PALETTE } from "@/lib/colors";
import { db, now } from "@/lib/db";
import type { ActivityGroup } from "@/lib/db/types";
import GroupFormFields from "./group-form-fields";

interface EditGroupFormProps {
  group: ActivityGroup;
}

export default function EditGroupForm({ group }: EditGroupFormProps) {
  const navigate = useNavigate();

  const handleSubmit = async (data: {
    name: string;
    color: string;
    emoji: string;
  }) => {
    await db.activityGroups.update(group.id, {
      name: data.name,
      color: data.color,
      emoji: data.emoji || null,
      updated_at: now(),
    });
    navigate(`/activities/${group.id}`);
  };

  return (
    <GroupFormFields
      title="Edit Activity Group"
      submitLabel="Save Changes"
      initialData={{
        name: group.name || "",
        color: group.color || COLOR_PALETTE[0].value,
        emoji: group.emoji || "",
      }}
      onSubmit={handleSubmit}
    />
  );
}
