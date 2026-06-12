import type { AssistantStreamEvent } from '../types';

/** Encode typed events into a single SSE wire payload (event:/data:/id: frames). */
export function encodeSseFrames(events: AssistantStreamEvent[], { keepalive = true } = {}): string {
  const parts: string[] = [];
  for (const event of events) {
    if (keepalive) {
      parts.push(':keepalive\n\n');
    }
    let frame = `event: ${event.event}\n`;
    frame += `data: ${JSON.stringify(event.data)}\n`;
    if (event.id) {
      frame += `id: ${event.id}\n`;
    }
    frame += '\n';
    parts.push(frame);
  }
  return parts.join('');
}

/**
 * Build a mock `fetch` response whose body is a `ReadableStream` that emits the
 * given SSE payload in arbitrary chunk boundaries (to exercise the transport's
 * cross-chunk frame reassembly).
 */
export function mockSseResponse(
  payload: string,
  { chunkSize = 7, headers }: { chunkSize?: number; headers?: HeadersInit } = {}
): Response {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(payload);
  let offset = 0;

  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (offset >= bytes.length) {
        controller.close();
        return;
      }
      const end = Math.min(offset + chunkSize, bytes.length);
      controller.enqueue(bytes.slice(offset, end));
      offset = end;
    },
  });

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream', ...headers },
  });
}
