/**
 * How the call UI opens: a fresh call or joining a running one, with the
 * camera on or off, in a group or a direct conversation.
 *
 * The direct-conversation intents make the call behave like a phone call: the
 * call UI skips its lobby, ends the call for the one left behind when the other
 * leaves, and a fresh call rings the other person, giving up when they do not
 * join within the ring's lifetime.
 */
type CallIntent =
  | 'start_call'
  | 'start_call_voice'
  | 'join_existing'
  | 'join_existing_voice'
  | 'start_call_dm'
  | 'start_call_dm_voice'
  | 'join_existing_dm'
  | 'join_existing_dm_voice';

type CallAction = 'start' | 'join';
type CallMedia = 'video' | 'voice';

const INTENTS: Record<'group' | 'direct', Record<CallAction, Record<CallMedia, CallIntent>>> = {
  group: {
    start: { video: 'start_call', voice: 'start_call_voice' },
    join: { video: 'join_existing', voice: 'join_existing_voice' },
  },
  direct: {
    start: { video: 'start_call_dm', voice: 'start_call_dm_voice' },
    join: { video: 'join_existing_dm', voice: 'join_existing_dm_voice' },
  },
};

const callIntentFor = ({ isGroup, action, media }: { isGroup: boolean; action: CallAction; media: CallMedia }) =>
  INTENTS[isGroup ? 'group' : 'direct'][action][media];

const isDirectCallIntent = (intent: CallIntent): boolean =>
  Object.values(INTENTS.direct).some(byMedia => Object.values(byMedia).includes(intent));

/** Where the call UI and its licence files are served; the copy targets in vite.element-call.mjs fill it. */
const ELEMENT_CALL_BASE = '/element-call/';
const ELEMENT_CALL_ENTRY = `${ELEMENT_CALL_BASE}index.html`;
/** The call UI's licence, licence texts and corresponding source, as one page. */
const ELEMENT_CALL_LICENSE_PAGE = `${ELEMENT_CALL_BASE}SOURCE.html`;

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

export {
  buildElementCallWidgetUrl,
  callIntentFor,
  ELEMENT_CALL_BASE,
  ELEMENT_CALL_ENTRY,
  ELEMENT_CALL_LICENSE_PAGE,
  isDirectCallIntent,
};
export type { CallAction, CallIntent, CallMedia, WidgetUrlInput };
