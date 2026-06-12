import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createConversation, listConversations } from '../assistantApi';
import type { AssistantStreamEvent } from '../types';
import { streamAssistant } from '../useAssistantStream';
import { encodeSseFrames, mockSseResponse } from './sseTestUtils';

const here = dirname(fileURLToPath(import.meta.url));
const assistantDir = join(here, '..');

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * SC-006: the assistant browser code holds NO model/MCP credentials and sends NO
 * Authorization header — only the same-origin Kratos session cookie
 * (`credentials: 'include'`). This guards the contract that the edge converts the
 * cookie into the upstream JWT and the browser never carries a bearer/secret.
 */
describe('no-secret / no-Authorization-header (SC-006)', () => {
  it('the SSE transport uses cookie auth only — no Authorization header, no secret', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        mockSseResponse(
          encodeSseFrames([{ event: 'done', data: { messageId: 'm1' }, id: '1' } as AssistantStreamEvent])
        )
      );

    await streamAssistant(
      { path: '/conversations/c1/messages', body: { content: 'hi' }, signal: new AbortController().signal },
      { onEvent: () => {} }
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    expect(init?.credentials).toBe('include');

    const headers = new Headers(init?.headers);
    expect(headers.has('authorization')).toBe(false);
    expect(headers.has('x-api-key')).toBe(false);
    // No header value resembles a bearer token / API key.
    headers.forEach(value => {
      expect(value.toLowerCase()).not.toContain('bearer ');
      expect(value).not.toMatch(/sk-[a-z0-9]/i);
    });
  });

  it('the REST client uses cookie auth only — no Authorization header', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(
        async () => new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })
      );

    await listConversations();
    await createConversation();

    for (const [, init] of fetchSpy.mock.calls) {
      expect(init?.credentials).toBe('include');
      const headers = new Headers(init?.headers);
      expect(headers.has('authorization')).toBe(false);
    }
  });

  it('the assistant source carries no model/MCP credential literals', () => {
    const files = [
      'useAssistantStream.ts',
      'assistantApi.ts',
      'AssistantContext.tsx',
      'useAssistantConversation.ts',
      'useAssistantEnabled.ts',
      'types.ts',
    ];
    // Forbidden: any hint of a model/MCP secret living in the browser bundle.
    const forbidden = [/sk-ant-/i, /ASSISTANT_LLM_API_KEY/, /MCP_URL/, /Authorization:\s*['"`]?Bearer/i, /x-api-key/i];
    for (const file of files) {
      const source = readFileSync(join(assistantDir, file), 'utf8');
      for (const pattern of forbidden) {
        expect(source, `${file} must not contain ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
