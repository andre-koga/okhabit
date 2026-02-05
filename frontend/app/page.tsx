import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PixelGrid from "@/components/pixel-grid";

async function DashboardOverview() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;

  if (error || !uid) {
    redirect("/auth/login");
  }

  return <PixelGrid userId={uid} />;
}

export default async function Home() {
  return (
    <main className="flex-1">
      <DashboardOverview />
    </main>
  );
}
