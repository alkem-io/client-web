import { Identifiable } from '@/core/utils/Identifiable';

// Enum of all memo status values
export enum MemoStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}
// needs to support a wide variety of read-only reasons for the different features
export enum ReadOnlyCode {
  NOT_AUTHENTICATED = 'notAuthenticated',
  NO_UPDATE_ACCESS = 'noUpdateAccess',
  ROOM_CAPACITY_REACHED = 'roomCapacityReached',
  MULTI_USER_NOT_ALLOWED = 'multiUserNotAllowed',
}

export const MEMO_STATUS_VALUES = Object.values(MemoStatus);

export type CollaborationStatus = (typeof MEMO_STATUS_VALUES)[number];

export const isCollaborationStatus = (value: string): value is CollaborationStatus => {
  return MEMO_STATUS_VALUES.includes(value as CollaborationStatus);
};

export type RealTimeCollaborationState = {
  status: CollaborationStatus;
  synced: boolean;
  lastActive?: Date;
  readOnly?: boolean;
  readOnlyCode?: ReadOnlyCode;
  users: Array<
    Identifiable & {
      profile: {
        displayName: string;
      };
      color: string;
    }
  >;
};
