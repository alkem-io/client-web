/** How the call UI opens: a fresh call or joining a running one, with the camera on or off. */
type CallIntent = 'start_call' | 'start_call_voice' | 'join_existing' | 'join_existing_voice';

const ELEMENT_CALL_ENTRY = '/element-call/index.html';

type WidgetUrlInput = {
  widgetId: string;
  /** The platform origin the call UI talks back to over postMessage. */
  parentOrigin: string;
  matrixRoomId: string;
  userId: string;
  deviceId: string;
  /** The homeserver URL of the platform's own Matrix session. */
  baseUrl: string;
  intent: CallIntent;
  lang: string;
};

/**
 * Builds the address of the embedded call UI for one call. Always the entry
 * page itself (the bare directory would be answered by the SPA), with the
 * parameters in the fragment so user and device ids stay out of access logs.
 *
 * End-to-end encryption is switched off: conversation rooms are unencrypted
 * and the host does not relay device-to-device messages the call UI would
 * need for its keys.
 */
const buildElementCallWidgetUrl = ({
  widgetId,
  parentOrigin,
  matrixRoomId,
  userId,
  deviceId,
  baseUrl,
  intent,
  lang,
}: WidgetUrlInput): string => {
  const params = new URLSearchParams({
    widgetId,
    parentUrl: parentOrigin,
    roomId: matrixRoomId,
    userId,
    deviceId,
    baseUrl,
    intent,
    header: 'none',
    enableE2EE: 'false',
    perParticipantE2EE: 'false',
    lang,
  });
  return `${ELEMENT_CALL_ENTRY}#?${params.toString()}`;
};

export { buildElementCallWidgetUrl, ELEMENT_CALL_ENTRY };
export type { CallIntent, WidgetUrlInput };
