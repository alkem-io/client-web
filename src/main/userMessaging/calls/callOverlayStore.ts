import { useSyncExternalStore } from 'react';
import type { CallIntent } from './widgetUrl';

/**
 * The one call this tab hosts, or null. A module-level store rather than
 * React state so the call outlives the chat panel and every route change:
 * the chat panel only writes it, the overlay host mounted at the root reads it.
 */
type CallOverlaySession = {
  readonly alkemioRoomId: string;
  readonly matrixRoomId: string;
  readonly intent: CallIntent;
  readonly widgetId: string;
  /** True once the call UI is up and talking to the host. */
  readonly ready: boolean;
};

type OpenCallInput = Pick<CallOverlaySession, 'alkemioRoomId' | 'matrixRoomId' | 'intent'>;

type Listener = () => void;

let current: CallOverlaySession | null = null;
const listeners = new Set<Listener>();

const publish = (next: CallOverlaySession | null): void => {
  if (current === next) {
    return;
  }
  current = next;
  for (const listener of listeners) {
    listener();
  }
};

/** Opens the overlay for a call; a call already open in this tab is replaced. */
const openCall = ({ alkemioRoomId, matrixRoomId, intent }: OpenCallInput): void => {
  publish({ alkemioRoomId, matrixRoomId, intent, widgetId: crypto.randomUUID(), ready: false });
};

const closeCall = (): void => {
  publish(null);
};

/** Marks the call UI of the given overlay session as ready; ignored once that session is gone. */
const markReady = (widgetId: string): void => {
  if (current && current.widgetId === widgetId && !current.ready) {
    publish({ ...current, ready: true });
  }
};

const getCallOverlay = (): CallOverlaySession | null => current;

const subscribeCallOverlay = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const useCallOverlay = (): CallOverlaySession | null =>
  useSyncExternalStore(subscribeCallOverlay, getCallOverlay, () => null);

export { closeCall, getCallOverlay, markReady, openCall, subscribeCallOverlay, useCallOverlay };
export type { CallOverlaySession, OpenCallInput };
