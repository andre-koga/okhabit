import { createClient } from "@/lib/supabase/server";

async function UserDetails(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return "";
  }

  return JSON.stringify(data.claims, null, 2);
}

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5"></div>
      </div>
    </main>
  );
}
