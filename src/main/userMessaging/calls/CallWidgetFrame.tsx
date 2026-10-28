import type { MatrixClient, MatrixEvent } from 'matrix-js-sdk';
import { ClientWidgetApi, type IWidgetApiRequest, Widget } from 'matrix-widget-api';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { closeCall } from './callOverlayStore';
import { ElementCallWidgetDriver, toRoomEvent } from './ElementCallWidgetDriver';

// matrix-js-sdk ClientEvent.Event and RoomStateEvent.Events, as strings so the SDK stays a lazily loaded chunk.
const CLIENT_EVENT = 'event';
const ROOM_STATE_EVENTS = 'RoomState.events';

/** Widget actions of the pinned call UI: it hangs up / closes, the host asks it to hang up. */
const HANGUP_ACTION = 'im.vector.hangup';
const CLOSE_ACTION = 'io.element.close';

/** How long the call UI gets to leave the call before the overlay closes regardless. */
const HANGUP_TIMEOUT_MS = 5_000;

type CallWidgetFrameProps = {
  widgetId: string;
  /** Same-origin address of the call UI for this call. */
  src: string;
  title: string;
  client: MatrixClient;
  matrixRoomId: string;
  livekitServiceUrl: string;
  /** Filled with "leave the call" while the call UI is mounted. */
  hangupRef: RefObject<(() => Promise<void>) | null>;
};

/**
 * The call UI's iframe and its widget-API link to the platform's Matrix
 * session. One instance per call: the host keys it by widget id, so the link is
 * built exactly once, before the iframe loads.
 */
export default function CallWidgetFrame({
  widgetId,
  src,
  title,
  client,
  matrixRoomId,
  livekitServiceUrl,
  hangupRef,
}: CallWidgetFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // The iframe's address is fixed for the life of the call: changing it would reload the call UI.
  const [frameSrc] = useState(src);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    const widget = new Widget({
      id: widgetId,
      creatorUserId: client.getUserId() ?? '',
      type: 'm.custom',
      url: new URL(frameSrc, window.location.origin).toString(),
    });
    const driver = new ElementCallWidgetDriver({ client, matrixRoomId, livekitServiceUrl });
    const api = new ClientWidgetApi(widget, iframe, driver);
    api.setViewedRoomId(matrixRoomId);
    const onPageHide = () => driver.sendPendingLeavesNow();
    window.addEventListener('pagehide', onPageHide);

    const onWidgetLeft = (event: CustomEvent<IWidgetApiRequest>) => {
      event.preventDefault();
      api.transport.reply(event.detail, {});
      closeCall(widgetId);
    };
    api.on(`action:${HANGUP_ACTION}`, onWidgetLeft);
    api.on(`action:${CLOSE_ACTION}`, onWidgetLeft);

    // Every event the chat server syncs, as the reference host feeds it. Unlike the room's
    // timeline this includes the synced copy of the call UI's own sends, which the call UI waits
    // for, and never a local echo or an event paginated in from the past.
    const onEvent = (event: MatrixEvent) => {
      if (event.getRoomId() === matrixRoomId) {
        api.feedEvent(toRoomEvent(event)).catch(() => {
          // The call UI may not be listening yet; it reads the room state itself once it is.
        });
      }
    };
    const onStateEvent = (event: MatrixEvent) => {
      if (event.getRoomId() === matrixRoomId) {
        api.feedStateUpdate(toRoomEvent(event)).catch(() => {
          // As above: a state update the call UI missed is part of the state it reads on start.
        });
      }
    };
    client.on(CLIENT_EVENT as never, onEvent as never);
    client.on(ROOM_STATE_EVENTS as never, onStateEvent as never);

    hangupRef.current = async () => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          api.transport.send(HANGUP_ACTION, {}),
          new Promise(resolve => {
            timer = setTimeout(resolve, HANGUP_TIMEOUT_MS);
          }),
        ]);
      } catch {
        // A call UI that cannot answer has nothing left to leave; its membership expires on its own.
      } finally {
        clearTimeout(timer);
      }
    };

    return () => {
      // The call UI is torn down with its leave possibly still unsent (sign-out, a replaced
      // session, a close before its membership synced); its own delayed leave would leave
      // the others seeing this device in the call for a while.
      driver.sendPendingLeavesNow();
      window.removeEventListener('pagehide', onPageHide);
      hangupRef.current = null;
      client.removeListener(CLIENT_EVENT as never, onEvent as never);
      client.removeListener(ROOM_STATE_EVENTS as never, onStateEvent as never);
      api.off(`action:${HANGUP_ACTION}`, onWidgetLeft);
      api.off(`action:${CLOSE_ACTION}`, onWidgetLeft);
      api.stop();
    };
  }, [client, matrixRoomId, livekitServiceUrl, widgetId, frameSrc, hangupRef]);

  return (
    <iframe
      ref={iframeRef}
      src={frameSrc}
      title={title}
      allow="camera; microphone; display-capture; autoplay; clipboard-write"
      className="size-full border-0"
    />
  );
}
