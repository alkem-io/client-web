import { assistantEndpoint } from '@/main/constants/endpoints';
import type { AssistantConversation, AssistantMessage } from './types';

/**
 * REST client for the AI assistant JSON endpoints
 * (browser-assistant-sse.md § REST endpoints). The streaming POSTs live in
 * useAssistantStream.ts (SSE). Every request is same-origin and authenticated
 * by the Kratos session cookie only — `credentials: 'include'`, **no**
 * Authorization header, **no** model/MCP credentials in the browser
 * (FR-007/SC-006).
 */

const jsonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${assistantEndpoint}${path}`, {
    credentials: 'include',
    headers: jsonHeaders,
    ...init,
  });
  if (!response.ok) {
    throw new Error(`Assistant request failed: ${response.status} ${path}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/** List the signed-in user's conversations, most-recent first (US3). */
export function listConversations(): Promise<AssistantConversation[]> {
  return request<AssistantConversation[]>('/conversations');
}

/** Create a new conversation. */
export function createConversation(): Promise<{ id: string; createdAt: string }> {
  return request<{ id: string; createdAt: string }>('/conversations', { method: 'POST' });
}

/** Full message history for resume across reload/device (FR-011). */
export function getConversationMessages(
  conversationId: string
): Promise<{ conversationId: string; messages: AssistantMessage[] }> {
  return request<{ conversationId: string; messages: AssistantMessage[] }>(`/conversations/${conversationId}/messages`);
}

/** Delete a conversation (and terminate any MCP session). */
export function deleteConversation(conversationId: string): Promise<void> {
  return request<void>(`/conversations/${conversationId}`, { method: 'DELETE' });
}

/**
 * Resolve the single rolling conversation for the user (FR-011): the most
 * recent existing one, or a freshly created conversation if none exists. v1 has
 * no conversation switcher.
 */
export async function resolveRollingConversation(): Promise<string> {
  const conversations = await listConversations();
  if (conversations.length > 0) {
    return conversations[0].id;
  }
  const created = await createConversation();
  return created.id;
}

/**
 * Resolve the rolling conversation **with its current state** for rehydration
 * (US3). Returns the existing most-recent conversation (incl. `state`, e.g.
 * `awaiting_confirmation`) or null when the user has none yet — in which case
 * there is nothing to rehydrate and no conversation is created until the user
 * sends their first message.
 */
export async function resolveExistingRollingConversation(): Promise<AssistantConversation | null> {
  const conversations = await listConversations();
  return conversations.length > 0 ? conversations[0] : null;
}
