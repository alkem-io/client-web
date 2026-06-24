import { useRef } from 'react';
import { assistantEndpoint } from '@/main/constants/endpoints';
import type { AssistantStreamEvent, AssistantStreamEventName } from './types';

/**
 * Net-new SSE transport for the AI assistant.
 *
 * Uses `fetch` + a `ReadableStream` reader rather than `EventSource`, because:
 *   - the request is a POST **with a body** (the user message / confirmation decision);
 *   - it must be cancellable via `AbortController`;
 *   - reconnect must set the `Last-Event-ID` **request header** ourselves
 *     (`fetch`+`ReadableStream` has no native auto-reconnect — that is
 *     EventSource-only behaviour, browser-assistant-sse.md § Resumability).
 *
 * Auth is the same-origin Kratos session cookie (`credentials: 'include'`); the
 * browser sends **no** Authorization header and holds **no** model/MCP
 * credentials (FR-007/SC-006). The edge converts the cookie into the upstream JWT.
 *
 * The frame parser tolerates `:keepalive` comments (~every 15s) and multi-line
 * `data:` fields per the SSE spec.
 */

const KNOWN_EVENTS = new Set<AssistantStreamEventName>([
  'token',
  'tool-activity',
  'tool-result',
  'confirmation-request',
  'message',
  'done',
  'error',
]);

type RawFrame = { event?: string; data: string; id?: string };

/**
 * Parse a single raw SSE frame (text between blank-line separators) into its
 * `event` / `data` / `id` fields. Returns `null` for comment-only frames
 * (`:keepalive`) or frames with no data.
 */
export function parseSseFrame(block: string): RawFrame | null {
  let event: string | undefined;
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    // Comment line (e.g. `:keepalive`) — ignore.
    if (line.startsWith(':')) {
      continue;
    }
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    // Per spec, a single space after the colon is stripped.
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) {
      value = value.slice(1);
    }
    switch (field) {
      case 'event':
        event = value;
        break;
      case 'data':
        dataLines.push(value);
        break;
      case 'id':
        id = value;
        break;
      default:
        break;
    }
  }

  if (dataLines.length === 0) {
    return null;
  }
  return { event, data: dataLines.join('\n'), id };
}

function toTypedEvent(frame: RawFrame): AssistantStreamEvent | null {
  const name = (frame.event ?? 'message') as AssistantStreamEventName;
  if (!KNOWN_EVENTS.has(name)) {
    return null;
  }
  let data: unknown;
  try {
    data = JSON.parse(frame.data);
  } catch {
    return null;
  }
  return { event: name, data, id: frame.id } as AssistantStreamEvent;
}

export type AssistantStreamHandlers = {
  onEvent: (event: AssistantStreamEvent) => void;
  /** Called once the stream ends (server closed it after `done`/`error`). */
  onClose?: () => void;
  /** Network/transport failure (NOT a protocol `error` event). */
  onTransportError?: (error: unknown) => void;
};

export type StreamRequest = {
  /** Path appended to the assistant base path, e.g. `/conversations/{id}/messages`. */
  path: string;
  /** JSON request body (the user message, or the confirmation decision). */
  body: unknown;
  /** Abort signal for cancellation. */
  signal: AbortSignal;
  /** Last seen event `id:` for in-flight reconnect (Last-Event-ID request header). */
  lastEventId?: string;
};

/**
 * POST to an assistant SSE endpoint and dispatch parsed events. Resolves when
 * the stream closes; rejects only on transport failure (never on a protocol
 * `error` event — those are dispatched through `onEvent`).
 */
export async function streamAssistant(
  request: StreamRequest,
  handlers: Pick<AssistantStreamHandlers, 'onEvent'>
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  if (request.lastEventId) {
    headers['Last-Event-ID'] = request.lastEventId;
  }

  const response = await fetch(`${assistantEndpoint}${request.path}`, {
    method: 'POST',
    // Same-origin cookie auth ONLY — no Authorization header (FR-007/SC-006).
    credentials: 'include',
    headers,
    body: JSON.stringify(request.body),
    signal: request.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Assistant stream failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const flushFrame = (block: string) => {
    const frame = parseSseFrame(block);
    if (!frame) {
      return;
    }
    const typed = toTypedEvent(frame);
    if (typed) {
      handlers.onEvent(typed);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line. Handle both \n\n and \r\n\r\n.
    let separatorIndex = findFrameBoundary(buffer);
    while (separatorIndex !== -1) {
      const block = buffer.slice(0, separatorIndex.start);
      buffer = buffer.slice(separatorIndex.end);
      flushFrame(block);
      separatorIndex = findFrameBoundary(buffer);
    }
  }

  // Flush any trailing frame without a final blank line.
  if (buffer.trim().length > 0) {
    flushFrame(buffer);
  }
}

type FrameBoundary = { start: number; end: number };

function findFrameBoundary(buffer: string): FrameBoundary | -1 {
  const lf = buffer.indexOf('\n\n');
  const crlf = buffer.indexOf('\r\n\r\n');
  if (lf === -1 && crlf === -1) {
    return -1;
  }
  if (crlf !== -1 && (lf === -1 || crlf < lf)) {
    return { start: crlf, end: crlf + 4 };
  }
  return { start: lf, end: lf + 2 };
}

/**
 * Hook wrapper around {@link streamAssistant} that owns an `AbortController` so
 * a turn can be cancelled (component unmount, new message while streaming, or an
 * explicit stop). Re-invoking `start` aborts any prior in-flight stream.
 */
export const useAssistantStream = () => {
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  };

  const start = async (request: Omit<StreamRequest, 'signal'>, handlers: AssistantStreamHandlers): Promise<void> => {
    cancel();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      await streamAssistant({ ...request, signal: controller.signal }, { onEvent: handlers.onEvent });
      handlers.onClose?.();
    } catch (error) {
      // An intentional abort is not a transport error.
      if (controller.signal.aborted) {
        return;
      }
      handlers.onTransportError?.(error);
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  };

  return { start, cancel };
};
