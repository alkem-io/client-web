import { Identifiable } from '@/core/utils/Identifiable';

export type OnlineCollaborationState = {
  status: 'connecting' | 'connected' | 'disconnected' | 'authenticating' | 'syncing' | string;
  lastActive: Date;
  users: Array<
    Identifiable & {
      profile: {
        displayName: string;
      };
      color: string;
    }
  >;
};
