import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeCall, getCallOverlay, markReady, openCall, subscribeCallOverlay } from './callOverlayStore';

const first = { alkemioRoomId: 'alk-1', matrixRoomId: '!one:hs', intent: 'start_call' } as const;
const second = { alkemioRoomId: 'alk-2', matrixRoomId: '!two:hs', intent: 'join_existing_voice' } as const;

describe('callOverlayStore', () => {
  afterEach(() => {
    closeCall();
  });

  it('opening a call publishes it with a fresh widget id, not yet ready', () => {
    openCall(first);
    const session = getCallOverlay();
    expect(session).toMatchObject({ ...first, ready: false });
    expect(session?.widgetId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('a second open replaces the first call with a new widget id', () => {
    openCall(first);
    const firstWidgetId = getCallOverlay()?.widgetId;
    openCall(second);
    expect(getCallOverlay()).toMatchObject(second);
    expect(getCallOverlay()?.widgetId).not.toBe(firstWidgetId);
  });

  it('closing clears the call', () => {
    openCall(first);
    closeCall();
    expect(getCallOverlay()).toBeNull();
  });

  it('marks only the current overlay session ready', () => {
    openCall(first);
    const stale = getCallOverlay()?.widgetId ?? '';
    openCall(second);
    markReady(stale);
    expect(getCallOverlay()?.ready).toBe(false);
    markReady(getCallOverlay()?.widgetId ?? '');
    expect(getCallOverlay()?.ready).toBe(true);
  });

  it('notifies listeners once per change and not after unsubscribing', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCallOverlay(listener);
    openCall(first);
    expect(listener).toHaveBeenCalledTimes(1);
    closeCall();
    expect(listener).toHaveBeenCalledTimes(2);
    closeCall();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    openCall(first);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
