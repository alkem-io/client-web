import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { InviteContributorsDialogProps } from './InviteContributorsProps';
import InviteVCsDialog from './InviteVCsDialog';
import InviteUsersDialog from './InviteUsersDialog';

const InviteContributorsDialog = (props: InviteContributorsDialogProps) => {
  switch (props.type) {
    case RoleSetContributorType.User:
      return <InviteUsersDialog {...props} />;
    case RoleSetContributorType.Virtual:
      return <InviteVCsDialog {...props} />;
    default:
      throw new Error('Unsupported contributor type!');
  }
};

export default InviteContributorsDialog;
