import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { isAgentOnline } from "../_utils";

export const runtime = "edge";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_agent_state")
    .select("agent_name, last_heartbeat")
    .eq("id", 1)
    .single();

  return NextResponse.json({
    online: isAgentOnline(data?.last_heartbeat ?? null),
    agent_name: data?.agent_name ?? "",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = await createClient();

  const updates =
    body.action === "offline"
      ? { last_heartbeat: null }
      : {
          agent_name: body.agent_name || undefined,
          last_heartbeat: new Date().toISOString(),
        };

  await supabase.from("chat_agent_state").update(updates).eq("id", 1);
  return NextResponse.json({ ok: true });
}
