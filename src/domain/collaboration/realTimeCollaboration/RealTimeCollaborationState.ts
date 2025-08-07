import { Identifiable } from '@/core/utils/Identifiable';

// Array of all available memo status values
export const COLLABORATION_STATUS_VALUES = [
  'connecting',
  'connected',
  'disconnected',
  'authenticating',
  'authenticationFailed',
  'syncing',
  'unknown',
] as const;

// Derive the type from the array to ensure they stay in sync
export type CollaborationStatus = (typeof COLLABORATION_STATUS_VALUES)[number];

// Check if a string is a valid CollaborationStatus
export const isCollaborationStatus = (value: string): value is CollaborationStatus => {
  return COLLABORATION_STATUS_VALUES.includes(value as CollaborationStatus);
};

export type RealTimeCollaborationState = {
  status: CollaborationStatus;
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
