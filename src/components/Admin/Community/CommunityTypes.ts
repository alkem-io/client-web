import { CommunityDetailsFragment } from '../../../models/graphql-schema';
import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';

export interface WithCommunity {
  community?: CommunityDetailsFragment;
}

export interface WithParentMembersProps extends PageProps {
  parentMembers: Member[];
}

export interface WithOptionalMembersProps extends PageProps {
  parentMembers?: Member[];
}
