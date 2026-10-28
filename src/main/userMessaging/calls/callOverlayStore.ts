import { useSyncExternalStore } from 'react';
import type { CallIntent } from './widgetUrl';

/**
 * The one call this tab hosts, or null. A module-level store rather than
 * React state so the call outlives the chat panel and every route change:
 * the chat panel only writes it, the overlay host mounted at the root reads it.
 */
type CallOverlaySession = {
  readonly matrixRoomId: string;
  readonly intent: CallIntent;
  readonly widgetId: string;
};

type OpenCallInput = Pick<CallOverlaySession, 'matrixRoomId' | 'intent'>;

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
const openCall = ({ matrixRoomId, intent }: OpenCallInput): void => {
  publish({ matrixRoomId, intent, widgetId: crypto.randomUUID() });
};

/** Closes the given call; a call opened after it in the meantime stays open. */
const closeCall = (widgetId: string): void => {
  if (current?.widgetId === widgetId) {
    publish(null);
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

export { closeCall, getCallOverlay, openCall, subscribeCallOverlay, useCallOverlay };
export type { CallOverlaySession, OpenCallInput };
