import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SELF_HEAL_WINDOW_MS, useCollaboraConnectionMonitor } from './useCollaboraConnectionMonitor';

function makeIframeRef() {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return { ref: { current: iframe }, iframe };
}

// Emulate a Collabora postMessage arriving from the editor iframe. The hook validates the
// message source against `iframe.contentWindow`, so we stamp the event accordingly.
function postFromIframe(iframe: HTMLIFrameElement, message: object) {
  window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(message), source: iframe.contentWindow }));
}

const loaded = { MessageId: 'App_LoadingStatus', Values: { Status: 'Document_Loaded' } };

describe('useCollaboraConnectionMonitor', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('starts connecting with no cause', () => {
    const { ref } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraConnectionMonitor(ref));
    expect(result.current.status).toBe('connecting');
    expect(result.current.cause).toBeNull();
  });

  it('enters reconnecting on a network blip and self-heals on online (no hard disconnect)', () => {
    const { ref, iframe } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraConnectionMonitor(ref));
    act(() => postFromIframe(iframe, loaded));
    expect(result.current.status).toBe('connected');

    // A transient network drop shows the soft reconnecting state, not a hard disconnect.
    act(() => window.dispatchEvent(new Event('offline')));
    expect(result.current.status).toBe('reconnecting');
    expect(result.current.cause).toBe('network');

    act(() => window.dispatchEvent(new Event('online')));
    expect(result.current.status).toBe('connected');
    expect(result.current.cause).toBeNull();
  });

  it('reports a service disconnect when Collabora closes the session', () => {
    const { ref, iframe } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraConnectionMonitor(ref));
    act(() => postFromIframe(iframe, loaded));
    act(() => postFromIframe(iframe, { MessageId: 'Session_Closed' }));
    expect(result.current.status).toBe('disconnected');
    expect(result.current.cause).toBe('service');
  });

  it('routes token expiry straight to disconnected (never reconnecting) when the TTL elapses', () => {
    vi.useFakeTimers();
    const { ref, iframe } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraConnectionMonitor(ref, { accessTokenTTL: 5000 }));
    act(() => postFromIframe(iframe, loaded));
    expect(result.current.status).toBe('connected');

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.status).toBe('disconnected');
    expect(result.current.cause).toBe('tokenExpiry');
    // Never parks in the self-heal `reconnecting` state — a token can't self-heal.
    expect(result.current.status).not.toBe('reconnecting');
  });

  it('does not arm the expiry timer when no TTL is known', () => {
    vi.useFakeTimers();
    const { ref, iframe } = makeIframeRef();
    const { result } = renderHook(() => useCollaboraConnectionMonitor(ref));
    act(() => postFromIframe(iframe, loaded));
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.status).toBe('connected');
    expect(result.current.cause).toBeNull();
  });

  describe('US3 self-heal, bounded escalation, and false positives', () => {
    it('escalates reconnecting → disconnected once the self-heal window elapses', () => {
      vi.useFakeTimers();
      const { ref, iframe } = makeIframeRef();
      const { result } = renderHook(() => useCollaboraConnectionMonitor(ref));
      act(() => postFromIframe(iframe, loaded));

      act(() => window.dispatchEvent(new Event('offline')));
      expect(result.current.status).toBe('reconnecting');

      act(() => vi.advanceTimersByTime(SELF_HEAL_WINDOW_MS));
      expect(result.current.status).toBe('disconnected');
      expect(result.current.cause).toBe('network');
    });

    it('never auto-remounts — the reconnect nonce is untouched through a disconnect', () => {
      vi.useFakeTimers();
      const { ref, iframe } = makeIframeRef();
      const { result } = renderHook(() => useCollaboraConnectionMonitor(ref));
      act(() => postFromIframe(iframe, loaded));
      const nonceBefore = result.current.reconnectNonce;

      act(() => window.dispatchEvent(new Event('offline')));
      act(() => vi.advanceTimersByTime(SELF_HEAL_WINDOW_MS * 2));
      expect(result.current.status).toBe('disconnected');
      expect(result.current.reconnectNonce).toBe(nonceBefore);
    });

    it('does not report a disconnect from mere silence (no offline/error/expiry) while online', () => {
      vi.useFakeTimers();
      const { ref, iframe } = makeIframeRef();
      const { result } = renderHook(() => useCollaboraConnectionMonitor(ref));
      act(() => postFromIframe(iframe, loaded));

      // A quiet period with no signals must NOT be treated as a disconnect (FR-014).
      act(() => vi.advanceTimersByTime(SELF_HEAL_WINDOW_MS * 3));
      expect(result.current.status).toBe('connected');
      expect(result.current.cause).toBeNull();
    });

    it('keeps a Collabora session-close as an immediate hard disconnect (no self-heal window)', () => {
      const { ref, iframe } = makeIframeRef();
      const { result } = renderHook(() => useCollaboraConnectionMonitor(ref));
      act(() => postFromIframe(iframe, loaded));
      act(() => postFromIframe(iframe, { MessageId: 'Session_Closed' }));
      expect(result.current.status).toBe('disconnected');
      expect(result.current.cause).toBe('service');
    });
  });
});
