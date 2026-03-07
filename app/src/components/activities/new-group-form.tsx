import { useNavigate } from "react-router-dom";
import { db, now, newId } from "@/lib/db";
import GroupFormFields from "./group-form-fields";

export default function NewGroupForm() {
  const navigate = useNavigate();

  const handleSubmit = async (data: { name: string; color: string }) => {
    const n = now();
    const id = newId();
    await db.activityGroups.add({
      id,
      name: data.name,
      color: data.color,
      is_archived: false,
      order_index: null,
      created_at: n,
      updated_at: n,
      synced_at: null,
      deleted_at: null,
    });
    navigate(`/activities/${id}`);
  };

  return (
    <GroupFormFields
      submitLabel="Create Group"
      initialData={{ name: "" }}
      onSubmit={handleSubmit}
    />
  );
}
