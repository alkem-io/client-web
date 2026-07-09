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

  it('fires onDocumentReloaded on a re-load (2nd Document_Loaded) but NOT the initial load', () => {
    const { ref, contentWindow } = fakeIframeRef();
    const onDocumentReloaded = vi.fn();
    renderHook(() => useCollaboraPostMessage(ref, { onDocumentReloaded }));

    // Initial open — no reload signal.
    dispatchFromIframe(contentWindow, documentLoaded);
    expect(onDocumentReloaded).not.toHaveBeenCalled();

    // Collabora reloads the frame after an in-editor rename → this IS the signal.
    dispatchFromIframe(contentWindow, documentLoaded);
    expect(onDocumentReloaded).toHaveBeenCalledTimes(1);
  });

  it('ignores messages that are not from the tracked iframe', () => {
    const { ref } = fakeIframeRef();
    const onDocumentReloaded = vi.fn();
    renderHook(() => useCollaboraPostMessage(ref, { onDocumentReloaded }));

    dispatchFromIframe({} as Window, documentLoaded); // different source
    dispatchFromIframe({} as Window, documentLoaded);
    expect(onDocumentReloaded).not.toHaveBeenCalled();
  });

  it('reflects connection status from App_LoadingStatus', () => {
    const { ref, contentWindow } = fakeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));

    expect(result.current.connectionStatus).toBe('connecting');
    act(() => dispatchFromIframe(contentWindow, documentLoaded));
    expect(result.current.connectionStatus).toBe('connected');
  });
});
