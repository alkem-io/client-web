/** @vitest-environment jsdom */
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollaboraServiceAvailableDocument } from '@/core/apollo/generated/apollo-hooks';
import { SAVE_STALL_TRIGGER_MS, useCollaboraSaveHealth } from './useCollaboraSaveHealth';

const DOC = 'doc-1';
const req = { query: CollaboraServiceAvailableDocument, variables: { collaboraDocumentId: DOC } };
const availableMock = (available: boolean): MockedResponse => ({
  request: req,
  result: { data: { collaboraServiceAvailable: available } },
});
const erroredMock: MockedResponse = { request: req, error: new Error('server unreachable') };

const wrapperWith = (mocks: MockedResponse[]) =>
  function Wrapper({ children }: PropsWithChildren) {
    return <MockedProvider mocks={mocks}>{children}</MockedProvider>;
  };

async function settleStall() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(SAVE_STALL_TRIGGER_MS + 100);
  });
}

describe('useCollaboraSaveHealth', () => {
  afterEach(() => vi.useRealTimers());

  it('never probes (stays available) while the document is saved', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCollaboraSaveHealth(DOC, 'saved'), {
      wrapper: wrapperWith([availableMock(false)]),
    });
    await settleStall();
    expect(result.current.serviceUnavailable).toBe(false);
  });

  it('flags a service outage when saves stall AND the health query reports unavailable', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCollaboraSaveHealth(DOC, 'unsaved'), {
      wrapper: wrapperWith([availableMock(false)]),
    });
    expect(result.current.serviceUnavailable).toBe(false); // waiting out the stall window
    await settleStall();
    expect(result.current.serviceUnavailable).toBe(true);
  });

  it('flags a service outage when the health query itself fails', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCollaboraSaveHealth(DOC, 'unsaved'), {
      wrapper: wrapperWith([erroredMock]),
    });
    await settleStall();
    expect(result.current.serviceUnavailable).toBe(true);
  });

  it('stays quiet when saves linger but health reports available (the #9973 stale-flag case)', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCollaboraSaveHealth(DOC, 'unsaved'), {
      wrapper: wrapperWith([availableMock(true)]),
    });
    await settleStall();
    expect(result.current.serviceUnavailable).toBe(false);
  });
});
