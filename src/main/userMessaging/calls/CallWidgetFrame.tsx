import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import { ClientWidgetApi, type IRoomEvent, type IWidgetApiRequest, Widget } from 'matrix-widget-api';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { ROOM_TIMELINE } from '@/main/userMessaging/matrix/matrixRooms';
import { closeCall, markReady } from './callOverlayStore';
import { ElementCallWidgetDriver } from './ElementCallWidgetDriver';

// matrix-js-sdk RoomStateEvent.Events, as a string so the SDK stays a lazily loaded chunk.
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

const toRoomEvent = (event: MatrixEvent): IRoomEvent => event.getEffectiveEvent() as unknown as IRoomEvent;

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

    const onReady = () => markReady(widgetId);
    const onWidgetLeft = (event: CustomEvent<IWidgetApiRequest>) => {
      event.preventDefault();
      api.transport.reply(event.detail, {});
      closeCall();
    };
    api.on('ready', onReady);
    api.on(`action:${HANGUP_ACTION}`, onWidgetLeft);
    api.on(`action:${CLOSE_ACTION}`, onWidgetLeft);

    const onTimeline = (event: MatrixEvent, room: Room | undefined, toStartOfTimeline: boolean) => {
      // Local echoes carry a temporary id; the call UI already knows its own sends by their real one.
      if (room?.roomId === matrixRoomId && !toStartOfTimeline && !event.status) {
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
    client.on(ROOM_TIMELINE as never, onTimeline as never);
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
      window.removeEventListener('pagehide', onPageHide);
      hangupRef.current = null;
      client.removeListener(ROOM_TIMELINE as never, onTimeline as never);
      client.removeListener(ROOM_STATE_EVENTS as never, onStateEvent as never);
      api.off('ready', onReady);
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
