import fs from "fs";
import path from "path";

const DATA = path.join(process.cwd(), "data");

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

function readJSON<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(file: string, data: unknown) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2));
}

export const readSessions = (): ChatSession[] => readJSON("chat-sessions.json", []);
export const writeSessions = (s: ChatSession[]) => writeJSON("chat-sessions.json", s);
export const readMessages = (): ChatMessage[] => readJSON("chat-messages.json", []);
export const writeMessages = (m: ChatMessage[]) => writeJSON("chat-messages.json", m);
export const readAgentState = (): AgentState =>
  readJSON("chat-agent.json", { agent_name: "", last_heartbeat: null });
export const writeAgentState = (a: AgentState) => writeJSON("chat-agent.json", a);

export const HEARTBEAT_TIMEOUT_MS = 90 * 1000;

export function isAgentOnline(state: AgentState): boolean {
  if (!state.last_heartbeat) return false;
  return Date.now() - new Date(state.last_heartbeat).getTime() < HEARTBEAT_TIMEOUT_MS;
}
