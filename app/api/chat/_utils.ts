export const HEARTBEAT_TIMEOUT_MS = 90 * 1000;

export type ChatSession = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_contact: string;
  concern_type: string;
  concern_background: string;
  status: "open" | "closed";
  unread_count: number;
  last_message: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  sender: "visitor" | "agent" | "system";
  agent_name?: string;
  message: string;
  created_at: string;
};

export type AgentState = {
  agent_name: string;
  last_heartbeat: string | null;
};

export function isAgentOnline(lastHeartbeat: string | null): boolean {
  if (!lastHeartbeat) return false;
  return Date.now() - new Date(lastHeartbeat).getTime() < HEARTBEAT_TIMEOUT_MS;
}
