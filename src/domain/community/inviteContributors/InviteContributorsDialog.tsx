import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { InviteContributorDialogProps } from './InviteContributorsProps';
import InviteVCsDialog from './InviteVCsDialog';

const InviteContributorDialog = (props: InviteContributorDialogProps) => {
  switch (props.type) {
    case RoleSetContributorType.Virtual:
      return <InviteVCsDialog {...props} />;
    default:
      throw new Error('Unsupported contributor type!');
  }
};

export default InviteContributorDialog;
