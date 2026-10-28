import type { MatrixClient } from 'matrix-js-sdk';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useMatrixClient } from '@/core/matrix/activeClient';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { CLIENT_SYNC, resolveMatrixRoomId } from '@/main/userMessaging/matrix/matrixRooms';
import { isCallsConfigured } from './callConfig';

type CallableConversation = {
  /** The Alkemio room id of the conversation; the Matrix room is resolved from it. */
  readonly roomId: string;
  readonly isGroup: boolean;
  readonly isGuidance: boolean;
};

type CallEligibility = {
  readonly eligible: boolean;
  /** The resolved Matrix room, only while eligible. */
  readonly matrixRoomId: string | null;
};

const SYNCED_STATES = new Set(['PREPARED', 'SYNCING']);

const noop = () => {};

const useIsSynced = (client: MatrixClient | null): boolean =>
  useSyncExternalStore(
    listener => {
      if (!client) {
        return noop;
      }
      client.on(CLIENT_SYNC as never, listener as never);
      return () => client.removeListener(CLIENT_SYNC as never, listener as never);
    },
    () => (client ? SYNCED_STATES.has(client.getSyncState() ?? '') : false),
    () => false
  );

const isBetaTester = (platformRoles: readonly RoleName[] | undefined): boolean =>
  (platformRoles ?? []).includes(RoleName.FeatureBetaTester);

/**
 * Whether call controls may show for a conversation. The Feature Beta Tester
 * role only decides what this client renders — it is not access control: any
 * room member can still start or join a call from another Matrix client.
 *
 * Nothing shows until the chat session is synced and the conversation's
 * Matrix room is resolved; a group conversation, a configured environment
 * and the role are required as well.
 */
const useCallEligibility = (conversation: CallableConversation | null): CallEligibility => {
  const { platformRoles } = useCurrentUserContext();
  const client = useMatrixClient();
  const isSynced = useIsSynced(client);
  const candidateRoomId =
    conversation?.isGroup && !conversation.isGuidance && isBetaTester(platformRoles) && isCallsConfigured()
      ? conversation.roomId
      : null;

  const [resolved, setResolved] = useState<{
    client: MatrixClient;
    alkemioRoomId: string;
    matrixRoomId: string | null;
  } | null>(null);

  // Looked up once the session is synced, and again each time it syncs anew: a lookup that
  // failed while the chat server was unreachable is not remembered and would otherwise never retry.
  useEffect(() => {
    if (!client || !candidateRoomId || !isSynced) {
      return;
    }
    let cancelled = false;
    void resolveMatrixRoomId(client, candidateRoomId).then(matrixRoomId => {
      if (!cancelled) {
        setResolved({ client, alkemioRoomId: candidateRoomId, matrixRoomId });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [client, candidateRoomId, isSynced]);

  const matrixRoomId =
    resolved && resolved.client === client && resolved.alkemioRoomId === candidateRoomId ? resolved.matrixRoomId : null;
  const eligible = Boolean(candidateRoomId && client && isSynced && matrixRoomId);
  return { eligible, matrixRoomId: eligible ? matrixRoomId : null };
};

export { isBetaTester, useCallEligibility, useIsSynced };
export type { CallableConversation, CallEligibility };
