/** @vitest-environment jsdom */
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollaboraEditorUrlDocument } from '@/core/apollo/generated/apollo-hooks';
import { SAVE_STALL_TRIGGER_MS, useCollaboraSaveHealth } from './useCollaboraSaveHealth';

const DOC = 'doc-1';
const req = { query: CollaboraEditorUrlDocument, variables: { collaboraDocumentId: DOC } };
const okMock: MockedResponse = {
  request: req,
  result: {
    data: {
      collaboraEditorUrl: { __typename: 'CollaboraEditorUrlResult', editorUrl: 'https://x/y', accessTokenTTL: 1 },
    },
  },
};
const downMock: MockedResponse = { request: req, error: new Error('wopi-service unreachable') };

function wrapperWith(mocks: MockedResponse[]) {
  return ({ children }: PropsWithChildren) => <MockedProvider mocks={mocks}>{children}</MockedProvider>;
}

describe('useCollaboraSaveHealth', () => {
  afterEach(() => vi.useRealTimers());

  it('never probes (and stays available) while the document is saved', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCollaboraSaveHealth(DOC, 'saved'), { wrapper: wrapperWith([downMock]) });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SAVE_STALL_TRIGGER_MS * 3);
    });
    expect(result.current.serviceUnavailable).toBe(false);
  });

  it('flags service unavailable when saves stall AND the probe fails (a service is down)', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCollaboraSaveHealth(DOC, 'unsaved'), { wrapper: wrapperWith([downMock]) });
    expect(result.current.serviceUnavailable).toBe(false); // not yet — waiting out the stall window
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SAVE_STALL_TRIGGER_MS + 100);
    });
    expect(result.current.serviceUnavailable).toBe(true);
  });

  it('stays quiet when saves linger but the probe succeeds (backend up — the #9973 stale-flag case)', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCollaboraSaveHealth(DOC, 'unsaved'), { wrapper: wrapperWith([okMock]) });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SAVE_STALL_TRIGGER_MS + 100);
    });
    expect(result.current.serviceUnavailable).toBe(false);
  });
});
