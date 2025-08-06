import { Identifiable } from '@/core/utils/Identifiable';

export type RealTimeCollaborationState = {
  status: 'connecting' | 'connected' | 'disconnected' | 'authenticating' | 'authenticationFailed' | 'syncing' | string;
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
