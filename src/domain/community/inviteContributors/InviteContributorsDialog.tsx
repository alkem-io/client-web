import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { InviteContributorsDialogProps } from './InviteContributorsProps';
import InviteUsersDialog from './users/InviteUsersDialog';
import InviteVCsDialog from './virtualContributors/InviteVCsDialog';

const InviteContributorsDialog = (props: InviteContributorsDialogProps) => {
  switch (props.type) {
    case ActorType.User:
      return <InviteUsersDialog {...props} />;
    case ActorType.VirtualContributor:
      return <InviteVCsDialog {...props} />;
    default:
      throw new Error('Unsupported contributor type!');
  }
};

export default InviteContributorsDialog;
