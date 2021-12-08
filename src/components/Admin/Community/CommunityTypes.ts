import { Member } from '../../../models/User';
import { PageProps } from '../../../pages';

export interface WithCommunity {
  communityId?: string;
  parentCommunityId?: string;
}

export interface WithParentMembersProps extends PageProps {
  parentMembers: Member[];
}

export interface WithOptionalMembersProps extends PageProps {
  parentMembers?: Member[];
}
