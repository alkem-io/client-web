import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCollaboraPostMessage } from './useCollaboraPostMessage';

/** Minimal iframe stand-in whose contentWindow.postMessage we can assert on. */
function fakeIframeRef() {
  const postMessage = vi.fn();
  const iframe = { contentWindow: { postMessage } } as unknown as HTMLIFrameElement;
  return { ref: { current: iframe }, postMessage };
}

function parsePosted(call: unknown[]) {
  return JSON.parse(call[0] as string) as { MessageId: string; Values?: Record<string, unknown> };
}

describe('useCollaboraPostMessage', () => {
  it('renameInEditor completes the handshake then posts Action_RenameFile with the new name', () => {
    const { ref, postMessage } = fakeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));

    act(() => result.current.renameInEditor('Quarterly plan'));

    expect(postMessage).toHaveBeenCalledTimes(2);
    // First the one-time host handshake so Collabora accepts the command…
    expect(parsePosted(postMessage.mock.calls[0]).MessageId).toBe('Host_PostmessageReady');
    // …then the relabel request, targeted at any origin.
    const rename = parsePosted(postMessage.mock.calls[1]);
    expect(rename.MessageId).toBe('Action_RenameFile');
    expect(rename.Values).toEqual({ Name: 'Quarterly plan' });
    expect(postMessage.mock.calls[1][1]).toBe('*');
  });

  it('renameInEditor sends the handshake only once across repeated relabels', () => {
    const { ref, postMessage } = fakeIframeRef();
    const { result } = renderHook(() => useCollaboraPostMessage(ref));

    act(() => result.current.renameInEditor('First'));
    act(() => result.current.renameInEditor('Second'));

    const ids = postMessage.mock.calls.map(c => parsePosted(c).MessageId);
    expect(ids.filter(id => id === 'Host_PostmessageReady')).toHaveLength(1);
    expect(ids.filter(id => id === 'Action_RenameFile')).toHaveLength(2);
  });

  it('renameInEditor is a no-op when the iframe is not mounted', () => {
    const { result } = renderHook(() => useCollaboraPostMessage({ current: null }));
    expect(() => act(() => result.current.renameInEditor('x'))).not.toThrow();
  });
});
