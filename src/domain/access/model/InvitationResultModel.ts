import type {
  RoleSetInvitationResultNotice,
  RoleSetInvitationResultType,
} from '@/core/apollo/generated/graphql-schema';

type InvitationResultModel = {
  type: RoleSetInvitationResultType;
  notice?: RoleSetInvitationResultNotice | null;
  /**
   * Identity of the invitee this result belongs to. Set for every result,
   * including the typed failures that create neither an invitation nor a
   * platform invitation, so results never have to be matched positionally.
   */
  invitedActorID?: string | null;
  invitedEmail?: string | null;
  invitation?: {
    id: string;
    actor: {
      id: string;
      profile?: { displayName: string };
    };
  };
  platformInvitation?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

export default InvitationResultModel;
