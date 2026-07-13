import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCollaboraPostMessage } from './useCollaboraPostMessage';

/** Minimal iframe stand-in whose contentWindow we can match against `event.source`. */
function fakeIframeRef() {
  const contentWindow = {} as Window;
  const iframe = { contentWindow } as unknown as HTMLIFrameElement;
  return { ref: { current: iframe }, contentWindow };
}

function dispatchFromIframe(source: Window, payload: unknown) {
  // jsdom won't let us set MessageEvent.source, so dispatch a plain Event and
  // attach `source` + `data` — the hook only reads those two fields.
  const event = new Event('message') as MessageEvent;
  Object.defineProperty(event, 'source', { value: source });
  Object.defineProperty(event, 'data', { value: JSON.stringify(payload) });
  window.dispatchEvent(event);
}

const documentLoaded = { MessageId: 'App_LoadingStatus', Values: { Status: 'Document_Loaded' } };

describe('useCollaboraPostMessage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reflects connection status from App_LoadingStatus (Document_Loaded → connected)', () => {
    const { ref, contentWindow } = fakeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));

    expect(result.current.connectionStatus).toBe('connecting');
    act(() => dispatchFromIframe(contentWindow, documentLoaded));
    expect(result.current.connectionStatus).toBe('connected');
  });

  it('ignores messages that are not from the tracked iframe', () => {
    const { ref } = fakeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));

    act(() => dispatchFromIframe({} as Window, documentLoaded)); // different source
    expect(result.current.connectionStatus).toBe('connecting');
  });

  it('surfaces a runtime error to onError', () => {
    const { ref, contentWindow } = fakeIframeRef();
    const onError = vi.fn();
    renderHook(() => useCollaboraPostMessage(ref, { onError }));

    act(() => dispatchFromIframe(contentWindow, { MessageId: 'Error', Values: { Cmd: 'boom' } }));
    expect(onError).toHaveBeenCalledWith('boom');
  });

  it('treats a load failure (docunloading) as a disconnect, not a save error', () => {
    const { ref, contentWindow } = fakeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));

    // Collabora rejects a reopen while the previous session is still unloading.
    act(() => dispatchFromIframe(contentWindow, { MessageId: 'Error', Values: { Cmd: 'load', Kind: 'docunloading' } }));
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.lastError).toBe('docunloading');
    // A blocked load is a connection drop, not a failed save — the save chip must not latch to error.
    expect(result.current.saveStatus).not.toBe('error');
  });

  it('fires onDocumentReloaded on a re-emitted Document_Loaded (Collabora reconnect after rename), not the first', () => {
    const { ref, contentWindow } = fakeIframeRef();
    const onDocumentReloaded = vi.fn();
    renderHook(() => useCollaboraPostMessage(ref, { onDocumentReloaded }));

    act(() => dispatchFromIframe(contentWindow, documentLoaded)); // initial open
    expect(onDocumentReloaded).not.toHaveBeenCalled();

    act(() => dispatchFromIframe(contentWindow, documentLoaded)); // reconnect after rename
    expect(onDocumentReloaded).toHaveBeenCalledTimes(1);
  });
});
