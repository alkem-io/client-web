import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeCall, getCallOverlay, openCall, subscribeCallOverlay } from './callOverlayStore';

const first = { matrixRoomId: '!one:hs', intent: 'start_call' } as const;
const second = { matrixRoomId: '!two:hs', intent: 'join_existing_voice' } as const;

const currentWidgetId = (): string => getCallOverlay()?.widgetId ?? '';

describe('callOverlayStore', () => {
  afterEach(() => {
    closeCall(currentWidgetId());
  });

  it('opening a call publishes it with a fresh widget id', () => {
    openCall(first);
    const session = getCallOverlay();
    expect(session).toMatchObject(first);
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
    closeCall(currentWidgetId());
    expect(getCallOverlay()).toBeNull();
  });

  it('closing a call that was replaced leaves the newer call open', () => {
    openCall(first);
    const replaced = currentWidgetId();
    openCall(second);
    closeCall(replaced);
    expect(getCallOverlay()).toMatchObject(second);
  });

  it('notifies listeners once per change and not after unsubscribing', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCallOverlay(listener);
    openCall(first);
    expect(listener).toHaveBeenCalledTimes(1);
    const widgetId = currentWidgetId();
    closeCall(widgetId);
    expect(listener).toHaveBeenCalledTimes(2);
    closeCall(widgetId);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    openCall(first);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
