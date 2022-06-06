import { OrganizationCardFragment, UserCardFragment } from '../../../models/graphql-schema';

export type ContributorType = 'leading' | 'member';

export interface Contributors {
  organizations: OrganizationCardFragment[];
  users: UserCardFragment[];
}
