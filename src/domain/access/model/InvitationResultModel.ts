import { RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';

type InvitationResultModel = {
  id: string;
  result: RoleSetInvitationResultType;
  displayName: string;
} & (
  | {
      type: 'existingContributor';
      userId: string;
    }
  | {
      type: 'platformInvitation';
      email: string;
    }
);

export default InvitationResultModel;
