import { RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';

type InvitationResultModel = {
  type: RoleSetInvitationResultType;
  invitation?: {
    id: string;
    contributor: {
      id: string;
      profile: { displayName: string };
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
