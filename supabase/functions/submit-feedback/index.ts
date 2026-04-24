import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const feedbackToEmail = Deno.env.get("FEEDBACK_TO_EMAIL");
const feedbackFromEmail = Deno.env.get("FEEDBACK_FROM_EMAIL");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

if (!resendApiKey || !feedbackToEmail || !feedbackFromEmail) {
  throw new Error(
    "Missing RESEND_API_KEY, FEEDBACK_TO_EMAIL, or FEEDBACK_FROM_EMAIL"
  );
}

interface FeedbackPayload {
  message?: unknown;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json(401, { error: "Missing bearer token" });

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);
  if (userError || !user) return json(401, { error: "Invalid auth token" });

  let payload: FeedbackPayload;
  try {
    payload = (await request.json()) as FeedbackPayload;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) return json(400, { error: "Feedback message is required" });
  if (message.length > 5000) {
    return json(400, { error: "Feedback message is too long" });
  }

  const emailText = [
    "New OkHabit feedback submission",
    "",
    `User ID: ${user.id}`,
    `Email: ${user.email ?? "(not available)"}`,
    `Submitted at: ${new Date().toISOString()}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: feedbackFromEmail,
      to: [feedbackToEmail],
      subject: "OkHabit feedback request",
      text: emailText,
    }),
  });

  if (!emailResponse.ok) {
    const responseBody = await emailResponse.text();
    console.error("Resend send failed:", responseBody);
    return json(502, { error: "Failed to send feedback email" });
  }

  if (supabaseServiceRoleKey) {
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { error: insertError } = await adminClient.from("app_feedback").insert({
      user_id: user.id,
      message,
    });
    if (insertError) {
      console.error("feedback insert failed:", insertError.message);
    }
  }

  return json(200, { ok: true });
});
