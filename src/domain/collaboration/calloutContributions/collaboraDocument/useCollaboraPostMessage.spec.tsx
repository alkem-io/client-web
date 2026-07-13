/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
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
});
