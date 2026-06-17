import { assistantEndpoint } from '@/main/constants/endpoints';
import type { AssistantBudget, AssistantConversation, AssistantMessage } from './types';

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

/**
 * Read the signed-in user's monthly budget snapshot (D1 — meter source,
 * assistant-access-and-budget.md §7). The endpoint is owned by
 * **assistant-service** (asvc T056) and may not be deployed yet, so this MUST
 * degrade gracefully: a 404 (endpoint absent / not yet rolled out) or any
 * empty/204 body resolves to `null`, and the caller hides the meter. A real
 * non-404 failure still rejects so it isn't silently masked. No client
 * enforcement — purely informational.
 */
export async function getBudget(): Promise<AssistantBudget | null> {
  const response = await fetch(`${assistantEndpoint}/budget`, {
    credentials: 'include',
    headers: jsonHeaders,
  });
  // Endpoint not deployed yet (asvc T056) or no budget for this user → hide.
  if (response.status === 404 || response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Assistant budget request failed: ${response.status}`);
  }
  return (await response.json()) as AssistantBudget;
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
