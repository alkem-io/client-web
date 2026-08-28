import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as lib0String from 'lib0/string';
import { type Awareness, applyAwarenessUpdate, encodeAwarenessUpdate } from 'y-protocols/awareness';
import {
  messageYjsSyncStep1,
  messageYjsSyncStep2,
  messageYjsUpdate,
  readSyncMessage,
  writeSyncStep1,
  writeUpdate,
} from 'y-protocols/sync';
import type * as Y from 'yjs';
import { ReadOnlyCode } from '@/core/ui/forms/CollaborativeMarkdownInput/stateless-messaging/read.only.code';
import type { EphemeralEvent } from '@/domain/common/whiteboard/excalidraw/collab/awarenessRouter';

export const WIRE = {
  SYNC: 0,
  AWARENESS: 1,
  EPHEMERAL: 2,
  CONTROL: 3,
  DURABILITY_REQUEST: 4,
  HEARTBEAT: 5,
} as const;

export type ControlMessage = {
  kind:
    | 'saved'
    | 'save-error'
    | 'read-only-state'
    | 'collaborator-mode'
    | 'room-user-change'
    | 'update-rejected'
    | 'session-end'
    | 'persisted'
    | 'persist-failed';
  version?: number;
  requestId?: string;
  error?: string;
  readOnly?: boolean;
  reason?: string;
  mode?: 'read' | 'write';
  users?: number;
  code?: string;
  scope?: 'member' | 'document';
  disposition?: 'transient' | 'terminal' | 'manual';
};

export type SceneSyncPort = {
  encodeSceneStateVector: () => Uint8Array;
  encodeSceneAsUpdate: (format: 'v1', targetStateVector?: Uint8Array) => Uint8Array;
  applyRemoteSceneUpdate: (update: Uint8Array, format: 'v1') => void;
  onLocalSceneUpdate: (listener: (update: Uint8Array) => void, format: 'v1') => () => void;
};

export type IncomingFrameHandlers = {
  awareness: Awareness;
  doc: Y.Doc;
  scenePort: SceneSyncPort | null;
  origin: unknown;
  send: (bytes: Uint8Array) => void;
  onReady: () => void;
  onControl: (message: ControlMessage) => void;
  onEphemeral: (event: EphemeralEvent) => void;
  onHeartbeat: () => void;
};

export function createSyncStep1Frame(doc: Y.Doc, scenePort: SceneSyncPort | null): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.SYNC);
  if (scenePort) {
    encoding.writeVarUint(encoder, messageYjsSyncStep1);
    encoding.writeVarUint8Array(encoder, scenePort.encodeSceneStateVector());
  } else {
    writeSyncStep1(encoder, doc);
  }
  return encoding.toUint8Array(encoder);
}

export function handleIncomingFrame(bytes: Uint8Array, handlers: IncomingFrameHandlers): void {
  const decoder = decoding.createDecoder(bytes);
  const messageType = decoding.readVarUint(decoder);

  switch (messageType) {
    case WIRE.SYNC: {
      const reply = encoding.createEncoder();
      encoding.writeVarUint(reply, WIRE.SYNC);
      const syncType = handlers.scenePort
        ? readSceneSyncMessage(decoder, reply, handlers.scenePort)
        : readSyncMessage(decoder, reply, handlers.doc, handlers.origin);
      if (encoding.length(reply) > 1) handlers.send(encoding.toUint8Array(reply));
      if (syncType === messageYjsSyncStep2) handlers.onReady();
      return;
    }
    case WIRE.AWARENESS:
      applyAwarenessUpdate(handlers.awareness, decoding.readVarUint8Array(decoder), handlers.origin);
      return;
    case WIRE.EPHEMERAL: {
      const event = readVarStringJson(decoder) as EphemeralEvent | undefined;
      if (event && typeof event.type === 'string') handlers.onEphemeral(event);
      return;
    }
    case WIRE.CONTROL: {
      const message = readRawJson(decoder) as ControlMessage | undefined;
      if (message && typeof message.kind === 'string') handlers.onControl(message);
      return;
    }
    case WIRE.HEARTBEAT:
      handlers.onHeartbeat();
      return;
    default:
      return;
  }
}

export function createUpdateFrame(update: Uint8Array): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.SYNC);
  writeUpdate(encoder, update);
  return encoding.toUint8Array(encoder);
}

export function createAwarenessFrame(awareness: Awareness, clients: number[]): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.AWARENESS);
  encoding.writeVarUint8Array(encoder, encodeAwarenessUpdate(awareness, clients));
  return encoding.toUint8Array(encoder);
}

export function createEphemeralFrame(event: EphemeralEvent): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.EPHEMERAL);
  encoding.writeVarString(encoder, JSON.stringify(event));
  return encoding.toUint8Array(encoder);
}

export function createJsonFrame(type: number, body: unknown): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, type);
  encoding.writeUint8Array(encoder, lib0String.encodeUtf8(JSON.stringify(body)));
  return encoding.toUint8Array(encoder);
}

export function createHeartbeatFrame(): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, WIRE.HEARTBEAT);
  return encoding.toUint8Array(encoder);
}

function readSceneSyncMessage(decoder: decoding.Decoder, encoder: encoding.Encoder, port: SceneSyncPort): number {
  const messageType = decoding.readVarUint(decoder);
  switch (messageType) {
    case messageYjsSyncStep1:
      encoding.writeVarUint(encoder, messageYjsSyncStep2);
      encoding.writeVarUint8Array(encoder, port.encodeSceneAsUpdate('v1', decoding.readVarUint8Array(decoder)));
      break;
    case messageYjsSyncStep2:
    case messageYjsUpdate:
      port.applyRemoteSceneUpdate(decoding.readVarUint8Array(decoder), 'v1');
      break;
    default:
      throw new Error('Unknown message type');
  }
  return messageType;
}

function readVarStringJson(decoder: decoding.Decoder): unknown {
  try {
    return JSON.parse(decoding.readVarString(decoder));
  } catch {
    return undefined;
  }
}

function readRawJson(decoder: decoding.Decoder): unknown {
  try {
    return JSON.parse(lib0String.decodeUtf8(decoding.readTailAsUint8Array(decoder)));
  } catch {
    return undefined;
  }
}

export function controlReasonToReadOnlyCode(reason: string | undefined): ReadOnlyCode | undefined {
  switch (reason) {
    case 'not-authenticated':
      return ReadOnlyCode.NOT_AUTHENTICATED;
    case 'no-update-access':
      return ReadOnlyCode.NO_UPDATE_ACCESS;
    case 'room-capacity-reached':
      return ReadOnlyCode.ROOM_CAPACITY_REACHED;
    case 'multi-user-not-allowed':
      return ReadOnlyCode.MULTI_USER_NOT_ALLOWED;
    default:
      return undefined;
  }
}
