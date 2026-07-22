/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCollaboraPostMessage } from './useCollaboraPostMessage';

function makeIframeRef() {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return { ref: { current: iframe }, iframe };
}

function emit(iframe: HTMLIFrameElement, message: object) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(message), source: iframe.contentWindow }));
  });
}

describe('useCollaboraPostMessage', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('tracks save status from Doc_ModifiedStatus', () => {
    const { ref, iframe } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));
    emit(iframe, { MessageId: 'Doc_ModifiedStatus', Values: { Modified: true } });
    expect(result.current.saveStatus).toBe('unsaved');
    emit(iframe, { MessageId: 'Doc_ModifiedStatus', Values: { Modified: false } });
    expect(result.current.saveStatus).toBe('saved');
  });

  // Regression (H1): a one-off Collabora `Error` must not latch the error state — and thus the
  // health poll — for the whole session. A completed save is authoritative and clears it.
  it('recovers from an error state when a save subsequently completes', () => {
    const { ref, iframe } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));

    // A save-side error (not a `load` failure — that's reclassified as a connection drop).
    emit(iframe, { MessageId: 'Error', Values: { Cmd: 'save' } });
    expect(result.current.saveStatus).toBe('error');

    // Modified=true must NOT downgrade a visible error to 'unsaved'...
    emit(iframe, { MessageId: 'Doc_ModifiedStatus', Values: { Modified: true } });
    expect(result.current.saveStatus).toBe('error');

    // ...but a completed save (Modified=false) clears the error.
    emit(iframe, { MessageId: 'Doc_ModifiedStatus', Values: { Modified: false } });
    expect(result.current.saveStatus).toBe('saved');
  });

  it('ignores messages that do not originate from the editor iframe', () => {
    const { ref } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));
    act(() => {
      // No `source` → not from the iframe's content window.
      window.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({ MessageId: 'Doc_ModifiedStatus', Values: { Modified: true } }),
        })
      );
    });
    expect(result.current.saveStatus).toBe('saved'); // unchanged from initial
  });

  it('reflects connection status from App_LoadingStatus (Document_Loaded → connected)', () => {
    const { ref, iframe } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));
    expect(result.current.connectionStatus).toBe('connecting');
    emit(iframe, { MessageId: 'App_LoadingStatus', Values: { Status: 'Document_Loaded' } });
    expect(result.current.connectionStatus).toBe('connected');
  });

  it('surfaces a runtime (non-load) error to onError', () => {
    const { ref, iframe } = makeIframeRef();
    const onError = vi.fn();
    renderHook(() => useCollaboraPostMessage(ref, { onError }));
    emit(iframe, { MessageId: 'Error', Values: { Cmd: 'boom' } });
    expect(onError).toHaveBeenCalledWith('boom');
  });

  it('treats a load failure (docunloading) as a disconnect, not a save error, and raises no toast', () => {
    const { ref, iframe } = makeIframeRef();
    const onError = vi.fn();
    const { result } = renderHook(() => useCollaboraPostMessage(ref, { onError }));

    // Collabora rejects a reopen while the previous session is still unloading.
    emit(iframe, { MessageId: 'Error', Values: { Cmd: 'load', Kind: 'docunloading' } });
    expect(result.current.connectionStatus).toBe('disconnected');
    expect(result.current.lastError).toBe('docunloading');
    // A blocked load is a connection drop, not a failed save — the save chip must not latch to error.
    expect(result.current.saveStatus).not.toBe('error');
    // …and the disconnect banner owns the messaging — no scary, redundant global error toast (FR-003).
    expect(onError).not.toHaveBeenCalled();
  });

  it('fires onDocumentReloaded on a re-emitted Document_Loaded (reconnect after rename), not the first', () => {
    const { ref, iframe } = makeIframeRef();
    const onDocumentReloaded = vi.fn();
    renderHook(() => useCollaboraPostMessage(ref, { onDocumentReloaded }));

    emit(iframe, { MessageId: 'App_LoadingStatus', Values: { Status: 'Document_Loaded' } }); // initial open
    expect(onDocumentReloaded).not.toHaveBeenCalled();

    emit(iframe, { MessageId: 'App_LoadingStatus', Values: { Status: 'Document_Loaded' } }); // reconnect
    expect(onDocumentReloaded).toHaveBeenCalledTimes(1);
  });
});
