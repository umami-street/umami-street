import { NextRequest, NextResponse } from "next/server";
import { readAgentState, writeAgentState, isAgentOnline } from "../_utils";

export async function GET() {
  const state = readAgentState();
  return NextResponse.json({
    online: isAgentOnline(state),
    agent_name: state.agent_name,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const state = readAgentState();
  if (body.action === "offline") {
    writeAgentState({ ...state, last_heartbeat: null });
  } else {
    writeAgentState({
      agent_name: body.agent_name || state.agent_name,
      last_heartbeat: new Date().toISOString(),
    });
  }
  return NextResponse.json({ ok: true });
}
