import { Identifiable } from '@/core/utils/Identifiable';

// Enum of all memo status values
export enum MemoStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
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
  users: Array<
    Identifiable & {
      profile: {
        displayName: string;
      };
      color: string;
    }
  >;
};
