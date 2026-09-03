import type {
  RoleSetInvitationResultNotice,
  RoleSetInvitationResultType,
} from '@/core/apollo/generated/graphql-schema';

type InvitationResultModel = {
  type: RoleSetInvitationResultType;
  notice?: RoleSetInvitationResultNotice | null;
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
